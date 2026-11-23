# ishaan-jain-ai.github.io

Source of [ishaan-jain-ai.github.io](https://ishaan-jain-ai.github.io): plain HTML and CSS, no build step.

- `index.html`: home page
- `llm-judge-ties/`: the write-up of [wrong-winner](https://github.com/ishaan-jain-ai/wrong-winner); its charts come from that repo's `results/phase2/figures`
- `assets/card.png`: the link-preview image, rendered from `assets/card-source.html` at 1200×630 with headless Chrome:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot=assets/card.png assets/card-source.html
```
