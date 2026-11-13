# Cyber Morning Brief

Daily cybersecurity news — breaches, CVEs, threat intel, blue team, policy — compiled each morning by a scheduled Claude routine and published with GitHub Pages.

**Site:** https://news.4x-labs.com/

## How it works

1. A scheduled Claude Code routine runs every morning with the prompt in [`ROUTINE_PROMPT.md`](ROUTINE_PROMPT.md).
2. It researches the last 24 h, cross-checks new [Security Now](https://www.grc.com/securitynow.htm) transcripts against the past briefs, writes `_posts/YYYY-MM-DD-brief.md`, runs `scripts/items.py` and pushes to `main`.
3. GitHub Pages rebuilds the Jekyll site (no Actions or plugins beyond `jekyll-feed` needed).

## Layout

| Path | Purpose |
| --- | --- |
| `_posts/` | One Markdown brief per day |
| `_items/` | One generated share page per news item (`/i/<id>/`) — don't edit by hand |
| `scripts/items.py` | Adds missing item IDs to posts and regenerates `_items/`; `--check` verifies |
| `_data/categories.yml` | Section IDs, names, tags (must match the `{#id}` headers in posts) |
| `_data/securitynow.yml` | Last Security Now episode that was cross-checked |
| `index.html` | Shows the latest brief |
| `categories.html` | Last 14 days per category (tabs) |
| `security-now.html` | All Security Now cross-checks |
| `archive.html` | Every brief by month |
| `assets/js/brief.js` | Turns `` `CRITICAL` `` / `` `#vuln` `` code spans into badges, item counts, filter box, tabs, item permalink + share button |
| `assets/js/item.js` | Sends visitors of an item share page on to the item inside its brief |

## Post format

See `ROUTINE_PROMPT.md` → Step 4. In short: `## Name {#section-id}` headers, one bullet per item, **bold headline**, tags as inline code, links separated by ` · `.

## Item IDs and sharing

Every news item has a short, permanent ID written into the post: `- {:#n261113-03} **Headline** …` (`n` + post date `YYMMDD` + sequence number). `scripts/items.py` assigns IDs to new items (next free number for that date), never renumbers existing ones, and writes `_items/<id>.md`.

- `/YYYY/MM/DD/#<id>` jumps to the item in its brief (highlighted; the Categories page opens the right tab).
- `/i/<id>/` is the share link: a static page with Open Graph / Twitter meta (headline as title; tags plus description as text) so chat apps and social networks show a preview of that one item. Browsers are redirected to the item in its brief.
- Each item shows its ID (permalink) and a **Share** button: the system share sheet where the browser supports it, otherwise copying the `/i/<id>/` link to the clipboard.

```sh
python3 scripts/items.py          # after writing/updating a post
python3 scripts/items.py --check  # exits 1 if IDs or item pages are missing or stale
```

## Local preview

```sh
gem install --user-install jekyll jekyll-feed kramdown-parser-gfm webrick
jekyll serve   # http://localhost:4000/
```
