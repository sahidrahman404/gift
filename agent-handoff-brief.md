# Handoff Brief — "The Road to September"
### For the AGF coding agent. Read fully before changing anything.

This is a finished-writing, partially-built 2D game — a personal gift. The engine
works; the story is written. Your job is to bring the working engine up to the full
story and add a feel pass. Do NOT rebuild from scratch — extend what exists.

---

## What the game is

A gentle, forward-moving narrative game. Rahman and Fia (a real couple) ride two-up
on a black Honda BeAT scooter through the memories of their two years together, from
their first Bumble match to a quiet ending that hints at a proposal. No combat, no
pickups, no fail state. The player rides, stops at memory zones, reads dialogue,
rides on. It's a love letter in game form. Tone: warm, sincere, a little funny.

Art style: cozy Stardew-Valley-like pixel art. Keep it consistent.

---

## Current working state (already built — keep it)

The engine is vanilla JS + Canvas with this module split (do not reorganize):
- `game.js` — boot + frame loop
- `scene.js` — level loader, trigger/exit/dialogue update, draw dispatch
- `player.js` — player movement + sprite selection
- `render.js` — camera, background, sprite, dialogue box, props
- `input.js` — keyboard/mouse intents
- `assets.js` — loadJSON / loadImage helpers

Data (in `data/`):
- `levels.json` — manifest of levels
- `level*.json` — per-level: background, player, npcs, memoryTriggers, sceneExits
- `dialogue.json` — all memories, keyed by dialogueId → { title, lines[] }
- `characters.json`, `cats.json`, `props.json` — asset catalogs

How it works today: levels chain via `sceneExits` (walk into a right-side zone → load
next level). `memoryTriggers` are rectangles; when the player point enters one, its
dialogue fires. Space/Enter advances lines; `once:true` triggers don't refire.

**The three existing levels (level1, level_tuku, level_cats) are a PROOF OF CONCEPT,
not the real story.** Treat them as reference for patterns, then replace/extend to
match the full story below.

---

## Locked design decisions (do not re-litigate)

1. **The game MIXES riding and walking. The rule: RIDE to travel between places,
   WALK on arrival within a place.** Riding = transition/motion; walking = arrival.
   Neither "always two-up" nor "always walking" — it alternates by scene per the map
   in the story section below.
   - Riding sprites: `two_up_scooter` (idle) and `two_up_scooter_run` (moving) — both
     riders on the BeAT. Used for all transitions and montage beats.
   - Alone-riding sprites: `alone_scooter` (idle) and `alone_scooter_run` (moving) —
     Rahman by himself. Used ONLY in the Bumble opening (he rides alone toward her).
   - On-foot sprites: Rahman `rahman_side_idle`/`rahman_side_walk`,
     Fia `fia_side_idle`/`fia_side_walk`. Used when dismounted at a place — the two
     of them walk/stand together on foot for that beat's dialogue.
   - Recommended wiring: promote the two-up scooter to a first-class `characters.json`
     entry (e.g. id `two_up`, `idle_side`=idle sheet, `walk_side`=run sheet) and an
     `alone` entry the same way, then set each beat's player sprite mode to one of:
     `ride_two_up`, `ride_alone`, or `on_foot` (Rahman walks, Fia is a walking
     companion NPC). Drive it from level/zone data, not hardcoded, so it's editable.
   - The transition that matters most: in the UNIQLO beat, Rahman arrives, then Fia
     APPEARS on foot (`fia_side_idle`), they're on foot together in the store, then
     they MOUNT and ride off two-up. From then on, "riding" always means two-up.

2. **The cinema beat is the one dismount.** There, don't show the scooter — seat the
   two of them in the `shared_cinema_chair` prop, with `rahman_horror_sit_scared`
   (jacket up, hiding) and `fia_horror_sit_calm` (calm) side by side facing the
   screen. This is the emotional/comedic centerpiece. After the beat, back to two-up.

3. **Dialogue is already finalized** in the provided `dialogue.json`. Use those lines
   verbatim — do not paraphrase, shorten, or "improve" them. They're written in second
   person ("you") on purpose. This is the gift; the words matter most.

4. **Per-zone backgrounds preferred over one-background-per-level.** Currently a level
   has a single `background`. The story rides continuously through many places. Add
   support for a background that changes as the player crosses into a zone (ideally a
   short cross-fade), so the ride feels continuous rather than chopped into one-image
   levels. If that's too invasive, fall back to splitting by background — but attempt
   the per-zone approach first.

5. **No deadline. Optimize for quality, not speed.** Do it properly.

---

## The full story order (beats → dialogueId)

Build the whole game to play these beats in THIS order. dialogueIds match the keys in
the provided `dialogue.json`.

