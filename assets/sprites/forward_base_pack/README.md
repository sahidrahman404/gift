# FORWARD. Base Character Sprite Pack

First milestone only: canonical base sprites for visual approval. No walk, sit, motorcycle, horror, or cat gag animations are included yet.

## Shared Technical Spec

- Format: PNG with transparent background after `generate2dsprite` postprocess
- Raw generation background: solid `#FF00FF`
- Canvas / frame size: `64 x 64 px`
- Sprite-sheet layout: `1 row x 1 column`
- Frames per asset: `1`
- Pixel style: crisp cozy retro pixel art, hard edges
- Recommended game scale: draw at `1x` for native pixel scale, or integer scale only (`2x`, `3x`) to keep edges crisp
- Processing: `.venv/bin/python .agents/skills/generate2dsprite/scripts/generate2dsprite.py process`
- Anchor: feet / bottom aligned
- Scale strategy: preserve

## Assets

| Asset | Production sheet | Single frame | Approx subject footprint |
|---|---|---|---|
| Rahman front idle | `rahman_front_idle/sheet-transparent.png` | `rahman_front_idle/rahman_front_idle-1.png` | `31 x 50 px` |
| Rahman side idle | `rahman_side_idle/sheet-transparent.png` | `rahman_side_idle/rahman_side_idle-1.png` | `29 x 51 px` |
| Fia front idle | `fia_front_idle/sheet-transparent.png` | `fia_front_idle/fia_front_idle-1.png` | `30 x 47 px` |
| Fia side idle | `fia_side_idle/sheet-transparent.png` | `fia_side_idle/fia_side_idle-1.png` | `19 x 47 px` |
| Bubu idle | `bubu_idle/sheet-transparent.png` | `bubu_idle/bubu_idle-1.png` | `46 x 29 px` |
| Cemplung idle | `cemplung_idle/sheet-transparent.png` | `cemplung_idle/cemplung_idle-1.png` | `53 x 38 px` |
| Mumu idle | `mumu_idle/sheet-transparent.png` | `mumu_idle/mumu_idle-1.png` | `33 x 36 px` |
| Sisil idle | `sisil_idle/sheet-transparent.png` | `sisil_idle/sisil_idle-1.png` | `44 x 45 px` |

## Notes For Future Animation Work

- Treat these designs as the canonical approval candidates.
- Future actions for the same character should use the matching processed sprite as `reference: generated_image`.
- Keep all future body/action sheets on the same `64 x 64 px` frame and preserve feet alignment.
- Do not redesign face, hair, hijab, jacket colors, cat markings, or cat body scale after approval.
