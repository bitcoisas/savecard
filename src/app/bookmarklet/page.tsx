import type { Metadata } from "next";
import Link from "next/link";
import { BookmarkletInstall } from "@/components/BookmarkletInstall";

export const metadata: Metadata = {
  title: "Import from Backloggd | Savecard",
};

const PROBLEMS = [
  {
    message: "This bookmark only works on backloggd.com",
    fix: "You clicked it on another site. Open your review or game log on Backloggd first.",
  },
  {
    message: "Backloggd is still checking your browser",
    fix: "Backloggd shows a short check before some pages. Wait until your review appears, then click the bookmark again.",
  },
  {
    message: "Open one of your reviews or a game log",
    fix: "The bookmark reads review pages (backloggd.com/u/you/review/…) and log pages (backloggd.com/u/you/logs/game). Game pages, profiles and lists are not supported yet.",
  },
  {
    message: "Some details were not on that page",
    fix: "Review pages do not always show the platform or time played. Fill them in on Savecard, or use the log page of the game, which usually has them.",
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

export default function BookmarkletPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <Link href="/" className="font-heading text-3xl font-bold">
        savecard
        <span className="save-cursor" aria-hidden />
      </Link>

      <h1 className="mt-10 font-heading text-4xl font-bold">
        Import from Backloggd
      </h1>
      <p className="mt-3 text-lg text-muted">
        Add a bookmark to your browser. When you click it on one of your Backloggd reviews or
        game logs, Savecard opens with the game, cover, rating, status and review already filled
        in.
      </p>

      <BookmarkletInstall />

      <h2 className="mt-12 font-heading text-2xl font-bold">If something goes wrong</h2>
      <p className="mt-2 text-muted">
        The bookmark shows a message in the corner of the Backloggd page. This is what each one
        means.
      </p>
      <dl className="mt-4 space-y-4">
        {PROBLEMS.map((p) => (
          <div key={p.message} className="rounded-lg border-2 border-line bg-panel p-4">
            <dt className="font-semibold">{p.message}</dt>
            <dd className="mt-1 text-muted">{p.fix}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 font-heading text-2xl font-bold">Privacy</h2>
      <p className="mt-2 text-muted">
        The bookmark only reads the Backloggd page you have open and the page of that game. The
        data travels to Savecard inside the link itself and is never stored on a server.
      </p>

      <p className="mt-12 text-sm text-muted">
        Savecard is not affiliated with Backloggd.{" "}
        <a className="underline underline-offset-2" href="https://github.com/bitcoisas/savecard/issues">
          Report a problem
        </a>
      </p>
    </main>
  );
}