Each beat is tagged with its MOVEMENT MODE: [ride_alone], [ride_two_up], [on_foot],
or [special]. Follow these — they encode the ride-between / walk-on-arrival rule.

1. The Beginning — `memory_bumble_beginning` — bg `road_night` — **[ride_alone]**
   (Rahman rides alone toward her)
2. Uniqlo — `memory_uniqlo_first_meeting` — bg `uniqlo` — **[special]**
   (arrive, Fia appears on foot, on-foot together in store, then mount + ride off
   two-up; two-up is the riding default from here on)
3. Marugame Udon — `memory_marugame_first_meal` — bg `marugame` — **[on_foot]**
   (a place — dismount, walk/stand together)
4. Lembayung / cinema gag — `memory_cinema_lembayung` — bg `cinema` — **[special]**
   (dismount to the `shared_cinema_chair`; `rahman_horror_sit_scared` +
   `fia_horror_sit_calm` side by side)
5. Horror nights (titles scroll past) — `memory_horror_nights` — bg `cinema_hall` — **[ride_two_up]**
   (montage of many nights — motion)
6. Macaroni schotel — `memory_macaroni_schotel` — bg `her_kitchen` — **[on_foot]**
7. Food explorer (place names scroll past) — `memory_food_explorer` — bg `street_food` — **[ride_two_up]**
   (montage of many places — motion)
8. Berselesa (slow, wistful) — `memory_berselesa` — bg `berselesa` — **[on_foot]**
   (a tender place — walk slow)
9. Kintaro / accidental sushi — `memory_sushi_kintaro` — bg `kintaro` — **[on_foot]**
10. Tuku sugar gag — `memory_tuku_after_work` — bg `tuku` — **[on_foot]**
11. Cats: Cemplung → Mumu → Sisil → Bubu (trust order) — `memory_cat_cemplung`,
    `memory_cat_mumu`, `memory_cat_sisil`, `memory_cat_bubu` — bg `her_home` — **[on_foot]**
    (Rahman on foot; cats now have WALK sprites — scatter/walk away on early lines,
    gather close and idle by the final lines. See feel pass #3.)
12. September (ending) — `memory_september` — bg `open_road` — **[ride_two_up]**
    (riding, slowing to a stop, road opening ahead)

REMOVED: the former "Honda Beat rides" beat (`memory_honda_beat_rides`) is cut — it
overlapped the food/ride beats. Do not include it. (You may delete its key from
`dialogue.json` or just leave it unreferenced; nothing should trigger it.)

Transitions BETWEEN these beats (riding from one place to the next) are always
[ride_two_up] after Uniqlo. The [on_foot] tag applies WITHIN the beat's place.

Backgrounds available in assets: berselesa, cinema, cinema_hall, her_home, her_kitchen,
kintaro, marugame, open_road, road_night, street_food, tuku, uniqlo. (Ignore
`composite_check.png` and `style_test.png` — generation test images, not scenes.)

Suggested level grouping (each level = continuous ride, multiple zones, backgrounds
change per zone): [First date: 1-3] [Horror: 4-5] [Cooking & food: 6-9]
[Tuku: 10] [Home & ending: 11-12]. Use your judgment; keep story order intact.
Remember the movement tags: within these levels the player is [on_foot] at the
sit-down places and [ride_two_up] on the montage/transition stretches.

---

## Feel pass (do after the beats all play in order)

Priority order:
1. **Typewriter reveal** for dialogue lines (currently they pop in whole). First
   advance press completes the reveal instantly; second advances. Slightly slower
   reveal speed for the Berselesa and September beats.
2. **Music per act** — one track per level/act, swapped on scene load: tender for the
   ride, playful for the horror gag, a swell for September. (Ask the user for audio
   files, or use royalty-free placeholders and mark them for replacement.)
3. **Cats react** — in the cats beat, cats WALK AWAY on the early lines (wary), then
   gather close and idle near the scooter by the final lines (accepted). Mirror the
   trust arc in motion.
4. **September staging** — the ride slows to a stop, the road opens to the horizon,
   then after the last line fade to the single word "September", then hold. This is
   the beat everything builds to; make it a real moment, not just a text line.
5. **Title screen + soft close** — a quiet opening card (e.g. "for [her name]") and an
   ending that doesn't hard-stop. Ask the user for her name for the title card.

---

## Rules of engagement

- Keep the existing module boundaries and data-driven approach.
- Dialogue text is final — never edit the words in `dialogue.json`.
- Keep art/sprite scale consistent; the horror-chairs and cats scenes will need
  positioning by eye — expose them so the user can nudge in the scene editor.
- After each beat/level, make it runnable so the user can press Play and check.
- Ask the user before inventing new assets (backgrounds, music, a title card image).
- Preserve the two-up-except-cinema rule everywhere.
```
