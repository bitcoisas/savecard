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
    <div className="space-y-4">
      <section className="rounded-lg border-2 border-line bg-panel p-6">
        <h3 className="font-heading text-xl font-bold">On a computer</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>
            Show the bookmarks bar. In most browsers the shortcut is Ctrl+Shift+B, or Cmd+Shift+B
            on a Mac.
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
        </ol>
      </section>

      <section className="rounded-lg border-2 border-line bg-panel p-6">
        <h3 className="font-heading text-xl font-bold">On a phone</h3>
        <p className="mt-2 text-muted">
          Phones do not let you drag bookmarks, so you create one by hand and paste the code into
          it.
        </p>
        <button
          type="button"
          onClick={copy}
          disabled={!code}
          className="btn mt-4 bg-field px-4 py-2 text-lg text-ink hover:bg-line disabled:opacity-50"
        >
          {copied ? "Copied" : "Copy bookmark code"}
        </button>

        <h4 className="mt-6 font-semibold">iPhone and iPad (Safari)</h4>
        <ol className="mt-2 list-decimal space-y-2 pl-5">
          <li>Tap the share button on this page and choose Add Bookmark. Save it.</li>
          <li>Open your bookmarks, tap Edit and select the bookmark you just saved.</li>
          <li>Rename it to Savecard, delete the address and paste the code you copied.</li>
        </ol>

        <h4 className="mt-6 font-semibold">Android (Chrome)</h4>
        <ol className="mt-2 list-decimal space-y-2 pl-5">
          <li>Tap the menu and then the star to bookmark this page.</li>
          <li>Tap Edit on the message that appears, or find the bookmark under Bookmarks.</li>
          <li>Rename it to Savecard, delete the URL and paste the code you copied.</li>
        </ol>
      </section>
    </div>
  );
}
