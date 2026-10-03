export const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** The source image darkens the lower body, which would invert to a solid slab in light mode. */
const lightFade = (yn: number) => Math.min(1, Math.max(0.15, 1 - (yn - 0.55) / 0.4));

/** Tone curve for the dithered portrait, shared by the About canvas and the hero particles. */
export function ditherTone(r: number, g: number, b: number, a: number, yn: number, light: boolean) {
  const l = Math.min(1, Math.max(0, ((r * 0.299 + g * 0.587 + b * 0.114) / 255 - 0.12) * 1.35));
  return (light ? (0.92 - l * 0.85) * lightFade(yn) : l) * (a / 255);
}
