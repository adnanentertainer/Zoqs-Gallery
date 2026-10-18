import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpeg from "@ffmpeg-installer/ffmpeg";

const execFileAsync = promisify(execFile);

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;
const VIDEO_DURATION_SECONDS = 5;
const VIDEO_FPS = 25;

function inferImageExtension(contentType: string | null): string {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  return "jpg";
}

/**
 * TikTok's Content Posting API has no photo-post scope available to this
 * app (video.publish only -- see the Products/Scopes config in the TikTok
 * developer portal), so every product photo has to become a short video
 * before it can be posted. This renders a fixed, deterministic ~5s 9:16
 * clip: the photo centered over a blurred/darkened copy of itself (so
 * there's no black letterboxing regardless of the source photo's aspect
 * ratio), with a silent audio track since TikTok videos are expected to
 * carry one. No pan/zoom -- a dynamic Ken Burns effect via ffmpeg's zoompan
 * filter is fussy across varied source aspect ratios, and a static
 * composite is a safer default for an unattended pipeline than a filter
 * that occasionally produces a corrupt frame.
 */
export async function generateProductVideo(imageUrl: string): Promise<Buffer> {
  const workDir = await mkdtemp(path.join(tmpdir(), "tiktok-video-"));
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download product image: ${imageResponse.status}`);
  }
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const extension = inferImageExtension(imageResponse.headers.get("content-type"));

  const inputPath = path.join(workDir, `input-${randomUUID()}.${extension}`);
  const outputPath = path.join(workDir, `output-${randomUUID()}.mp4`);

  try {
    await writeFile(inputPath, imageBuffer);

    const filterComplex = [
      `[0:v]scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:force_original_aspect_ratio=increase,crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT},boxblur=20:2,eq=brightness=-0.08[bg]`,
      `[0:v]scale=${VIDEO_WIDTH - 110}:${VIDEO_HEIGHT - 110}:force_original_aspect_ratio=decrease[fg]`,
      `[bg][fg]overlay=(W-w)/2:(H-h)/2[v]`,
    ].join(";");

    await execFileAsync(ffmpeg.path, [
      "-y",
      "-loop", "1",
      "-i", inputPath,
      "-f", "lavfi",
      "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
      "-filter_complex", filterComplex,
      "-map", "[v]",
      "-map", "1:a",
      "-t", String(VIDEO_DURATION_SECONDS),
      "-r", String(VIDEO_FPS),
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-shortest",
      "-movflags", "+faststart",
      outputPath,
    ]);

    return await readFile(outputPath);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
