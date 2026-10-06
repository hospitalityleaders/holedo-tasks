import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { createDrizzleClient } from "@kan/db/client";
import * as boardRepo from "@kan/db/repository/board.repo";
import * as listRepo from "@kan/db/repository/list.repo";
import * as userRepo from "@kan/db/repository/user.repo";
import * as workspaceRepo from "@kan/db/repository/workspace.repo";
import { generateUID } from "@kan/shared/utils";

import { hasAdminSession, hasValidOrigin } from "~/server/tasks-admin";

const db = createDrizzleClient();
const inputSchema = z.object({
  companyName: z.string().trim().min(2).max(100),
  ownerEmail: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
});

const listCompanies = async () => {
  const workspaces = await workspaceRepo.getAllCompanyWorkspaces(db);
  return workspaces.map((workspace) => ({
    publicId: workspace.publicId,
    name: workspace.name,
    slug: workspace.slug,
    ownerEmail: workspace.members[0]?.email ?? "",
    createdAt: workspace.createdAt,
  }));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!hasAdminSession(req)) {
    return res.status(401).json({ message: "Administrator access required" });
  }

  if (req.method === "GET") {
    return res.status(200).json(await listCompanies());
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ message: "Method not allowed" });
  }
  if (!hasValidOrigin(req)) {
    return res.status(403).json({ message: "Invalid request origin" });
  }

  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message });
  }

  const owner = await userRepo.getByEmail(db, parsed.data.ownerEmail);
  if (!owner) {
    return res.status(404).json({
      message: "That owner must sign in to Tasks once before provisioning.",
    });
  }
  const existing = await workspaceRepo.getActiveCompanyMembershipByUserId(
    db,
    owner.id,
  );
  if (existing) {
    return res.status(409).json({
      message: `${parsed.data.ownerEmail} already belongs to ${existing.workspaceName}.`,
    });
  }

  const publicId = generateUID();
  const workspace = await workspaceRepo.create(db, {
    publicId,
    name: parsed.data.companyName,
    slug: publicId,
    createdBy: owner.id,
    createdByEmail: owner.email,
    kind: "company",
  });
  if (!workspace.publicId) {
    return res.status(500).json({ message: "Unable to create workspace" });
  }

  const record = await workspaceRepo.getByPublicId(db, workspace.publicId);
  if (!record) {
    return res.status(500).json({ message: "Unable to load new workspace" });
  }
  const board = await boardRepo.create(db, {
    publicId: generateUID(),
    name: `${parsed.data.companyName} Tasks`,
    slug: "tasks",
    createdBy: owner.id,
    workspaceId: record.id,
  });
  if (!board) {
    return res.status(500).json({ message: "Unable to create task board" });
  }
  await listRepo.bulkCreate(
    db,
    ["Capture", "Next", "Waiting", "Done"].map((name, index) => ({
      publicId: generateUID(),
      name,
      boardId: board.id,
      createdBy: owner.id,
      index,
    })),
  );

  return res.status(201).json({
    workspace: {
      publicId: workspace.publicId,
      name: workspace.name,
      slug: workspace.slug,
      ownerEmail: owner.email,
    },
    companies: await listCompanies(),
  });
}
