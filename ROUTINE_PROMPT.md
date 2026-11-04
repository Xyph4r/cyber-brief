You are preparing the daily cyber security morning brief for me and a friend. I'm studying for a BSc in Cyber Security and want to stay current across the whole field. The brief is published as a page on a GitHub Pages site (this repository, Jekyll). Use WebSearch (and WebFetch for articles) to find what happened in roughly the last 24 hours (on Mondays, cover the weekend too). Use the actual current date (Europe/Berlin) in your searches.

## Step 1 — Avoid repeats
Read the three most recent files in `_posts/`. Don't repeat items already covered there unless there is a significant development (then say what's new and mark it `UPDATE`).

## Step 2 — Research the day
Cover these sections, keeping only items that are genuinely new and significant:
1. Top stories (3-5 of the most important items of the day, each with a sentence on why it matters)
2. Breaches & incidents: notable data breaches, ransomware attacks, outages caused by attacks
3. Vulnerabilities & patches: new CVEs under active exploitation (check the CISA KEV catalog), critical vendor advisories, zero-days, Patch Tuesday when relevant
4. Threat intelligence & red team: new APT/threat-actor campaigns, malware families, offensive techniques, notable security research, new red-team / pentest tooling
5. Blue team & defense: detection engineering, new defensive tools, DFIR write-ups, hardening guidance, SOC and threat-hunting content
6. Industry, policy & developments: regulation (especially EU, e.g. NIS2, CRA, GDPR enforcement, and Germany/BSI), major vendor news, AI-and-security developments
7. Worth reading / learning: 1-3 in-depth blog posts, write-ups or talks that are good for learning

Sources to check (plus anything else credible you find): BleepingComputer, The Hacker News, SecurityWeek, Dark Reading, The Record (Recorded Future News), KrebsOnSecurity, Ars Technica security, Wired security, Help Net Security, CISA advisories and KEV, BSI (German Federal Office for Information Security), Heise Security, Schneier on Security, SANS Internet Storm Center diary, Google Project Zero, Google Threat Intelligence / Mandiant blog, Microsoft Security / MSRC blog, Cisco Talos, Unit 42 (Palo Alto), CrowdStrike blog, SpecterOps blog, Rapid7 blog, Red Canary blog, The DFIR Report, Risky Business News.

Link every item to its original source (the deep-dive article, advisory, or research post — prefer the primary source such as the vendor advisory or researcher's write-up, and add a news article as second link where useful). Never invent a URL; only link pages you actually found.

## Step 3 — Security Now cross-check
1. Read `_data/securitynow.yml` (`last_episode`).
2. Fetch https://www.grc.com/securitynow.htm and find the highest episode number N that has a transcript link `/sn/sn-N.txt`.
3. If N > last_episode, process each new episode (oldest first, at most 2): download `https://www.grc.com/sn/sn-N.txt` (use `curl` in Bash if available, otherwise WebFetch asking for a complete list of every news item and topic discussed). Note the episode title.
4. Compare every topic in the episode against the briefs in `_posts/` from the last 10 days (grep for CVE IDs, vendor and product names, threat-actor names).
5. Topics that were missed, or covered only superficially, go into a `## Security Now cross-check {#security-now}` section (see format). Find and link the original source for each, plus the transcript. Add one compact line listing topics that were already covered, linking to the earlier brief.
6. Add `securitynow: N` and `securitynow_title: "<episode title>"` to the post front matter, and set `last_episode: N` in `_data/securitynow.yml`.
If there is no new transcript, skip this section entirely.

## Step 4 — Write the post
Create `_posts/YYYY-MM-DD-brief.md` (today's date). If it already exists, update it instead of creating a second one. Follow this format exactly — the website relies on the section IDs and tag spellings:

```markdown
---
title: "Cyber Brief — Wednesday, 4 November 2026"
date: 2026-11-04 07:00:00 +0100
tldr: "One sentence: the single most important thing today."
---

## Top stories {#top}

- **Short headline** `#vuln` `CRITICAL` `EXPLOITED` — What happened in 1-2 sentences. *Why it matters:* one sentence. [Vendor advisory](https://…) · [BleepingComputer](https://…)

## Breaches & incidents {#breaches}

- **Company X hit by ransomware** `#breach` — 1-2 sentences. [The Record](https://…)

## Vulnerabilities & patches {#vulns}

- **CVE-2026-12345 — Product name** `CRITICAL` `EXPLOITED` `KEV` — 1-2 sentences, incl. affected versions and fix. [Advisory](https://…) · [CISA KEV](https://…)

## Threat intel & red team {#threat-intel}

## Blue team & defense {#blue-team}

## Industry, policy & developments {#industry}

## Worth reading {#learning}

## Security Now cross-check {#security-now}

### SN #1103 — "Episode title"

- **Missed topic** `#vuln` — 1-2 sentences on what Steve/Leo said and why it matters. [Original source](https://…) · [Transcript](https://www.grc.com/sn/sn-1103.txt)

*Already covered:* Topic A ([4 Nov](/cyber-brief/2026/11/04/#vulns)), Topic B (…)

## Sources {#sources}

- [BleepingComputer](https://www.bleepingcomputer.com/)
- …
```

Rules:
- Section IDs: `top`, `breaches`, `vulns`, `threat-intel`, `blue-team`, `industry`, `learning`, `security-now`, `sources`. Keep this order. Leave out any section with nothing meaningful rather than padding it.
- Every item is one top-level bullet starting with a **bold headline**, then tags as inline code, then ` — ` and 1-2 sentences, then links separated by ` · `.
- Category tags (required in Top stories and Security Now, optional elsewhere): `#breach`, `#vuln`, `#threat`, `#defense`, `#industry`, `#learning`. Free-form topic tags are fine too, e.g. `#ransomware`, `#ai`, `#eu`, `#germany`.
- Severity / status tags (vulnerabilities, and wherever relevant): `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `EXPLOITED`, `ZERO-DAY`, `KEV`, `POC`, `PATCH`, `UPDATE`.
- The Sources section is a plain list of the outlets you used, each linked.
- Keep the whole brief readable in about 5-10 minutes.

## Step 5 — Publish
Commit the post (and `_data/securitynow.yml` if changed) with the message `brief: YYYY-MM-DD` and push to the `main` branch. If the push is rejected because the remote moved, `git pull --rebase` and push again. Don't modify any other files.

Then, if a SendUserMessage tool is available, send me the top stories as a short list plus the link https://xyph4r.github.io/cyber-brief/YYYY/MM/DD/ — no commentary about how you made it.
