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
| Press items | `src/_data/press.json` (`date`, `outlet`, `title`, `url`, `image`; thumbnails in `src/assets/img/press/`; newest first) |
| Team bios | `src/_data/team.json` (page: `src/team.njk`, currently unpublished) |
| An ecosystem diagram | `src/_data/ecosystem.json` (key `home`, or a sector slug to end that sector page with it) |
| The testimonial | `src/_data/testimonial.json` (used on the home and Clients pages) |
| Colours, fonts, spacing | `src/css/tokens.css` |

## Contact page
`src/contact.njk` (styles `contact.css`, scripts `contact.js` and `motion-contact.js`). Addresses, app links, social links and the
form settings are in `src/_data/contact.json`. The demo form posts to the existing HubSpot form (portal and form ID in that file),
so its field names and options must stay in step with HubSpot. Every "Connect", "Contact" and demo link points here.

The Custom Sales Deck form on the same page posts to `hubspot.deckFormId` (empty for now: it offers email instead). That HubSpot
form needs the properties `firstname`, `lastname`, `email`, `company`, `company_domain`, `deck_requesting`, `deck_sector`,
`deck_primary_use_case` and `deck_annual_events`, with these names.

## Motion control
`src/js/ambient.js` powers "Pause motion" (hero and footer). A new animation that loops on its own should read `window.vowAmbient`.

## Cookies and lead tracking
`src/js/consent.js` and `src/_includes/consent.njk`: HubSpot's tracking code (portal ID from `src/_data/contact.json`) loads only after a visitor
accepts. If you add another tool that sets cookies, load it from the same place and describe it in the Privacy Policy.

## Legal pages
`src/privacy-policy.html` and `src/terms-of-service-vow.html` hold the wording copied from the vow.app pages (same addresses, so existing links keep working).
Since then the Privacy Policy has gained a "Cookies and Website Tracking" section (drafted for this site; it needs legal review).
Edit the text there and update `updated` in the front matter. Each `<h2 id="...">` appears in the "On this page" list.

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

- Press items come from the current vow.app press page. Confirm usage rights for the thumbnails.
- Sector, FAQ and other page copy is draft text written from the existing site content.
- Gallery photos are real event photos supplied by the client (an infinite draggable canvas, `src/js/gallery.js`). Captions come only from visible signage; sector tags are editable in `gallery.json`. Confirm usage rights before the repo or site goes public beyond review.
- The Team USA demo link.

## Link previews and icons
- Share image: `src/assets/img/og-image.jpg` (1200×630). Icons: `src/assets/favicon-48.png`, `icon-192.png`, `apple-touch-icon.png`. All are wired in `layouts/base.njk`.
- `url` in `src/_data/site.json` builds the absolute share-image and page URLs. Change it when the site moves to its real domain.

## Case studies
One template for every case study: `src/case-studies/case-study.njk`, styled by `src/css/case.css` and animated by `src/js/motion-case.js`.
To add a case, add an entry to `src/_data/caseStudies.json` (see `team-usa` for every field). A page appears at `/case-studies/<slug>/`.
Media blocks are `full` (one photo), `device` (product screen over a tinted photo) and `pair` (two photos).
The photos zoom and travel with the scroll, so their edges are cropped; set `"focus": "76% 50%"` on a `pair` photo to keep its subject in view. Replace the draft copy and the illustrative figures with real ones before launch.
