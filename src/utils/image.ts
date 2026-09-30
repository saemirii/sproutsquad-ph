// Images are stored inline as base64 data URLs in the database, so a raw
// phone photo (often 3–5MB, and ~33% bigger once base64-encoded) bloats every
// product row and the marketplace load. This downsizes any picked image to a
// sensible display size and re-encodes it as JPEG before it's saved.

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This image format could not be read.'));
    };
    img.src = url;
  });

export const shrinkImageToDataUrl = async (
  file: File,
  { maxDimension = 1200, quality = 0.82 }: { maxDimension?: number; quality?: number } = {}
): Promise<string> => {
  const img = await loadImage(file);
  const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process this image.');

  // JPEG has no transparency — fill white so transparent PNGs don't turn black.
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
};
