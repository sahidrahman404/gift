# The Road to September Sprite Pack

Consolidated sprite pack for `FORWARD.` / `The Road to September`.

This folder is the canonical location for character, cat, scooter, and memory-prop sprites used by the current game. Runtime JSON should reference assets from this folder, not the old `forward_base_pack` path.

## Visual Anchor

- `contact-sheet.png` is a human/agent reference image, not a runtime sprite.
- Use it before future visual generation to preserve the approved Rahman, Fia, cat, scooter, and cinema-chair style.
- The spec points to this file as the project's visual anchor.

## Runtime Assets

| Asset | Production sheet |
|---|---|
| Rahman front idle | `rahman_front_idle/sheet-transparent.png` |
| Rahman side idle | `rahman_side_idle/sheet-transparent.png` |
| Rahman side walk | `rahman_side_walk/sheet-transparent.png` |
| Rahman horror sit scared | `rahman_horror_sit_scared/sheet-transparent.png` |
| Fia front idle | `fia_front_idle/sheet-transparent.png` |
| Fia side idle | `fia_side_idle/sheet-transparent.png` |
| Fia side walk | `fia_side_walk/sheet-transparent.png` |
| Fia horror sit calm | `fia_horror_sit_calm/sheet-transparent.png` |
| Honda BeAT memory scooter | `honda_beat_memory_scooter/sheet-transparent.png` |
| Two-up scooter | `two_up_scooter/sheet-transparent.png` |
| Alone scooter | `alone_scooter/sheet-transparent.png` |
| Alone scooter run | `alone_scooter_run/sheet-transparent.png` |
| Shared cinema chair | `shared_cinema_chair/sheet-transparent.png` |
| Bubu idle | `bubu_idle/sheet-transparent.png` |
| Cemplung idle | `cemplung_idle/sheet-transparent.png` |
| Mumu idle | `mumu_idle/sheet-transparent.png` |
| Sisil idle | `sisil_idle/sheet-transparent.png` |

## Bundle Layout

Each processed sprite folder generally contains:

- `raw/raw-sheet.png` - archived generated source image
- `raw-sheet.png` - processor input copy
- `raw-sheet-clean.png` - chroma-cleaned intermediate
- `sheet-transparent.png` - production sprite sheet
- frame PNGs such as `<asset>-1.png`
- `animation.gif` - quick preview
- `pipeline-meta.json` - processor metadata
- `prompt-used.txt` - generation prompt audit

## Notes

- Keep transparent runtime references pointed at `sheet-transparent.png`.
- Keep generated source art in each asset's `raw/` folder.
- Future generated sprite assets should be added as one folder per asset under this pack.
