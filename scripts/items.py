#!/usr/bin/env python3
"""Give every news item an ID and generate one share page per item.

Run from the repository root after writing or updating a post:

    python3 scripts/items.py            # assign missing IDs, regenerate _items/
    python3 scripts/items.py --check    # exit 1 if anything is missing or stale

What it does:
1. Every top-level bullet in _posts/*.md (except the Sources section) gets a
   kramdown ID: `- {:#n261113-03} **Headline** ...`. The ID is `n` + the post's
   date (YYMMDD) + a sequence number. Existing IDs are never changed; new items
   get the next free number for that date, so shared links stay valid when a
   post is updated or reordered.
2. For each item it writes _items/<id>.md (served at /i/<id>/), whose front
   matter feeds the Open Graph / Twitter preview (headline, tags, description)
   and whose body is the item itself. If an item is later removed from its
   post, its page is kept (old shared links still work) and its ID is never
   handed out again.

Standard library only.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTS = ROOT / "_posts"
ITEMS = ROOT / "_items"

POST_NAME = re.compile(r"^(\d{4})-(\d{2})-(\d{2})-[\w-]+\.md$")
SECTION = re.compile(r"^## .*\{#([\w-]+)\}\s*$")
BULLET = re.compile(r"^- (?:\{:\s*#(n\d{6}-\d+)\s*\}\s*)?(.*)$")
ID_RE = re.compile(r"^n\d{6}-\d+$")
HEADLINE = re.compile(r"^\*\*(.+?)\*\*\s*")
CODE = re.compile(r"^`([^`]+)`\s*")
LINK = re.compile(r"\[([^\]]*)\]\(([^)\s]+)\)")
SKIP_SECTIONS = {"sources"}
DESC_MAX = 220


def front_matter_end(lines):
    """Index of the line after the closing '---' of the front matter."""
    if not lines or lines[0].strip() != "---":
        return 0
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return i + 1
    return 0


def plain(md):
    """Markdown fragment -> plain text for the preview description."""
    md = LINK.sub(lambda m: m.group(1), md)
    md = md.replace("`", "")
    md = re.sub(r"(\*\*|__|\*|_)(\S.*?\S|\S)\1", r"\2", md)
    return re.sub(r"\s+", " ", md).strip()


def truncate(text, limit=DESC_MAX):
    if len(text) <= limit:
        return text
    cut = text[: limit - 1].rsplit(" ", 1)[0].rstrip(" ,;:—-")
    return cut + "…"


def parse_item(rest):
    """Split the bullet text after the ID into headline, tags, description, links."""
    m = HEADLINE.match(rest)
    headline = plain(m.group(1)) if m else ""
    tail = rest[m.end():] if m else rest
    tags = []
    while True:
        c = CODE.match(tail)
        if not c:
            break
        tags.append(c.group(1).strip())
        tail = tail[c.end():]
    tail = re.sub(r"^[—–-]\s*", "", tail)
    # Trailing source links: "[A](…) · [B](…)" at the end of the bullet.
    sources = []
    trail = re.search(r"((?:\s*·?\s*\[[^\]]*\]\([^)\s]+\))+)\s*$", tail)
    if trail:
        sources = [{"name": n, "url": u} for n, u in LINK.findall(trail.group(1))]
        tail = tail[: trail.start()]
    desc = truncate(plain(tail))
    if not headline:
        headline = truncate(plain(rest), 100)
    return headline, tags, desc, sources


def yaml_str(value):
    # JSON strings are valid YAML scalars and escape everything that matters.
    return json.dumps(value, ensure_ascii=False)


def main(check=False):
    posts = sorted(p for p in POSTS.glob("*.md") if POST_NAME.match(p.name))
    changed_posts, items = [], {}

    # Pass 1: collect existing IDs (in posts and already-generated pages) so
    # new numbers never collide with, or reuse, an ID that was ever published.
    used = {}
    for p in (ITEMS.glob("*.md") if ITEMS.exists() else []):
        if ID_RE.match(p.stem):
            prefix, num = p.stem.split("-")
            used.setdefault(prefix, set()).add(int(num))
    for path in posts:
        for line in path.read_text(encoding="utf-8").splitlines():
            m = BULLET.match(line)
            if m and m.group(1):
                prefix, num = m.group(1).split("-")
                used.setdefault(prefix, set()).add(int(num))

    # Pass 2: assign missing IDs and collect items.
    for path in posts:
        y, mo, d = POST_NAME.match(path.name).groups()
        prefix = "n" + y[2:] + mo + d
        post_url = f"/{y}/{mo}/{d}/"
        text = path.read_text(encoding="utf-8")
        lines = text.split("\n")
        section, dirty = None, False
        for i in range(front_matter_end(lines), len(lines)):
            line = lines[i]
            s = SECTION.match(line)
            if s:
                section = s.group(1)
                continue
            if line.startswith("## "):
                section = None
                continue
            m = BULLET.match(line)
            if not m or section is None or section in SKIP_SECTIONS:
                continue
            item_id, rest = m.group(1), m.group(2)
            if not item_id:
                taken = used.setdefault(prefix, set())
                num = max(taken, default=0) + 1
                taken.add(num)
                item_id = f"{prefix}-{num:02d}"
                lines[i] = f"- {{:#{item_id}}} {rest}"
                dirty = True
            if item_id in items:
                sys.exit(f"duplicate item ID {item_id} in {path.name}")
            headline, tags, desc, sources = parse_item(rest)
            items[item_id] = {
                "date": f"{y}-{mo}-{d}",
                "post_url": post_url,
                "section": section,
                "headline": headline,
                "tags": tags,
                "description": desc,
                "sources": sources,
                "body": rest,
            }
        if dirty:
            changed_posts.append(path)
            if not check:
                path.write_text("\n".join(lines), encoding="utf-8")

    # Pass 3: render _items/<id>.md
    wanted = {}
    for item_id, it in items.items():
        fm = [
            "---",
            f"item_id: {item_id}",
            f"date: {it['date']}",
            f"post_url: {it['post_url']}",
            f"section: {it['section']}",
            f"title: {yaml_str(it['headline'])}",
            f"tags: {yaml_str(it['tags'])}",
            f"description: {yaml_str(it['description'])}",
            f"sources: {yaml_str(it['sources'])}",
            "---",
            "",
            "- " + it["body"],
            "",
        ]
        wanted[item_id + ".md"] = "\n".join(fm)

    orphaned, written = [], []
    existing = {p.name: p for p in ITEMS.glob("*.md")} if ITEMS.exists() else {}
    for name, content in wanted.items():
        p = existing.get(name)
        if p is None or p.read_text(encoding="utf-8") != content:
            written.append(name)
            if not check:
                ITEMS.mkdir(exist_ok=True)
                (ITEMS / name).write_text(content, encoding="utf-8")
    orphaned = [n for n in existing if n not in wanted and ID_RE.match(n[:-3])]

    mode = "check: " if check else ""
    print(f"{mode}{len(items)} items · posts needing IDs: {len(changed_posts)} · "
          f"item pages to write: {len(written)} · orphaned pages kept: {len(orphaned)}")
    if check and (changed_posts or written):
        for p in changed_posts:
            print(f"  missing IDs: {p.name}")
        for n in written[:20]:
            print(f"  out of date: _items/{n}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(check="--check" in sys.argv[1:]))
