"use client";

import { useEffect, useRef, useState } from "react";
import { buildBookmarklet } from "@/lib/bookmarklet";

export function BookmarkletInstall() {
  const link = useRef<HTMLAnchorElement>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const value = buildBookmarklet(
      window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH ?? ""),
    );
    // React refuses javascript: links in props, so the href is set directly.
    link.current?.setAttribute("href", value);
    queueMicrotask(() => setCode(value));
  }, []);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-8 rounded-lg border-2 border-line bg-panel p-6">
      <h2 className="font-heading text-2xl font-bold">On a computer</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>
          Show the bookmarks bar. In most browsers the shortcut is Ctrl+Shift+B, or Cmd+Shift+B on
          a Mac.
        </li>
        <li>
          Drag this button to the bookmarks bar:
          <div className="mt-3">
            <a
              ref={link}
              onClick={(e) => e.preventDefault()}
              draggable
              className="btn inline-block cursor-grab bg-accent px-5 py-2.5 text-xl text-accent-ink"
            >
              Savecard
            </a>
          </div>
        </li>
        <li>Open one of your reviews or game logs on Backloggd.</li>
        <li>Click the Savecard bookmark. Your card opens in a new tab.</li>
      </ol>

      <h2 className="mt-8 font-heading text-2xl font-bold">On a phone</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>Copy the bookmark code.</li>
        <li>Bookmark any page, then edit that bookmark: name it Savecard and paste the code as its address.</li>
        <li>
          On your Backloggd review, type Savecard in the address bar and pick the bookmark from the
          suggestions.
        </li>
      </ol>
      <button
        type="button"
        onClick={copy}
        disabled={!code}
        className="btn mt-4 bg-field px-4 py-2 text-lg text-ink hover:bg-line disabled:opacity-50"
      >
        {copied ? "Copied" : "Copy bookmark code"}
      </button>
    </div>
  );
}
