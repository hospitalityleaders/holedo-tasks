import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import type { TestUser } from "../test-user";

export class AuthPage {
  constructor(private readonly page: Page) {}

  async signUp(user: TestUser) {
    const response = await this.page.request.post("/api/auth/sign-up/email", {
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });
    expect(response.ok()).toBe(true);
    await this.page.goto("/boards");
  }

  async logIn(user: TestUser) {
    const response = await this.page.request.post("/api/auth/sign-in/email", {
      data: {
        email: user.email,
        password: user.password,
      },
    });
    expect(response.ok()).toBe(true);
    await this.page.goto("/boards");
  }
}
