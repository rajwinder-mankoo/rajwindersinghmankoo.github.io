---
layout: writeup.njk
title: "Example Writeup: Pipeline Test"
date: 2026-08-01
summary: "Demonstrates the vault note → front matter → src/writeups/*.md → published pipeline. Marked draft, does not appear on the live site."
draft: true
---

This file exists to prove the writeups pipeline works end to end: front matter parses, the layout renders, and the collection picks it up (unless `draft: true`, as here).

To publish a real writeup:

1. Take the source content from the relevant Obsidian vault note (e.g. a `15-Lab-Reports/` entry or a project's `Lessons-Learned.md`)
2. Copy it into a new file here: `src/writeups/your-slug.md`
3. Add front matter: `title`, `date`, `summary`, `layout: writeup.njk`
4. Remove `draft: true` (or don't add it) when ready to publish
5. Commit and push. The GitHub Actions workflow rebuilds and deploys automatically

No HTML transcription step, no manual nav/footer duplication. That's the whole point of this migration.
