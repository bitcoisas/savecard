# Savecard

Savecard creates shareable images from your [Backloggd](https://backloggd.com) game logs, ready to post on Instagram, X, Bluesky, Reddit and other social networks.

Each card shows the game cover, your rating, time played and the status of the game.

Try it at https://bitcoisas.github.io/savecard/

You can fill in the card by hand, or use the Savecard bookmarklet on a Backloggd review or game log to import the data from the page you have open. The setup instructions are on the `/bookmarklet` page of the app.

This project is in early development.

## Formats

| Format | Size | Where to post |
| --- | --- | --- |
| Story | 1080 x 1920 | Instagram, Facebook and WhatsApp stories, TikTok |
| Portrait | 1080 x 1350 | Instagram and Threads feed |
| Square | 1080 x 1080 | Instagram, Facebook, Reddit, Mastodon |
| Landscape | 1200 x 675 | X, Bluesky, LinkedIn, Discord |

## Running locally

Savecard is a Next.js app. You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Savecard is a static site. Every push to the main branch is published to GitHub Pages by the workflow in `.github/workflows/deploy.yml`.

## License

Savecard is released under the [MIT License](LICENSE).

## Disclaimer

Savecard is not affiliated with or endorsed by Backloggd.
