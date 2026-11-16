import { createClient } from "@supabase/supabase-js";

export interface MediaValidationResult {
  valid: boolean;
  error?: string;
  mediaType: "image" | "video";
  format: string;
}

export class MediaStorageService {
  private static getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xfqapdxeladfvivlwltp.supabase.co";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    return createClient(url, key);
  }

  public static readonly BUCKET_NAME = "social-media";

  /**
   * Validate platform media requirements.
   * Max 10MB for images (JPEG, PNG, WebP, GIF)
   * Max 100MB for standard social videos (MP4, QuickTime/MOV)
   */
  public static validateMedia(file: {
    mimeType: string;
    sizeBytes: number;
  }): MediaValidationResult {
    const mime = file.mimeType.toLowerCase();

    if (mime.startsWith("image/")) {
      const allowedImageFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedImageFormats.includes(mime)) {
        return {
          valid: false,
          mediaType: "image",
          format: mime,
          error: `Unsupported image format: ${mime}. Allowed: JPEG, PNG, WebP, GIF.`,
        };
      }
      if (file.sizeBytes > 10 * 1024 * 1024) {
        return {
          valid: false,
          mediaType: "image",
          format: mime,
          error: `Image exceeds maximum allowed size of 10MB (${(file.sizeBytes / (1024 * 1024)).toFixed(1)}MB).`,
        };
      }
      return { valid: true, mediaType: "image", format: mime };
    }

    if (mime.startsWith("video/")) {
      const allowedVideoFormats = ["video/mp4", "video/quicktime"];
      if (!allowedVideoFormats.includes(mime)) {
        return {
          valid: false,
          mediaType: "video",
          format: mime,
          error: `Unsupported video format: ${mime}. Allowed: MP4, QuickTime (MOV).`,
        };
      }
      if (file.sizeBytes > 100 * 1024 * 1024) {
        return {
          valid: false,
          mediaType: "video",
          format: mime,
          error: `Video exceeds maximum allowed size of 100MB (${(file.sizeBytes / (1024 * 1024)).toFixed(1)}MB).`,
        };
      }
      return { valid: true, mediaType: "video", format: mime };
    }

    return {
      valid: false,
      mediaType: "image",
      format: mime,
      error: `Unsupported media type: ${mime}.`,
    };
  }

  /**
   * Generate a signed URL with 24-hour expiration for external social platforms to download
   */
  public static async getSignedMediaUrl(path: string, expiresInSeconds = 86400): Promise<string> {
    try {
      const supabase = this.getSupabaseAdmin();
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(path, expiresInSeconds);

      if (error || !data) {
        console.warn(`[MediaStorage] Could not create signed URL: ${error?.message}`);
        // Return raw public URL if bucket is public or in mock
        const { data: pubData } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(path);
        return pubData.publicUrl;
      }
      return data.signedUrl;
    } catch (err: any) {
      console.warn(`[MediaStorage] Exception generating signed URL: ${err.message}`);
      return path;
    }
  }
}
