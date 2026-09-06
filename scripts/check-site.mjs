import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
const root = resolve("_site");
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
const pages = new Map(
  walk(root)
    .filter((path) => path.endsWith(".html"))
    .map((path) => [path, readFileSync(path, "utf8")]),
);
const ids = new Map();
for (const [path, html] of pages) {
  const all = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(all).size, all.length, `Duplicate IDs: ${path}`);
  ids.set(path, new Set(all));
  assert.equal(
    (html.match(/<h1\b/g) || []).length,
    1,
    `One main heading required: ${path}`,
  );
  assert.match(html, /name="viewport"/, `Missing viewport: ${path}`);
}
for (const [path, html] of pages) {
  for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = new URL(
      value.replaceAll("&amp;", "&"),
      `https://local.test/${path.slice(root.length + 1)}`,
    );
    if (url.origin !== "https://local.test") continue;
    let target = join(root, decodeURIComponent(url.pathname));
    assert.ok(existsSync(target), `Missing target: ${value} in ${path}`);
    if (statSync(target).isDirectory()) target = join(target, "index.html");
    assert.ok(existsSync(target), `Missing page: ${value} in ${path}`);
    if (url.hash && ids.has(target))
      assert.ok(
        ids.get(target).has(decodeURIComponent(url.hash.slice(1))),
        `Missing anchor: ${value} in ${path}`,
      );
  }
}
const home = pages.get(join(root, "index.html"));
for (const anchor of [
  "hero",
  "labs",
  "about",
  "education",
  "experience",
  "skills",
  "publications",
  "writeups",
  "certs",
  "achievements",
  "contact",
])
  assert.ok(
    ids.get(join(root, "index.html")).has(anchor),
    `Preserve existing anchor ${anchor}`,
  );
assert.match(
  home,
  /August 1, 2026/,
  "Article calendar date must stay stable across time zones",
);
assert.ok(
  !existsSync(join(root, "writeups/example-writeup/index.html")),
  "Draft must not be published",
);
console.log(
  `Passed: ${pages.size} HTML pages, local assets, internal links, anchors, heading structure, date, and draft exclusion.`,
);
