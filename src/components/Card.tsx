import { forwardRef, type CSSProperties } from "react";
import type { CardData } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import type { Format, FormatId } from "@/lib/formats";
import type { Palette } from "@/lib/color";
import { Stars } from "./Stars";

type Layout = {
  direction: "column" | "row";
  padding: string;
  gap: number;
  coverWidth: number;
  title: number;
  meta: number;
  star: number;
  slotLabel: number;
  slotValue: number;
  review: number;
  reviewLines: number;
  footer: number;
};

// Story keeps content inside the area that Instagram does not cover with its UI.
const LAYOUTS: Record<FormatId, Layout> = {
  story: {
    direction: "column",
    padding: "230px 96px 260px",
    gap: 44,
    coverWidth: 520,
    title: 92,
    meta: 34,
    star: 64,
    slotLabel: 26,
    slotValue: 46,
    review: 34,
    reviewLines: 4,
    footer: 30,
  },
  portrait: {
    direction: "column",
    padding: "80px 88px 72px",
    gap: 34,
    coverWidth: 380,
    title: 74,
    meta: 30,
    star: 54,
    slotLabel: 22,
    slotValue: 38,
    review: 30,
    reviewLines: 2,
    footer: 26,
  },
  square: {
    direction: "row",
    padding: "76px",
    gap: 56,
    coverWidth: 420,
    title: 64,
    meta: 28,
    star: 46,
    slotLabel: 20,
    slotValue: 34,
    review: 27,
    reviewLines: 6,
    footer: 24,
  },
  landscape: {
    direction: "row",
    padding: "60px 72px",
    gap: 56,
    coverWidth: 340,
    title: 54,
    meta: 24,
    star: 40,
    slotLabel: 18,
    slotValue: 30,
    review: 23,
    reviewLines: 3,
    footer: 20,
  },
};

type Props = {
  data: CardData;
  format: Format;
  palette: Palette;
};

const COVER_RATIO = 264 / 374; // IGDB cover proportion

export const Card = forwardRef<HTMLDivElement, Props>(function Card(
  { data, format, palette },
  ref,
) {
  const l = LAYOUTS[format.id];
  const vertical = l.direction === "column";
  const coverHeight = Math.round(l.coverWidth / COVER_RATIO);
  const review = data.showReview ? data.review.trim() : "";

  const clamp = (lines: number): CSSProperties => ({
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  });

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: format.width,
        height: format.height,
        overflow: "hidden",
        background: palette.base,
        color: "#fff",
        fontFamily: "var(--font-body), sans-serif",
      }}
    >
      {data.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.cover}
          alt=""
          style={{
            position: "absolute",
            inset: -80,
            width: "calc(100% + 160px)",
            height: "calc(100% + 160px)",
            objectFit: "cover",
            filter: "blur(60px) saturate(1.3)",
            opacity: 0.45,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: vertical
            ? `linear-gradient(180deg, transparent 0%, ${palette.base} 78%)`
            : `linear-gradient(90deg, transparent 0%, ${palette.base} 62%)`,
        }}
      />

      <div
        style={{
          position: "relative",
          height: "100%",
          boxSizing: "border-box",
          padding: l.padding,
          display: "flex",
          flexDirection: l.direction,
          alignItems: vertical ? "center" : "stretch",
          justifyContent: vertical ? "center" : "flex-start",
          gap: l.gap,
          textAlign: vertical ? "center" : "left",
        }}
      >
        <div
          style={{
            flex: "none",
            width: l.coverWidth,
            height: coverHeight,
            alignSelf: "center",
            borderRadius: l.coverWidth * 0.035,
            overflow: "hidden",
            background: "rgba(255,255,255,0.08)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {data.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.cover}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: l.meta, opacity: 0.5 }}>No cover</span>
          )}
        </div>

        <div
          style={{
            flex: vertical ? "none" : 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: vertical ? "center" : "flex-start",
            justifyContent: vertical ? "flex-start" : "center",
            gap: l.gap * 0.6,
            width: vertical ? "100%" : undefined,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-display), sans-serif",
                fontWeight: 800,
                fontSize: l.title,
                lineHeight: 0.98,
                letterSpacing: "-0.02em",
                ...clamp(2),
              }}
            >
              {data.title || "Untitled game"}
            </h1>
            {(data.platform || data.year) && (
              <div
                style={{
                  marginTop: l.meta * 0.5,
                  fontSize: l.meta,
                  color: palette.accent,
                  display: "flex",
                  gap: l.meta * 0.8,
                  justifyContent: vertical ? "center" : "flex-start",
                }}
              >
                {data.platform && <span>{data.platform}</span>}
                {data.year && <span style={{ opacity: 0.75 }}>{data.year}</span>}
              </div>
            )}
          </div>

          {data.rating > 0 && (
            <Stars
              rating={data.rating}
              size={l.star}
              color="#FFD34D"
              emptyColor="rgba(255,255,255,0.18)"
            />
          )}

          <div
            style={{
              display: "flex",
              border: `2px solid ${palette.accent}`,
              borderRadius: l.slotValue * 0.4,
              overflow: "hidden",
            }}
          >
            <SlotCell label="Status" value={STATUS_LABELS[data.status]} l={l} />
            {data.hours.trim() && (
              <SlotCell
                label="Time played"
                value={`${data.hours.trim()} h`}
                l={l}
                divider={palette.accent}
              />
            )}
          </div>

          {review && (
            <p
              style={{
                margin: 0,
                fontSize: l.review,
                lineHeight: 1.4,
                opacity: 0.9,
                maxWidth: vertical ? "92%" : undefined,
                ...clamp(l.reviewLines),
              }}
            >
              {review}
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: format.id === "story" ? 150 : l.footer * 1.6,
          padding: `0 ${format.id === "landscape" ? 72 : 80}px`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: l.footer,
        }}
      >
        <span style={{ opacity: 0.85 }}>
          {data.username ? `@${data.username.replace(/^@/, "")}` : ""}
        </span>
        <span
          style={{
            fontFamily: "var(--font-pixel), sans-serif",
            fontWeight: 600,
            opacity: 0.7,
            letterSpacing: "-0.01em",
          }}
        >
          savecard
        </span>
      </div>
    </div>
  );
});

function SlotCell({
  label,
  value,
  l,
  divider,
}: {
  label: string;
  value: string;
  l: Layout;
  divider?: string;
}) {
  return (
    <div
      style={{
        padding: `${l.slotValue * 0.35}px ${l.slotValue * 0.6}px`,
        borderLeft: divider ? `2px solid ${divider}` : undefined,
        textAlign: "left",
      }}
    >
      <div style={{ fontSize: l.slotLabel, opacity: 0.65 }}>{label}</div>
      <div
        style={{
          fontFamily: "var(--font-display), sans-serif",
          fontWeight: 700,
          fontSize: l.slotValue,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}
