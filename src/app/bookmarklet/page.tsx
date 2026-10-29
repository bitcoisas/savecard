import type { Metadata } from "next";
import Link from "next/link";
import { BookmarkletInstall } from "@/components/BookmarkletInstall";

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

export default function BookmarkletPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <Link href="/" className="font-heading text-3xl font-bold">
        savecard
        <span className="save-cursor" aria-hidden />
      </Link>

      <h1 className="mt-10 font-heading text-4xl font-bold">Import from Backloggd</h1>
      <p className="mt-3 text-lg text-muted">
        With the Savecard bookmark, one click on your Backloggd review opens Savecard with the
        game, cover, rating, status and review already filled in.
      </p>

      <section className="mt-8 rounded-lg border-2 border-accent bg-panel p-6">
        <h2 className="font-heading text-xl font-bold">Before you start</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>You need a Backloggd account and to be logged in.</li>
          <li>You need a review of the game you want on your card.</li>
          <li>You only install the bookmark once, then use it for every card.</li>
        </ul>
      </section>

      <h2 className="mt-12 font-heading text-2xl font-bold">1. Install the bookmark</h2>
      <div className="mt-4">
        <BookmarkletInstall />
      </div>

      <h2 className="mt-12 font-heading text-2xl font-bold">2. Create a card from a review</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-5">
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
          Check that the address looks like backloggd.com/u/you/review/12345. If it does, you are
          on the right page.
        </li>
        <li>
          Use the Savecard bookmark. On a computer, click it in the bookmarks bar. On iPhone, open
          your bookmarks and tap Savecard. On Android, type Savecard in the address bar and tap
          the bookmark in the suggestions.
        </li>
        <li>
          Savecard opens in a new tab. Fill in anything it lists as missing, such as the platform
          or the time played, pick a format and download your card.
        </li>
      </ol>

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
