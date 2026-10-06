import type { Page } from "@playwright/test";

import type { TestUser } from "../test-user";
import { waitForResponsePath } from "../wait-for-trpc";

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async expectSignedInAs(user: TestUser) {
    await this.page.getByRole("heading", { name: "Boards" }).waitFor();
    await this.page.getByRole("button", { name: user.name }).waitFor();
  }

  async logOut(user: TestUser) {
    await this.page.getByRole("button", { name: user.name }).click();
    const signedOut = waitForResponsePath(this.page, "/api/auth/sign-out");
    await this.page.getByRole("menuitem", { name: "Logout" }).click();
    await signedOut;
    await this.page.waitForURL("https://www.holedo.com/login/");
  }
}
