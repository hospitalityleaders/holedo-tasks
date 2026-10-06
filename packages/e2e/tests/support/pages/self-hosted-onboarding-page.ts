import type { Page } from "@playwright/test";

export class SelfHostedOnboardingPage {
  constructor(private readonly page: Page) {}

  async createFirstWorkspace(name: string) {
    await this.page.waitForURL(/\/boards/);

    // Holedo provisions a private personal workspace during account creation.
    // Most of the existing self-hosted scenarios exercise collaboration,
    // invitations, workspace deletion, and other company-only behaviour, so
    // create and select the user's one company workspace for those scenarios.
    const response = await this.page.request.post(
      "/api/trpc/workspace.create?batch=1",
      { data: { "0": { json: { name } } } },
    );

    if (!response.ok()) {
      throw new Error(
        `Unable to create test company workspace: ${response.status()}`,
      );
    }

    const body = (await response.json()) as Array<{
      result?: { data?: { json?: { publicId?: string } } };
    }>;
    const workspacePublicId = body[0]?.result?.data?.json?.publicId;

    if (!workspacePublicId) {
      throw new Error("Company workspace publicId missing from response");
    }

    await this.page.evaluate((publicId) => {
      localStorage.setItem("workspacePublicId", publicId);
    }, workspacePublicId);

    // The direct API request does not invalidate the browser's cached
    // workspace list. Supplying the new workspace in the URL enables the
    // provider's short polling path until the company workspace appears,
    // instead of falling back to the already-provisioned personal workspace.
    await this.page.goto(`/boards?workspacePublicId=${workspacePublicId}`);
    await this.page.waitForURL(/\/boards$/);
    await this.page.waitForFunction(
      (publicId) => localStorage.getItem("workspacePublicId") === publicId,
      workspacePublicId,
    );
  }
}
