export type GameStatus =
  | "playing"
  | "completed"
  | "mastered"
  | "retired"
  | "shelved"
  | "abandoned"
  | "played"
  | "backlog"
  | "wishlist";

export const STATUS_LABELS: Record<GameStatus, string> = {
  playing: "Playing",
  completed: "Completed",
  mastered: "Mastered",
  retired: "Retired",
  shelved: "Shelved",
  abandoned: "Abandoned",
  played: "Played",
  backlog: "Backlog",
  wishlist: "Wishlist",
};

export type CardData = {
  title: string;
  platform: string;
  year: string;
  cover: string | null;
  rating: number; // 0 to 5 in steps of 0.5, 0 means not rated
  status: GameStatus;
  hours: string;
  review: string;
  showReview: boolean;
  username: string;
};
