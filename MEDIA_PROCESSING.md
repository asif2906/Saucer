# SAUCER — Media Processing & Supabase Storage Specification

## 1. Storage Architecture
Saucer uses **Supabase Storage** (bucket: `social-media`) for temporary staging and hosting of social media assets.

- **Signed URLs**: Media URLs sent to social providers are pre-signed with a 24-hour expiration window (`expiresIn: 86400`), ensuring private media assets are never permanently exposed publicly while allowing platform ingest crawlers to fetch them.

---

## 2. Platform Media Requirements

| Platform | Supported Formats | Max File Size | Video Specs | Special Requirements |
| :--- | :--- | :--- | :--- | :--- |
| **Instagram** | JPEG, PNG, MP4, MOV | Image: 10MB<br>Video: 100MB | 9:16 aspect ratio for Reels, max 15 mins | Media is strictly required for every post. Two-step container upload (`/media` then `/media_publish`). |
| **Facebook** | JPEG, PNG, WebP, MP4, MOV | Image: 10MB<br>Video: 100MB | Max 240 mins | Supports text-only or media-attached posts. Dispatches to `/photos` or `/videos` based on MIME type. |
| **LinkedIn** | JPEG, PNG, GIF, MP4 | Image: 10MB<br>Video: 100MB | Max 10 mins | Supports rich commentary commentary + image/video attachments. |
| **YouTube** | MP4, MOV | Video: 100MB (default tier) | Max 12 hours | Video is strictly required. Dedicated video upload quota bucket. |
| **Pinterest** | JPEG, PNG, MP4 | Image: 10MB<br>Video: 50MB | 2:3 vertical aspect ratio recommended | Requires valid board ID and destination link. |

---

## 3. Media Validation & Guards
Before queuing or dispatching a publish job, `MediaStorageService.validateMedia()` validates:
1. **MIME Type Inspection**: Rejects disallowed types (e.g. PDF, executable binaries, SVG).
2. **File Size Boundaries**: Enforces hard caps (10MB for images, 100MB for videos) prior to external transfer.
3. **Graceful Failures**: If media fails processing, the job logs `MEDIA_PROCESSING_FAILED` and alerts the customer with exact remediation guidance.
