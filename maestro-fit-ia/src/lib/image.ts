// Resizes an image file down to fit within maxDimension and re-encodes it as JPEG,
// so photos taken on a phone camera (often several MB) stay well under API/body limits.
export async function resizeImageToDataUrl(file: File, maxDimension = 1024, quality = 0.75): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen');
  ctx.drawImage(bitmap, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
}
