import { getSocialAuthContext } from "@/lib/social/auth-context";

export async function getPublishingAuthContext() {
  return getSocialAuthContext();
}
