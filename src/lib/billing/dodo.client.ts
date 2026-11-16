import { DodoPayments } from "dodopayments";

export class DodoClient {
  private static instance: DodoPayments | null = null;

  public static getApiKey(): string {
    return process.env.DODO_PAYMENTS_API_KEY || "dodo_test_mock_api_key_placeholder";
  }

  public static getWebhookKey(): string {
    return process.env.DODO_PAYMENTS_WEBHOOK_KEY || "dodo_whsec_mock_key_placeholder";
  }

  public static getEnvironment(): "test_mode" | "live_mode" {
    const env = process.env.DODO_PAYMENTS_ENVIRONMENT;
    return env === "live_mode" ? "live_mode" : "test_mode";
  }

  public static getReturnUrl(): string {
    return (
      process.env.DODO_PAYMENTS_RETURN_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/app/settings/billing`
    );
  }

  public static getClient(): DodoPayments {
    if (!this.instance) {
      this.instance = new DodoPayments({
        bearerToken: this.getApiKey(),
        environment: this.getEnvironment(),
      });
    }
    return this.instance;
  }
}
