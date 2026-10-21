import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Normalise an uploaded image: auto-rotate, cap the long edge, strip metadata
 * (including GPS) and re-encode. Returns the stored bytes plus a tiny blurred
 * placeholder for progressive loading.
 */
export async function processImage(input: Buffer) {
  const img = sharp(input, { failOn: "error" }).rotate();
  const meta = await img.metadata();
  if (!meta.width || !meta.height) throw new Error("Unreadable image");
  const hasAlpha = !!meta.hasAlpha && meta.format === "png";
  const pipeline = img.resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
  const { data, info } = hasAlpha
    ? await pipeline.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true })
    : await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  const blur = await sharp(data).resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  return {
    data,
    width: info.width,
    height: info.height,
    bytes: data.length,
    mimeType: hasAlpha ? "image/png" : "image/jpeg",
    blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}
