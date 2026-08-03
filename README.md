# rajwindersinghmankoo.dev — Eleventy Rebuild

## What happened
The original migration (per ADR-WEB-001 in the vault) was built and verified locally in an earlier session but never committed — that local work was lost. This is a full rebuild, done by pulling the **original, still-live** `index.html` / `style.css` / `script.js` directly from the [`rajwindersinghmankoo.github.io`](https://github.com/rajwinder-mankoo/rajwindersinghmankoo.github.io) repo (that repo was never touched by the lost migration, so it was still the correct source of truth) and rebuilding the Eleventy scaffold around it from scratch, matching the ADR's original plan.

**This build has been tested — `npm install && npm run build` runs clean, output verified.**

## Structure
```
.
├── .eleventy.js              # Eleventy config
├── .github/workflows/deploy.yml   # CI/CD — build + deploy to GitHub Pages
├── CNAME                     # rajwindersinghmankoo.dev
├── package.json
└── src/
    ├── index.njk              # The homepage — full page, data-driven
    ├── style.css               # Original design, unchanged, plus a small
    │                            # status-badge block added for the Labs section
    ├── script.js                # Original, with the typewriter effect changed
    │                            # to read phrases from data-phrases (site.json)
    │                            # instead of a hardcoded array
    ├── assets/
    │   └── favicon.png          # Recovered. Check the original repo for any
    │                            # other assets (og-image, resume, etc.) I may
    │                            # have missed — I only knew to look for this one.
    ├── _data/
    │   ├── site.json            # Single source of truth: hero copy, typewriter
    │   │                        # phrases, contact links. Edit this, not the HTML.
    │   └── labs.json             # The 6 c0mpl1cated.labs projects — status,
    │                             # description, tags. Edit this to update the
    │                             # roadmap section; no HTML editing needed.
    ├── _includes/
    │   └── writeup.njk           # Layout for individual writeup pages
    └── writeups/
        └── example-writeup.md    # Pipeline demo, marked draft — doesn't show
                                   # on the live writeups list. See its own
                                   # content for how to publish a real one.
```

## What changed from the original site (beyond the format migration)
- **Positioning reframed** to detection engineer / purple team, matching the project charter's actual target roles — the original site said "penetration tester or red team operator." This was the reframing the lost migration was supposed to ship; applied fresh here.
- **Projects section replaced** with a live-data Labs section pulling from `labs.json` — the original 3 hand-written project cards (AD Homelab, BSides CTF, Custom Tools) are gone, replaced by the actual 6-project c0mpl1cated.labs roadmap with real current status (Project 00 stable, Project 01 core objective achieved, 02–05 not started).
- **Repo links intentionally omitted** from the Labs cards — none of the 6 project GitHub repos exist yet (per Project 00's Backlog, repo creation is still an open item). `labs.json` has a `repo` field ready to populate once they exist; the template already conditionally renders the link only when `repo` isn't null.
- **ISC2 CC certification still missing** — carried forward from the original ADR's own open TODO, not resolved here since I don't have a confirmed completion date. Marked with a comment in `index.njk` where it should go.

## Before this goes live — one manual step
Per the ADR: **Repo Settings → Pages → Source must be switched to "GitHub Actions."** It's currently deploying from the branch root (the old static-HTML setup) — the new workflow won't take effect until this is switched.

## To run locally
```
npm install
npm run build     # one-off build to _site/
npm run serve     # local dev server with live reload
```

## To publish a real writeup
See the comments in `src/writeups/example-writeup.md` — copy content from a vault note, add front matter, remove `draft: true`, push. The Actions workflow handles the rest.
