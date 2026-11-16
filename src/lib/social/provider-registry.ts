import { ISocialProvider } from "./types";
import { SocialProvider } from "@prisma/client";
import { InstagramProvider } from "./providers/instagram.provider";
import { FacebookProvider } from "./providers/facebook.provider";
import { LinkedInProvider } from "./providers/linkedin.provider";
import { YouTubeProvider } from "./providers/youtube.provider";
import { PinterestProvider } from "./providers/pinterest.provider";

export class ProviderRegistry {
  private static providers: Map<SocialProvider, ISocialProvider> = new Map();

  static {
    this.register(new InstagramProvider());
    this.register(new FacebookProvider());
    this.register(new LinkedInProvider());
    this.register(new YouTubeProvider());
    this.register(new PinterestProvider());
  }

  public static register(provider: ISocialProvider) {
    this.providers.set(provider.provider, provider);
  }

  public static get(provider: SocialProvider): ISocialProvider {
    const instance = this.providers.get(provider);
    if (!instance) {
      throw new Error(`Social provider ${provider} is not registered or currently supported.`);
    }
    return instance;
  }

  public static has(provider: SocialProvider): boolean {
    return this.providers.has(provider);
  }

  public static getAll(): ISocialProvider[] {
    return Array.from(this.providers.values());
  }
}
