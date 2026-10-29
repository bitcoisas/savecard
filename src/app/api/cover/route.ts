// Fetches a cover image from an allowed host so the browser can draw it on
// a canvas and export the card without running into CORS errors.

const ALLOWED_HOSTS = new Set(["images.igdb.com"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("url");
  if (!target) {
    return Response.json({ error: "Missing url parameter." }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return Response.json({ error: "The url is not valid." }, { status: 400 });
  }

  if (url.protocol !== "https:" || !ALLOWED_HOSTS.has(url.hostname)) {
    return Response.json(
      { error: "Only https cover links from images.igdb.com are supported." },
      { status: 400 },
    );
  }

  // Ask IGDB for the large cover size when a smaller one was pasted.
  url.pathname = url.pathname.replace(/\/t_[a-z0-9_]+\//, "/t_cover_big_2x/");

  const upstream = await fetch(url, { redirect: "error" });
  const type = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !type.startsWith("image/")) {
    return Response.json({ error: "Could not load that cover." }, { status: 502 });
  }

  const body = await upstream.arrayBuffer();
  if (body.byteLength > MAX_BYTES) {
    return Response.json({ error: "That image is too large." }, { status: 413 });
  }

  return new Response(body, {
    headers: {
      "content-type": type,
      "cache-control": "public, max-age=86400",
    },
  });
}
