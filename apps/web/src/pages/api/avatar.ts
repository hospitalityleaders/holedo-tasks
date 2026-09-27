import type { NextApiRequest, NextApiResponse } from "next";

import { createNextApiContext } from "@kan/api/trpc-context";
import { withApiLogging } from "@kan/api/utils/apiLogging";
import { withRateLimit } from "@kan/api/utils/rateLimit";
import { generateAvatarUrl } from "@kan/shared/utils";

export default withRateLimit(
  { points: 300, duration: 60 },
  withApiLogging(async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { user } = await createNextApiContext(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const key = req.query.key;
    if (!key || typeof key !== "string" || key.length > 500) {
      return res.status(400).json({ message: "Invalid avatar key" });
    }

    const url = await generateAvatarUrl(key, 3600);
    if (!url) {
      return res.status(404).json({ message: "Avatar not found" });
    }

    res.setHeader("Cache-Control", "private, max-age=300");
    return res.redirect(302, url);
  }),
);
