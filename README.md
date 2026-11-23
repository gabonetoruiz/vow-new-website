# VOW website

Static site built with [Eleventy](https://www.11ty.dev/) (HTML, CSS and vanilla JavaScript, no framework) and published with GitHub Pages.

Review link: https://gabonetoruiz.github.io/vow-new-website/

## Working on it

```bash
npm install          # once
npm run build        # builds the site into _site/
npm start            # dev server with live reload at http://localhost:4173
```

Pushing to `main` builds and deploys the site (`.github/workflows/pages.yml`). Nothing is deployed from any other branch.

## Structure

```
eleventy.config.js        build config (path prefix, passthrough files, filters)
src/
  index.njk               home page
  gallery.njk press.njk faq.njk clients.njk 404.njk
  sectors/sector.njk      one template, generates /sectors/<slug>/ for every sector in _data/sectors.json
  _data/                  content as data: nav, sectors, gallery, faqs, clients, press, testimonial, site
  _includes/
    layouts/base.njk      page shell: head, header, <main>, footer, scripts
    header.njk footer.njk cta.njk page-hero.njk testimonial.njk sprite.njk
  css/                    tokens, base, components, nav, home, inner, gallery
  js/                     nav, cards, gallery, faq, hero-gradient, sectors, reel, motion-*
  assets/                 images and client logos
  robots.txt
```

## Where to change things

| To change | Edit |
| --- | --- |
| Navbar links, Connect button label | `src/_data/nav.json` |
| A sector's text, image or the Sectors dropdown | `src/_data/sectors.json` (add a sector there and its page, menu entry and footer link appear) |
| Gallery photos and captions | `src/_data/gallery.json` (images go in `src/assets/img/gallery/`; each entry has `title`, `meta`, `desc`, `alt` and an optional `sector` tag) |
| FAQs | `src/_data/faqs.json` (the page and its search-engine markup both come from it) |
| Client logos | `src/_data/clients.json` (the home page marquee is still written by hand in `index.njk`) |
| Press items | `src/_data/press.json` (remove `"sample": true` on real entries) |
| The testimonial | `src/_data/testimonial.json` (used on the home and Clients pages) |
| Colours, fonts, spacing | `src/css/tokens.css` |

## Rules for new pages

- Each page sets its own front matter: `layout`, `title`, `description`, and the CSS and JS it needs
  (`styles`, `scripts`, and `motion` for GSAP modules). See `src/gallery.njk` for an example.
- **Write root-absolute URLs** (`/gallery/`, `/assets/img/x.jpg`, `/css/...`). The build adds the site's path prefix
  (`/vow-new-website/` on GitHub Pages, nothing on a custom domain), so never hardcode it and never use `../`.
- Any element you want revealed on scroll just needs the `data-reveal` attribute.
- Cards that should get the cursor spotlight and hover lift need the `glow` class.
- Pages that use GSAP motion get the inline `js` flag script from the layout; do not remove it.

## Review phase

Every page carries `<meta name="robots" content="noindex, nofollow">` (in `layouts/base.njk`) and the site ships a
`robots.txt` that disallows everything (`src/robots.txt`). Remove both at launch.

## Content still to replace

- Press items are placeholders (marked "Placeholder" on the page).
- Sector, FAQ and other page copy is draft text written from the existing site content.
- Gallery photos are real event photos supplied by the client (an infinite draggable canvas, `src/js/gallery.js`). Captions come only from visible signage; sector tags are editable in `gallery.json`. Confirm usage rights before the repo or site goes public beyond review.
- Privacy and Terms links in the footer, and the Team USA demo link.
