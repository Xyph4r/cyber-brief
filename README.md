# Cyber Morning Brief

Daily cybersecurity news — breaches, CVEs, threat intel, blue team, policy — compiled each morning by a scheduled Claude routine and published with GitHub Pages.

**Site:** https://xyph4r.github.io/cyber-brief/

## How it works

1. A scheduled Claude Code routine runs every morning with the prompt in [`ROUTINE_PROMPT.md`](ROUTINE_PROMPT.md).
2. It researches the last 24 h, cross-checks new [Security Now](https://www.grc.com/securitynow.htm) transcripts against the past briefs, writes `_posts/YYYY-MM-DD-brief.md` and pushes to `main`.
3. GitHub Pages rebuilds the Jekyll site (no Actions or plugins beyond `jekyll-feed` needed).

## Layout

| Path | Purpose |
| --- | --- |
| `_posts/` | One Markdown brief per day |
| `_data/categories.yml` | Section IDs, names, tags (must match the `{#id}` headers in posts) |
| `_data/securitynow.yml` | Last Security Now episode that was cross-checked |
| `index.html` | Shows the latest brief |
| `categories.html` | Last 14 days per category (tabs) |
| `security-now.html` | All Security Now cross-checks |
| `archive.html` | Every brief by month |
| `assets/js/brief.js` | Turns `` `CRITICAL` `` / `` `#vuln` `` code spans into badges, item counts, filter box, tabs |

## Post format

See `ROUTINE_PROMPT.md` → Step 4. In short: `## Name {#section-id}` headers, one bullet per item, **bold headline**, tags as inline code, links separated by ` · `.

## Local preview

```sh
gem install --user-install jekyll jekyll-feed kramdown-parser-gfm webrick
jekyll serve   # http://localhost:4000/cyber-brief/
```
