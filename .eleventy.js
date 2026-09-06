const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("assetVersion", (path) =>
    createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 10),
  );
  // Markdown dates represent calendar dates; keep local and CI builds identical.
  eleventyConfig.addFilter("readableDate", (date) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(date),
  );

  // Static assets pass straight through, unmodified — no build step needed for CSS/JS
  eleventyConfig.addPassthroughCopy("src/style.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Writeups: vault note -> front matter -> src/writeups/*.md -> published
  // Sorted newest first by the `date` front-matter field.
  eleventyConfig.addCollection("writeups", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/writeups/*.md")
      .filter((post) => !post.data.draft)
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    // .njk files render through Nunjucks; .md files also pass through Nunjucks
    // for front-matter/layout support, then get Markdown-compiled.
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
