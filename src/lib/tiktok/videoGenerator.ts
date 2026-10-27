import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpeg from "@ffmpeg-installer/ffmpeg";
import type { TikTokVideoOverlay } from "@/lib/meta/captionBuilder";

const execFileAsync = promisify(execFile);

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;
const VIDEO_DURATION_SECONDS = 5;
const VIDEO_FPS = 25;

// Overlay banner sized to comfortably fit the title line plus up to four
// detail lines (description, price, colors, hashtags) at the font sizes
// below -- see buildTikTokVideoOverlay() for what populates those lines.
const BANNER_HEIGHT = 420;
const BANNER_PADDING_X = 60;
const TITLE_FONT_SIZE = 58;
const DETAILS_FONT_SIZE = 38;

declare const __non_webpack_require__: NodeJS.Require | undefined;

/**
 * drawtext needs a real font file on disk -- there are no system fonts in
 * Vercel's Node runtime. Rather than vendoring a new font asset (with its
 * own licensing question to track), this points at the Geist font Next.js
 * already ships inside its own package for @vercel/og -- `next` is always
 * present at runtime since it's the framework itself, so no extra bundling
 * or file-tracing config is needed to rely on it.
 *
 * Uses __non_webpack_require__ rather than plain require(): Next's server
 * build runs through webpack, which statically rewrites require.resolve()
 * calls to its own internal numeric module ID instead of leaving Node's
 * real path-resolution behavior intact -- plain require.resolve() here
 * returned a bundler module ID (e.g. 33984) in production instead of a
 * filesystem path, which then blew up every call downstream with "path"
 * argument must be of type string. __non_webpack_require__ is Next/webpack's
 * own documented escape hatch for exactly this (see e.g. next/dist/.../
 * render-result.js), and survives unprocessed through the webpack bundle as
 * a plain Node require, so require.resolve behaves normally again.
 */
function resolveFontPath(): string {
  const nodeRequire =
    typeof __non_webpack_require__ === "function"
      ? __non_webpack_require__
      : require;
  const nextPackageDir = path.dirname(
    nodeRequire.resolve("next/package.json"),
  );
  return path.join(
    nextPackageDir,
    "dist/compiled/@vercel/og/Geist-Regular.ttf",
  );
}

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
 *
 * `overlay`, when given, burns the product's name/description/price/colors/
 * hashtags into a bottom banner on the video -- see buildTikTokVideoOverlay()
 * in captionBuilder.ts for why this exists instead of a caption field.
 */
export async function generateProductVideo(
  imageUrl: string,
  overlay?: TikTokVideoOverlay,
): Promise<Buffer> {
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

    const filterSteps = [
      `[0:v]scale=${VIDEO_WIDTH}:${VIDEO_HEIGHT}:force_original_aspect_ratio=increase,crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT},boxblur=20:2,eq=brightness=-0.08[bg]`,
      `[0:v]scale=${VIDEO_WIDTH - 110}:${VIDEO_HEIGHT - 110}:force_original_aspect_ratio=decrease[fg]`,
      `[bg][fg]overlay=(W-w)/2:(H-h)/2[composited]`,
    ];
    let finalLabel = "composited";

    if (overlay) {
      // textfile= (rather than inline text=) sidesteps ffmpeg filtergraph
      // escaping entirely for product names/descriptions that may contain
      // colons, quotes, or commas -- any of which would otherwise need
      // careful escaping to avoid breaking the filter_complex string.
      const titlePath = path.join(workDir, "title.txt");
      const detailsPath = path.join(workDir, "details.txt");
      await writeFile(titlePath, overlay.title, "utf8");
      await writeFile(detailsPath, overlay.details, "utf8");
      const fontPath = resolveFontPath();
      const bannerTop = VIDEO_HEIGHT - BANNER_HEIGHT;

      filterSteps.push(
        `[composited]drawbox=x=0:y=${bannerTop}:w=${VIDEO_WIDTH}:h=${BANNER_HEIGHT}:color=black@0.55:t=fill[banner]`,
        `[banner]drawtext=fontfile=${fontPath}:textfile=${titlePath}:fontcolor=white:fontsize=${TITLE_FONT_SIZE}:x=${BANNER_PADDING_X}:y=${bannerTop + 25}[titled]`,
        `[titled]drawtext=fontfile=${fontPath}:textfile=${detailsPath}:fontcolor=white:fontsize=${DETAILS_FONT_SIZE}:line_spacing=14:x=${BANNER_PADDING_X}:y=${bannerTop + 100}[overlaid]`,
      );
      finalLabel = "overlaid";
    }

    const filterComplex = filterSteps.join(";");

    await execFileAsync(ffmpeg.path, [
      "-y",
      "-loop", "1",
      "-i", inputPath,
      "-f", "lavfi",
      "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
      "-filter_complex", filterComplex,
      "-map", `[${finalLabel}]`,
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
