import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS, MIN_IMAGE_SIDE } from "./productRules";

const ACCEPTED_TYPES = IMAGE_ACCEPT.split(",");

/** Reads an image's pixel size in the browser; null when it can't be decoded. */
const readImageSize = (file: File) =>
  new Promise<{ width: number; height: number } | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

/**
 * Client check before an image upload (type, 2 MB, at least 300 × 300 px,
 * at most 50 megapixels). Returns the problem, or null. The server re-checks.
 * `minSide: 0` skips the minimum (category images have none on the server).
 */
export async function imageFileProblem(
  file: File,
  { minSide = MIN_IMAGE_SIDE }: { minSide?: number } = {}
): Promise<string | null> {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Use a PNG, JPEG, WebP or GIF image";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 2 MB or smaller";
  const size = await readImageSize(file);
  if (!size) return "This image can't be read. Use a PNG, JPEG, WebP or GIF image";
  if (size.width < minSide || size.height < minSide) {
    return `Image must be at least ${minSide} × ${minSide} px`;
  }
  if (size.width * size.height > MAX_IMAGE_PIXELS) {
    return `Image must be at most ${MAX_IMAGE_PIXELS / 1_000_000} megapixels`;
  }
  return null;
}
