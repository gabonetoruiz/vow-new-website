# VOW website

Static site (plain HTML, CSS and JavaScript, no build step), published with GitHub Pages.

Live review link: https://gabonetoruiz.github.io/vow-new-website/

## Structure

```
index.html            page content only (one HTML file per page)
css/
  tokens.css          design tokens: colours, fonts, spacing, easing
  base.css            reset, typography, buttons, navbar, footer, shared layout  (every page)
  home.css            styles that belong to the home page only
js/
  nav.js              navbar scroll state                                         (every page)
  cards.js            spotlight glow on cards
  hero-gradient.js    home hero WebGL gradient
  sectors.js          home sector image swap
  reel.js             home case-study arrows
  motion-core.js      registers GSAP + ScrollTrigger, shared matchMedia           (needed by all motion-*)
  motion-hero.js      home hero entrance and title reveal
  motion-reveal.js    scroll reveals (add `data-reveal` to any element to use it)
  motion-hover.js     hover and press micro-interactions
  motion-marquee.js   client logo marquee
assets/               images and client logos
.github/workflows/    deploys to GitHub Pages on every push to main
```

## Rules for new pages

- **Load order in the HTML:** `tokens.css`, `base.css`, then the page's own CSS. Scripts go at the end of `<body>`:
  GSAP and ScrollTrigger from the CDN, then `motion-core.js`, then the `motion-*.js` files the page needs.
- **Paths are relative** (`css/base.css`, `assets/img/x.jpg`), never root-absolute (`/css/...`), because the site is
  served from a sub-path on GitHub Pages.
- **Keep the inline `<script>`** in `<head>` that adds the `js` class: it prevents a flash of hidden content.
- **Any new file** the site needs must also be copied by the "Assemble site" step in `.github/workflows/pages.yml`.
- **Review phase:** every page carries `<meta name="robots" content="noindex, nofollow">`. Remove it (and `robots.txt` in
  the workflow) at launch.
