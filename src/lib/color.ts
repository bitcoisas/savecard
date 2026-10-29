export type Palette = {
  base: string; // dark background tone
  accent: string; // light tone for highlights
};

export const DEFAULT_PALETTE: Palette = {
  base: "rgb(28, 34, 58)",
  accent: "rgb(196, 208, 255)",
};

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

/**
 * Picks a representative color from an image, favoring saturated pixels,
 * and returns a dark base and a light accent built from its hue.
 */
export async function extractPalette(src: string): Promise<Palette> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();

  const size = 48;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return DEFAULT_PALETTE;
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let r = 0;
  let g = 0;
  let b = 0;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    const [, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (l < 8 || l > 95) continue;
    const weight = 0.15 + s / 100;
    r += data[i] * weight;
    g += data[i + 1] * weight;
    b += data[i + 2] * weight;
    total += weight;
  }
  if (total === 0) return DEFAULT_PALETTE;

  const [h, s] = rgbToHsl(r / total, g / total, b / total);
  const sat = Math.min(s, 70);
  return {
    base: `hsl(${h.toFixed(0)} ${(sat * 0.8).toFixed(0)}% 13%)`,
    accent: `hsl(${h.toFixed(0)} ${Math.max(sat, 45).toFixed(0)}% 80%)`,
  };
}
