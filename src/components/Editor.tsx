"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { toBlob } from "html-to-image";
import { Card } from "./Card";
import { FORMATS, getFormat, type FormatId } from "@/lib/formats";
import { DEFAULT_PALETTE, extractPalette, type Palette } from "@/lib/color";
import { STATUS_LABELS, type CardData, type GameStatus } from "@/lib/types";
import { fetchCover, readAsDataUrl } from "@/lib/cover";
import { BOOKMARKLET_VERSION, decodeImport, type ImportPayload } from "@/lib/bookmarklet";

type Notice = { kind: "info" | "error"; message: string; details?: string[] };


const INITIAL: CardData = {
  title: "Outer Wilds",
  platform: "PC",
  year: "2019",
  cover: null,
  rating: 4.5,
  status: "completed",
  hours: "24",
  review:
    "Every loop taught me something new about the solar system. Go in knowing as little as possible.",
  showReview: true,
  username: "",
};

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "game"
  );
}

const noopSubscribe = () => () => {};

let shareSupport: boolean | undefined;
function supportsFileShare() {
  if (shareSupport === undefined) {
    const probe = new File([""], "probe.png", { type: "image/png" });
    shareSupport =
      typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] });
  }
  return shareSupport;
}


export function Editor() {
  const [data, setData] = useState<CardData>(INITIAL);
  const [formatId, setFormatId] = useState<FormatId>("story");
  const [palette, setPalette] = useState<Palette>(DEFAULT_PALETTE);
  const [coverUrl, setCoverUrl] = useState("");
  const [coverError, setCoverError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const canShare = useSyncExternalStore(noopSubscribe, supportsFileShare, () => false);

  const exportRefs = useRef<Partial<Record<FormatId, HTMLDivElement | null>>>({});
  const previewBox = useRef<HTMLDivElement>(null);
  const [previewWidth, setPreviewWidth] = useState(360);

  const format = getFormat(formatId);
  const scale = Math.min(previewWidth / format.width, 640 / format.height);

  const update = <K extends keyof CardData>(key: K, value: CardData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  useEffect(() => {
    const el = previewBox.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setPreviewWidth(entry.contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  async function applyImport(result: ImportPayload | { error: string }) {
    if ("error" in result) {
      setNotice({ kind: "error", message: result.error });
      return;
    }

    const missing = [...result.missing];
    let cover: string | null = null;
    if (result.cover) {
      try {
        cover = await fetchCover(result.cover);
      } catch {
        missing.unshift("cover");
      }
    }

    const status = result.status && result.status in STATUS_LABELS ? (result.status as GameStatus) : undefined;
    setData({
      title: result.title ?? "",
      platform: result.platform ?? "",
      year: result.year ?? "",
      cover,
      rating: typeof result.rating === "number" ? Math.max(0, Math.min(5, result.rating)) : 0,
      status: status ?? "completed",
      hours: result.hours ?? "",
      review: result.review ?? "",
      showReview: Boolean(result.review),
      username: result.username ?? "",
    });
    if (cover) setPalette(await extractPalette(cover).catch(() => DEFAULT_PALETTE));
    else setPalette(DEFAULT_PALETTE);

    const unique = Array.from(new Set(missing));
    const outdated = result.v < BOOKMARKLET_VERSION;
    setNotice({
      kind: "info",
      message: unique.length
        ? `Imported ${result.title} from Backloggd. Some details were not on that page, please fill them in:`
        : `Imported ${result.title} from Backloggd. Check the details and download your card.`,
      details: [
        ...unique,
        ...(outdated ? ["Your bookmark is out of date. Install it again from the setup page."] : []),
      ],
    });
  }

  useEffect(() => {
    if (!window.location.hash.startsWith("#import=")) return;
    const result = decodeImport(window.location.hash);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    // Deferred so the import runs after the first render.
    queueMicrotask(() => applyImport(result));
  }, []);

  async function setCover(src: string) {
    update("cover", src);
    setPalette(await extractPalette(src).catch(() => DEFAULT_PALETTE));
  }

  async function onCoverFile(file: File | undefined) {
    if (!file) return;
    setCoverError("");
    await setCover(await readAsDataUrl(file));
  }

  async function onCoverLink() {
    if (!coverUrl.trim()) return;
    setCoverError("");
    try {
      await setCover(await fetchCover(coverUrl.trim()));
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Could not load that cover.");
    }
  }

  async function render(id: FormatId) {
    const node = exportRefs.current[id];
    if (!node) throw new Error("Card is not ready yet.");
    const f = getFormat(id);
    const options = { width: f.width, height: f.height, pixelRatio: 1 };
    // The first pass warms up fonts and images, the second one is the real export.
    await toBlob(node, options);
    const blob = await toBlob(node, options);
    if (!blob) throw new Error("Could not create the image.");
    return new File([blob], `savecard-${slugify(data.title)}-${id}.png`, {
      type: "image/png",
    });
  }

  function download(file: File) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function run(task: () => Promise<void>) {
    setBusy(true);
    try {
      await task();
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <header className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-heading text-5xl font-bold">
          savecard
          <span className="save-cursor" aria-hidden />
        </h1>
        <p className="text-muted">
          Turn your game logs into images you can post anywhere.{" "}
          <Link href="/bookmarklet" className="font-semibold text-accent underline underline-offset-2">
            Import from Backloggd
          </Link>
        </p>
      </header>

      {notice && (
        <div
          role="status"
          className={`mb-6 flex items-start justify-between gap-4 rounded-lg border-2 bg-panel px-5 py-4 ${
            notice.kind === "error" ? "border-danger" : "border-accent"
          }`}
        >
          <div>
            <p>{notice.message}</p>
            {notice.details && notice.details.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-sm">
                {notice.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-sm font-semibold text-muted hover:text-ink"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form
          className="space-y-5 rounded-lg border-2 border-line bg-panel p-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <Field label="Game">
            <input
              className={inputClass}
              value={data.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Platform">
              <input
                className={inputClass}
                value={data.platform}
                onChange={(e) => update("platform", e.target.value)}
              />
            </Field>
            <Field label="Release year">
              <input
                className={inputClass}
                inputMode="numeric"
                value={data.year}
                onChange={(e) => update("year", e.target.value)}
              />
            </Field>
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-semibold">Cover</legend>
            <div className="flex gap-2">
              <input
                className={inputClass}
                placeholder="Paste an images.igdb.com link"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onCoverLink()}
                aria-label="Cover link"
              />
              <button type="button" className={secondaryButton} onClick={onCoverLink}>
                Load
              </button>
            </div>
            <label className="inline-block cursor-pointer text-sm text-accent underline underline-offset-2">
              Or upload an image
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onCoverFile(e.target.files?.[0])}
              />
            </label>
            {coverError && <p className="text-sm text-danger">{coverError}</p>}
            <p className="text-xs text-muted">
              On Backloggd, right click the game cover and copy the image address.
            </p>
          </fieldset>

          <Field label={`Rating: ${data.rating > 0 ? `${data.rating} of 5` : "not rated"}`}>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={data.rating}
              onChange={(e) => update("rating", Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <select
                className={inputClass}
                value={data.status}
                onChange={(e) => update("status", e.target.value as GameStatus)}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hours played">
              <input
                className={inputClass}
                inputMode="decimal"
                value={data.hours}
                onChange={(e) => update("hours", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Review">
            <textarea
              className={`${inputClass} min-h-24`}
              value={data.review}
              onChange={(e) => update("review", e.target.value)}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.showReview}
              onChange={(e) => update("showReview", e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Show the review on the card (turn off to avoid spoilers)
          </label>

          <Field label="Backloggd username">
            <input
              className={inputClass}
              placeholder="optional, shows your profile link on the card"
              value={data.username}
              onChange={(e) => update("username", e.target.value)}
            />
          </Field>
        </form>

        <section aria-label="Preview" className="space-y-4">
          <div role="tablist" aria-label="Format" className="grid grid-cols-4 gap-1 rounded-lg border-2 border-line bg-panel p-1">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={f.id === formatId}
                onClick={() => setFormatId(f.id)}
                className={`rounded-md px-2 py-2 font-heading text-base transition-colors ${
                  f.id === formatId ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
                }`}
              >
                {f.id === formatId && <span aria-hidden>▶ </span>}
                {f.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">
            {format.width} by {format.height} px, for {format.networks}.
          </p>

          <div ref={previewBox} className="flex justify-center">
            <div
              className="overflow-hidden rounded-md border-2 border-black shadow-[6px_6px_0_#000]"
              style={{ width: format.width * scale, height: format.height * scale }}
            >
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <Card data={data} format={format} palette={palette} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={primaryButton}
              disabled={busy}
              onClick={() => run(async () => download(await render(formatId)))}
            >
              Download {format.name.toLowerCase()}
            </button>
            <button
              type="button"
              className={secondaryButton}
              disabled={busy}
              onClick={() =>
                run(async () => {
                  for (const f of FORMATS) download(await render(f.id));
                })
              }
            >
              Download all formats
            </button>
            {canShare && (
              <button
                type="button"
                className={secondaryButton}
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const file = await render(formatId);
                    await navigator.share({ files: [file], title: data.title });
                  })
                }
              >
                Share
              </button>
            )}
          </div>
        </section>
      </div>

      <footer className="mt-12 text-sm text-muted">
        Savecard is open source and not affiliated with Backloggd.{" "}
        <a className="underline underline-offset-2" href="https://github.com/bitcoisas/savecard">
          Source on GitHub
        </a>
      </footer>

      {/* Full size cards used for export, kept out of view. */}
      <div aria-hidden style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none" }}>
        {FORMATS.map((f) => (
          <Card
            key={f.id}
            ref={(el) => {
              exportRefs.current[f.id] = el;
            }}
            data={data}
            format={f}
            palette={palette}
          />
        ))}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border-2 border-line bg-field px-3 py-2 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none";
const primaryButton =
  "btn bg-accent px-4 py-2 text-lg text-accent-ink disabled:opacity-50";
const secondaryButton =
  "btn bg-field px-4 py-2 text-lg text-ink hover:bg-line disabled:opacity-50";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
