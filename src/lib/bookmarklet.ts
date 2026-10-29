// The bookmarklet runs on backloggd.com inside the user's own browser.
// It reads the review or log page that is already open and sends the data
// to Savecard through the URL hash, so nothing is stored on a server.
//
// `run` must stay self contained: it is turned into a string and pasted
// into a javascript: URL, so it cannot use imports or outer variables.

export const BOOKMARKLET_VERSION = 1;

export type ImportPayload = {
  v: number;
  source: string;
  title?: string;
  platform?: string;
  year?: string;
  cover?: string;
  rating?: number;
  status?: string;
  hours?: string;
  review?: string;
  username?: string;
  missing: string[];
};

function run(app: string, version: number) {
  const TOAST_ID = "savecard-toast";

  function toast(message: string, isError: boolean) {
    document.getElementById(TOAST_ID)?.remove();
    const box = document.createElement("div");
    box.id = TOAST_ID;
    box.setAttribute("role", "alert");
    box.style.cssText = [
      "position:fixed",
      "top:16px",
      "right:16px",
      "z-index:2147483647",
      "max-width:360px",
      "padding:14px 40px 14px 16px",
      "border-radius:10px",
      "font:15px/1.4 system-ui,sans-serif",
      "color:#fff",
      `background:${isError ? "#b42318" : "#1a1d26"}`,
      "box-shadow:0 8px 30px rgba(0,0,0,.35)",
    ].join(";");
    const strong = document.createElement("strong");
    strong.textContent = "Savecard: ";
    box.append(strong, message);
    const close = document.createElement("button");
    close.textContent = "×";
    close.setAttribute("aria-label", "Close");
    close.style.cssText =
      "position:absolute;top:6px;right:8px;background:none;border:0;color:#fff;font-size:22px;cursor:pointer";
    close.onclick = () => box.remove();
    box.append(close);
    document.body.append(box);
    setTimeout(() => box.remove(), 10000);
  }

  const text = (el: Element | null | undefined) =>
    (el?.textContent ?? "").replace(/\s+/g, " ").trim();

  async function main() {
    const host = location.hostname.replace(/^www\./, "");
    if (host !== "backloggd.com") {
      toast(
        "this bookmark only works on backloggd.com. Open your review there and use the bookmark again.",
        true,
      );
      return;
    }

    if (/not a bot/i.test(document.title)) {
      toast(
        "Backloggd is still checking your browser. Wait for the page to finish loading, then click the bookmark again.",
        true,
      );
      return;
    }

    const path = location.pathname;
    const review = path.match(/^\/u\/([^/]+)\/review\/\d+/);
    const log = path.match(/^\/u\/([^/]+)\/(?:logs|journal)\/([^/]+)/);
    if (!review && !log) {
      toast(
        "open your review first. Go to your profile, open the Reviews tab, click Open review on the game you want and use the bookmark again.",
        true,
      );
      return;
    }

    const data: Record<string, unknown> = {
      v: version,
      source: location.href,
      username: decodeURIComponent((review ?? log)![1]),
    };

    // Game slug, used to read the cover and release year from the game page.
    let slug = log ? log[2] : "";
    if (!slug) {
      const link = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href*='/games/']"))
        .map((a) => new URL(a.href, location.origin).pathname.match(/^\/games\/([^/]+)\/?$/))
        .find((m) => m && m[1] !== "lib");
      slug = link ? link[1] : "";
    }

    const ogTitle =
      document.querySelector<HTMLMetaElement>("meta[property='og:title']")?.content ?? "";
    data.title =
      text(document.querySelector(".review-game-name")) ||
      (ogTitle.match(/review of (.+?) \| Backloggd/i)?.[1] ?? "") ||
      text(document.querySelector("h1"));

    const stars = document.querySelector<HTMLElement>(".stars-top");
    const width = stars ? parseFloat(stars.style.width) : NaN;
    if (!Number.isNaN(width)) data.rating = Math.round((width / 20) * 2) / 2;

    const status = document.querySelector(".play-type");
    if (status) {
      const known = [
        "playing",
        "completed",
        "mastered",
        "retired",
        "shelved",
        "abandoned",
        "played",
        "backlog",
        "wishlist",
      ];
      data.status =
        known.find((s) => status.classList.contains(s)) ?? text(status).toLowerCase();
    }

    const platform = document.querySelector("a[href*='played_platform:']");
    if (platform && text(platform)) data.platform = text(platform);

    const body =
      document.querySelector(".review-body .card-text") ??
      document.querySelector("[id^='collapseReview']") ??
      document.querySelector(".review-body");
    if (body && text(body)) data.review = text(body).slice(0, 1200);

    // Time played: look for a label such as "Time Played" and read the number next to it.
    const label = Array.from(document.querySelectorAll("p, span, div, dt, th, label")).find(
      (el) => el.children.length === 0 && /^(total )?(time|hours) played$|^playtime$/i.test(text(el)),
    );
    const hoursText = label ? text(label.parentElement) : "";
    const hm = hoursText.match(/(\d+(?:[.,]\d+)?)\s*(?:h|hrs?|hours?)\b(?:\s*(\d+)\s*m)?/i);
    if (hm) {
      const h = parseFloat(hm[1].replace(",", ".")) + (hm[2] ? Number(hm[2]) / 60 : 0);
      data.hours = String(Math.round(h * 10) / 10);
    }

    if (slug) {
      try {
        const res = await fetch(`/games/${slug}/`, { credentials: "include" });
        const doc = new DOMParser().parseFromString(await res.text(), "text/html");
        if (!/not a bot/i.test(doc.title)) {
          const cover = doc.querySelector<HTMLMetaElement>("meta[property='og:image']")?.content;
          if (cover && /images\.igdb\.com/.test(cover)) data.cover = cover.replace(/^\/\//, "https://");
          const year = text(doc.querySelector(".game-year"));
          if (/^\d{4}$/.test(year)) data.year = year;
          if (!data.title) data.title = text(doc.querySelector("h1"));
        }
      } catch {
        // The game page is optional, missing fields are reported below.
      }
    }

    if (!data.title) {
      toast(
        "could not read this page. Backloggd may have changed its layout. Please open an issue at github.com/bitcoisas/savecard.",
        true,
      );
      return;
    }

    const labels: Record<string, string> = {
      cover: "cover",
      year: "release year",
      rating: "rating",
      status: "status",
      platform: "platform",
      hours: "time played",
      review: "review",
    };
    data.missing = Object.keys(labels).filter((k) => data[k] === undefined).map((k) => labels[k]);

    const json = JSON.stringify(data);
    const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(json)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const target = `${app}/#import=${encoded}`;

    const opened = window.open(target, "_blank");
    if (opened) {
      toast("opening your card in a new tab.", false);
    } else {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      location.href = target;
    }
  }

  main().catch(() =>
    toast("something went wrong while reading this page. Reload it and try again.", true),
  );
}

export function buildBookmarklet(appOrigin: string) {
  const code = `(${run.toString()})(${JSON.stringify(appOrigin)},${BOOKMARKLET_VERSION})`;
  return `javascript:${encodeURIComponent(code)}`;
}

export function decodeImport(hash: string): ImportPayload | { error: string } {
  const match = hash.match(/^#import=([A-Za-z0-9_-]+)$/);
  if (!match) return { error: "The import link is incomplete. Click the bookmark again on Backloggd." };
  try {
    const b64 = match[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof data !== "object" || data === null || typeof data.v !== "number") throw new Error();
    if (!Array.isArray(data.missing)) data.missing = [];
    return data as ImportPayload;
  } catch {
    return { error: "The import link is damaged. Click the bookmark again on Backloggd." };
  }
}
