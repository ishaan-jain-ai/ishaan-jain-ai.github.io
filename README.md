# ishaan-jain-ai.github.io

Source of [ishaan-jain-ai.github.io](https://ishaan-jain-ai.github.io): plain HTML and CSS, no build step.

- `index.html`: home page (intro, things I've built, the in-browser checker, writing with the clickable finding, elsewhere, contact)
- `work/<slug>/`: case studies (aviation maintenance copilot, clinical appeal letter copilot, enterprise Copilot agents)
- `about/`: short bio, career, tools, community
- `now/`: what I'm working on now (update the date when you edit it)
- `llm-judge-ties/`: the write-up of [wrong-winner](https://github.com/ishaan-jain-ai/wrong-winner); its charts come from that repo's `results/phase2/figures`
- `assets/style.css`: one stylesheet for every page; a light-only "blueprint" theme (blue-grey grid paper, navy text, cobalt accent, notebook-style [n] section labels, a mono results readout on the home page), IBM Plex Sans and Plex Mono from Google Fonts
- `assets/check.js`: the judge-only rule from wrong-winner's `checker.py`, ported to the browser (matched the Python CLI on 54 test cases)
- `assets/more-items.js`: the clickable finding on the home page; numbers from wrong-winner's `results/phase2/analysis/summary.csv`
- `404.html`, `sitemap.xml`, `robots.txt`

Link-preview images are rendered at 1200×630 with headless Chrome: `assets/card.png` (the write-up) from `assets/card-source.html`, and `assets/card-home.png` (every other page) from `assets/card-home-source.html`:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=5000 --screenshot=assets/card-home.png assets/card-home-source.html
```

Preview locally:

```bash
python3 -m http.server 8737
```
