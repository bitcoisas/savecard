// Covers are loaded straight from IGDB, which allows requests from any site,
// so Savecard can run as a static page without a server.

const ALLOWED_HOSTS = new Set(["images.igdb.com"]);
const MAX_BYTES = 8 * 1024 * 1024;

export function normalizeCoverUrl(link: string): URL {
  let url: URL;
  try {
    url = new URL(link.trim().replace(/^\/\//, "https://"));
  } catch {
    throw new Error("That link is not valid.");
  }
  if (url.protocol === "http:") url.protocol = "https:";
  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    throw new Error("Only cover links from images.igdb.com are supported.");
  }
  // Ask IGDB for the large cover size when a smaller one was pasted.
  url.pathname = url.pathname.replace(/\/t_[a-z0-9_]+\//, "/t_cover_big_2x/");
  return url;
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function fetchCover(link: string): Promise<string> {
  const url = normalizeCoverUrl(link);
  let res: Response;
  try {
    res = await fetch(url, { mode: "cors" });
  } catch {
    throw new Error("Could not reach IGDB. Check your connection and try again.");
  }
  const blob = await res.blob();
  if (!res.ok || !blob.type.startsWith("image/")) throw new Error("Could not load that cover.");
  if (blob.size > MAX_BYTES) throw new Error("That image is too large.");
  return readAsDataUrl(blob);
}

export { readAsDataUrl };
