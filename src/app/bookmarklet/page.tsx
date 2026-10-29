import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BookmarkletButton, CopyBookmarkletButton } from "@/components/BookmarkletInstall";

export const metadata: Metadata = {
  title: "Import from Backloggd | Savecard",
};

const PROBLEMS = [
  {
    message: "This bookmark only works on backloggd.com",
    fix: "You clicked it on another site. Open your review on Backloggd first.",
  },
  {
    message: "Backloggd is still checking your browser",
    fix: "Backloggd shows a short check before some pages. Wait until your review appears, then use the bookmark again.",
  },
  {
    message: "Open your review first",
    fix: "The bookmark only works on the page of a single review, the one that opens when you click Open review. Its address looks like backloggd.com/u/you/review/12345.",
  },
  {
    message: "Some details were not on that page",
    fix: "Review pages do not always show the platform or the time played. Fill them in on Savecard before downloading.",
  },
  {
    message: "Could not read this page",
    fix: "Backloggd probably changed its layout. Open an issue on GitHub with the link you tried, and fill in the card by hand in the meantime.",
  },
  {
    message: "Nothing happens when I click",
    fix: "Your browser may be blocking pop ups. Allow them for backloggd.com, or the bookmark will open Savecard in the same tab.",
  },
];

function Guide({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="guide rounded-lg border-2 border-line bg-panel">
      <summary className="cursor-pointer px-5 py-4 font-heading text-lg">{title}</summary>
      <div className="px-5 pb-5">{children}</div>
    </details>
  );
}

export default function BookmarkletPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <Link href="/" className="font-heading text-3xl font-bold">
        savecard
        <span className="save-cursor" aria-hidden />
      </Link>

      <h1 className="mt-10 font-heading text-4xl font-bold">Import from Backloggd</h1>
      <p className="mt-3 text-lg text-muted">
        Drag the button to your bookmarks bar. Then open one of your reviews on Backloggd and
        click the bookmark: Savecard opens with the game, cover, rating, status and review
        already filled in.
      </p>

      <div className="mt-6">
        <BookmarkletButton />
      </div>

      <h2 className="mt-12 font-heading text-2xl font-bold">Need help?</h2>
      <div className="mt-4 space-y-3">
        <Guide title="Set it up on a computer">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Show the bookmarks bar. In most browsers the shortcut is Ctrl+Shift+B, or
              Cmd+Shift+B on a Mac.
            </li>
            <li>Drag the yellow Savecard button above to the bookmarks bar.</li>
            <li>That is it. You only do this once.</li>
          </ol>
        </Guide>

        <Guide title="Set it up on a phone">
          <p className="text-muted">
            Phones do not let you drag bookmarks, so you create one by hand and paste the code
            into it.
          </p>
          <div className="mt-4">
            <CopyBookmarkletButton />
          </div>
          <h3 className="mt-6 font-semibold">iPhone and iPad (Safari)</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>Tap the share button on this page and choose Add Bookmark. Save it.</li>
            <li>Open your bookmarks, tap Edit and select the bookmark you just saved.</li>
            <li>Rename it to Savecard, delete the address and paste the code you copied.</li>
          </ol>
          <h3 className="mt-6 font-semibold">Android (Chrome)</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>Tap the menu and then the star to bookmark this page.</li>
            <li>Tap Edit on the message that appears, or find the bookmark under Bookmarks.</li>
            <li>Rename it to Savecard, delete the URL and paste the code you copied.</li>
          </ol>
        </Guide>

        <Guide title="Create a card from a review">
          <p className="text-muted">
            You need a Backloggd account and a review of the game you want on your card.
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              Go to{" "}
              <a className="text-accent underline underline-offset-2" href="https://backloggd.com">
                backloggd.com
              </a>{" "}
              and log in.
            </li>
            <li>Click your username at the top of the page to open your profile.</li>
            <li>Open the Reviews tab.</li>
            <li>Find the review of the game you want and click Open review.</li>
            <li>
              Check that the address looks like backloggd.com/u/you/review/12345. If it does, you
              are on the right page.
            </li>
            <li>
              Use the Savecard bookmark. On a computer, click it in the bookmarks bar. On iPhone,
              open your bookmarks and tap Savecard. On Android, type Savecard in the address bar
              and tap the bookmark in the suggestions.
            </li>
            <li>
              Savecard opens in a new tab. Fill in anything it lists as missing, such as the
              platform or the time played, pick a format and download your card.
            </li>
          </ol>
        </Guide>

        <Guide title="Something went wrong">
          <p className="text-muted">
            The bookmark shows a message in the corner of the Backloggd page. This is what each
            one means.
          </p>
          <dl className="mt-4 space-y-4">
            {PROBLEMS.map((p) => (
              <div key={p.message}>
                <dt className="font-semibold">{p.message}</dt>
                <dd className="mt-1 text-muted">{p.fix}</dd>
              </div>
            ))}
          </dl>
        </Guide>
      </div>

      <p className="mt-12 text-sm text-muted">
        The bookmark only reads the Backloggd page you have open and the page of that game. The
        data travels to Savecard inside the link itself and is never stored on a server.
        Savecard is not affiliated with Backloggd.{" "}
        <a
          className="underline underline-offset-2"
          href="https://github.com/bitcoisas/savecard/issues"
        >
          Report a problem
        </a>
      </p>
    </main>
  );
}
