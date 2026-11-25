import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Write root-absolute URLs in templates ("/gallery/", "/assets/img/x.jpg"). This plugin prefixes them with
  // the site's path prefix at build time, so the same source works on GitHub Pages (/vow-new-website/) and
  // on a custom domain (/). Set the prefix with the PATH_PREFIX environment variable.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Files copied as-is into the built site
  eleventyConfig.addPassthroughCopy({
    "src/assets": "assets",
    "src/css": "css",
    "src/js": "js",
    "src/robots.txt": "robots.txt",
  });
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  // {{ "2026-03-14" | dateLong }} -> "March 14, 2026"
  eleventyConfig.addFilter("dateLong", (value) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value))
  );

  // {{ items | json }} for inline structured data
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  // Section headings of a page (<h2 id="...">), for the "On this page" list on the legal pages
  eleventyConfig.addFilter("headings", (html) =>
    [...String(html).matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/gs)].map(([, id, text]) => ({ id, text }))
  );

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
