# NOIRÉ Atelier

A fictional luxury automotive detailing experience built as a local, self-contained concept site.

## Concept

NOIRÉ Atelier is positioned as a private automotive spa and concierge service rather than a conventional car wash. The visual language uses bright editorial photography, warm bronze accents, editorial serif typography, cinematic motion, and a conversion path centered on a private appointment.

## Files

- `index.html` — full responsive site
- `styles.css` — design system and motion layer
- `main.js` — interaction engine (Lenis, scroll scenes, reveals, components)
- `lenis.min.js` — Lenis 1.1.14 smooth scroll, vendored locally (no CDN)
- `media/campaign/` — 20 distinct art-directed campaign images
- `media/detail.jpg` — bundled muted transformation/before image
- `media/finish.jpg` — bundled legacy finish image retained for compatibility

## Run

Open `index.html` directly in Edge or another modern browser. No build step is required. A local server also works:

```
python -m http.server 8100
```

## Included interactions

- Four-panel intro curtain with skip
- Lenis smooth scrolling with expo easing
- Pinned hero with scrubbed scale and copy drift
- Split-text headlines (word-level reveal)
- Scrolly journey: five scenes crossfade beside a sticky stage, with progress bar, captions, and active step highlighting
- Parallax depth on service, film rail, and gallery imagery
- Velocity-driven motion: ticker direction flip and subtle film-panel skew
- Reflection sweep on service tab changes
- Before/after comparison slider
- Cinematic horizontal film rail and gallery hover movement
- Desktop-only magnetic buttons
- Mobile menu with clip-path reveal and scroll lock
- Package-to-booking selection flow
- Local-only booking confirmation state
- Active section indicator in the nav
- Reduced-motion support with all motion disabled
- Full no-JS fallback (content fully visible, pin gated on the `js` class)

The booking form is intentionally local-only for this fictional concept and does not submit data anywhere.

Image credits: campaign photography from Unsplash and Pexels. Source asset IDs used for the campaign set are documented below; verify individual photographer attribution and current usage terms before public launch.

Unsplash source IDs:

- `hero-arrival.jpg` — Pexels 30889579 (three supercars, high-key)
- `journey-arrival.jpg` — `1765863201361-40143e0b37e4` (coastal convertible, Trac Vu)
- `journey-craft.jpg` — `1632823470270-a7d3d03c3e20` (polisher at work, Deniz Demirci)
- `journey-correction.jpg` — `1680804902684-e69d56492869` (precision polisher)
- `journey-protection.jpg` — `1632605166776-7128669886e7` (film application)
- `journey-reveal.jpg` — `1542754787-e9bdeafa5491` (yellow Huracán, Viktor Theo)
- `service-wash.jpg` — `1584381443170-bfbc4463966a` (water beading)
- `service-interior.jpg` — `1562444089-1232c28ade8b` (cabin detail, Erik Mclean)
- `service-correction.jpg` — `1761934658331-2e00b20dc6c6` (microfiber on paint)
- `service-veil.jpg` — Pexels 35715223 (white sports car front)
- `service-concierge.jpg` — `1605437241278-c1806d14a4d9` (premium cabin)
- `film-arrival.jpg` — Pexels 5120117 (sports car on country road)
- `film-craft.jpg` — Pexels 35756044 (sports car under bridge)
- `film-correction.jpg` — `1696325934345-ec1ca519e67d` (Maserati MC20, Václav Pechar)
- `film-protection.jpg` — `1767023208544-3c94d1d09bd7` (classic 911 Targa, Zhen Yao)
- `film-reveal.jpg` — `1494976388531-d1058494cdd8` (performance car front)
- `gallery-01.jpg` — `1743368001354-01bbd5c1b5a4` (white 911 in sun, Nicholas Fuentes)
- `gallery-02.jpg` — `1753706052868-9cd59c53d9ef` (yellow Aventador, Rose Gills)
- `gallery-03.jpg` — `1549652873-c4a915dffb6d` (city light trails, Andrew Valdivia)
- `gallery-04.jpg` — `1779173851359-4ad95121b1b1` (Riviera convertibles)
