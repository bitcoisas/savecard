export type FormatId = "story" | "portrait" | "square" | "landscape";

export type Format = {
  id: FormatId;
  name: string;
  width: number;
  height: number;
  networks: string;
};

export const FORMATS: Format[] = [
  {
    id: "story",
    name: "Story",
    width: 1080,
    height: 1920,
    networks: "Instagram, Facebook and WhatsApp stories, TikTok",
  },
  {
    id: "portrait",
    name: "Portrait",
    width: 1080,
    height: 1350,
    networks: "Instagram and Threads feed",
  },
  {
    id: "square",
    name: "Square",
    width: 1080,
    height: 1080,
    networks: "Instagram, Facebook, Reddit, Mastodon",
  },
  {
    id: "landscape",
    name: "Landscape",
    width: 1200,
    height: 675,
    networks: "X, Bluesky, LinkedIn, Discord",
  },
];

export function getFormat(id: FormatId): Format {
  return FORMATS.find((f) => f.id === id) ?? FORMATS[0];
}
