"use client";

import { useEffect, useRef, useState } from "react";
import { buildBookmarklet } from "@/lib/bookmarklet";

function bookmarkletCode() {
  return buildBookmarklet(window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH ?? ""));
}

/** The button people drag to their bookmarks bar. */
export function BookmarkletButton() {
  const link = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // React refuses javascript: links in props, so the href is set directly.
    link.current?.setAttribute("href", bookmarkletCode());
  }, []);

  return (
    <a
      ref={link}
      onClick={(e) => e.preventDefault()}
      draggable
      title="Drag me to your bookmarks bar"
      className="btn inline-block cursor-grab bg-accent px-5 py-2.5 text-xl text-accent-ink"
    >
      Savecard
    </a>
  );
}

/** Copies the bookmarklet code, for phones where dragging is not possible. */
export function CopyBookmarkletButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(bookmarkletCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="btn bg-field px-4 py-2 text-lg text-ink hover:bg-line"
    >
      {copied ? "Copied" : "Copy bookmark code"}
    </button>
  );
}
