const STAR_PATH =
  "M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9l-6.4 3.5L7 14.3l-5.3-5 7.2-.9z";

type Props = {
  rating: number;
  size: number;
  color: string;
  emptyColor: string;
};

export function Stars({ rating, size, color, emptyColor }: Props) {
  return (
    <div style={{ display: "flex", gap: size * 0.12 }} aria-label={`${rating} of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <path d={STAR_PATH} fill={emptyColor} />
            {fill > 0 && (
              <path
                d={STAR_PATH}
                fill={color}
                style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}
