# Junchuan Zhao — Personal Homepage

Static personal academic homepage published with GitHub Pages.

## Structure

- `index.html` — homepage content, interactions, and generated publication list
- `assets/publications.json` — editable publication metadata
- `assets/publications.css` — publication list and button refinements
- `assets/signal.css` / `assets/signal.js` — interactive hero light ribbons and focus controls
- `assets/theme.css` — shared typography, surfaces, responsive layout, and day/night palettes
- `scripts/render_publications.py` — standard-library Python publication renderer
- `assets/img/` — retained research images and site icons
- `assets/files/` — CV
- `assets/junchuan_2.jpg` — portrait and social preview image
- `danny-musician/` — retained standalone music site

## Local preview

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

The site uses `.nojekyll` and does not require a build step.

## Visual design

The default deep teal palette pairs ivory text with champagne and sage accents.
The navigation also offers midnight and forest variants. The selected palette is
saved locally; the legacy `dunhuang`, `azurite`, and `olive` data values map to these
three options. Shared visual refinements live in `assets/theme.css`, loaded after
the original layout and component styles. Research cards link directly to the
matching publication filter. These cards use numbered, text-led layouts without
decorative illustrations.

The sun/moon button in the navigation switches between day and night. Day mode
uses warm white surfaces, ink-green controls, and restrained bronze details; the signal
artwork stays dark in both modes. Appearance is saved independently of the color
palette and applied before styles load. New visitors start in night mode.

## Interactive signal panel

The canvas is procedural and requires no libraries or audio permissions. Select
Voice, Music, or Motion to morph the artwork. Moving over the field bends the
ribbons; clicking (or pressing Enter/Space with the canvas focused) sends a ripple.
The pause control freezes the artwork. Reduced-motion preferences start it paused,
and rendering stops while the panel is offscreen or the browser tab is hidden.
The complete artwork and all three focus controls remain available on mobile,
with larger touch controls and a tap-specific hint. Manrope body text and Plus
Jakarta Sans headings are retained, with larger mobile reading sizes.

## Updating publications

Edit `assets/publications.json`, then regenerate the publication section:

```bash
python3 scripts/render_publications.py
```

Commit both the JSON and the updated `index.html`. The renderer changes only the
content between `<!-- PUBLICATIONS:START -->` and `<!-- PUBLICATIONS:END -->`.
The complete publication list, links, overviews, and available BibTeX citations
are rendered into the HTML. No runtime data fetch is needed.

Keep the list in the desired order within each year; years render newest first.
Each entry has a stable `id`, `title`, `authors`, `conference`, `venue`, `year`,
`category`, and `links`. Categories can be a string or a list using `speech`,
`music`, `human`, and `affective`. Authors may use `<b>` for emphasis; preserve
contribution markers such as `*` and `†`. Link keys are `pdf` (Paper), `page`
(Demo), `code`, and `data`; include only links that exist.

Optional fields are `summary` (a collapsible overview), `bibtex` (an actual
citation), and `new` (a New badge). Use JSON `\n` escapes for line breaks in
BibTeX, not literal `\\n` text. Remove `new` when a paper no longer needs a badge.

To inspect the generated fragment without updating the homepage:

```bash
python3 scripts/render_publications.py --output /tmp/danny-publications.html
```
