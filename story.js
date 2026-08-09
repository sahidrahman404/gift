// ============================================================
//  A gift. Two years, one road, one black BeAT.
//  Story data for the walking game.
//
//  HOW THIS IS SHAPED
//  - The game is a list of SCENES, in the order you ride through them.
//  - Each scene fires when the rider passes `at` (forward distance).
//  - `bg` is an asset KEY (map it to an image in your own loader).
//  - `alone: true` means it's just you (only the opening scene).
//    Every scene after that is two-up on the BeAT.
//  - `montage` is an optional list of titles/places that drift past
//    while the scene's lines play (horror titles, food spots).
//  - `lines` play in order; advance each one with your input key.
//  - `speaker` is "Me" throughout — it's your inner voice. Change
//    freely, or drop the field if your box doesn't show a name.
//
//  DROP-IN NOTES
//  - The `at` values are placeholders spaced ~300 apart. Retune them
//    to your world's real scroll distance.
//  - If your existing code expects a flat list of lines instead of
//    scenes, see `flatten()` at the bottom — it converts this into
//    { at, speaker, text } rows automatically.
// ============================================================

const STORY = [
  {
    id: "match",
    at: 0,
    bg: "road_night",
    alone: true,
    lines: [
      "Bumble. Another match.",
      "Most chats fade after a day. Ours didn't.",
      "There was something about the way she talked — I kept smiling at my phone like an idiot.",
      "Days of this, and it wasn't enough anymore.",
      "I didn't want a screen between us. I wanted to actually meet her.",
      "So I asked.",
    ],
  },

  {
    id: "uniqlo",
    at: 300,
    bg: "uniqlo",
    // She appears here and never leaves. From this scene on, sprite is two-up.
    lines: [
      "Early September. A Sunday night.",
      "The weather was just right — not hot, no rain. The kind of night that makes you feel like something good is coming.",
      "Our first date. Uniqlo, of all places.",
      "I needed new pants. Not the most romantic start — I know.",
      "And then she walked in.",
      "Deep indigo denim jacket. A brown tee. Black pants.",
      "She looked effortless. Like she wasn't even trying, and that was the whole point.",
      "She looked at me, then at the racks, and just knew.",
      "Khaki chinos. She handed them to me like it was obvious.",
      "And she was right. Of course she was right.",
      "I stood there realizing something: she could see a version of me I'd never managed to see myself.",
      "Two years later, she still can.",
      "We rode off together. Her behind me on the black BeAT, arms around me.",
      "I didn't know it that night —",
      "— but I was never going to ride alone again.",
    ],
  },

  {
    id: "marugame",
    at: 600,
    bg: "marugame",
    lines: [
      "After Uniqlo, we were hungry. Marugame Udon.",
      "Two bowls of niku udon. Cups of ocha, steam rising between us.",
      "Nothing fancy. But somewhere between the first bite and the last, I stopped being nervous.",
      "The conversation didn't run out. It never ran out.",
      "I remember thinking — I could do this again. And again.",
    ],
  },

  {
    id: "cinema",
    at: 900,
    bg: "cinema",
    lines: [
      "Then — the cinema. Our first movie together. Lembayung.",
      "Horror. And I found out we both love it — the dread, the dark, the jump scares.",
      "One small difference, though.",
      "She sits there calm. Barely flinches. Watches the scariest parts dead in the eye.",
      'And me? Jacket up over my face, peeking through a gap, whispering "is it over? is it over?"',
      "She just laughs at me. Every time.",
      "Two horror lovers. One brave, one hiding behind a jacket.",
      "I wouldn't trade it.",
    ],
  },

  {
    id: "horror_nights",
    at: 1200,
    bg: "cinema_hall",
    // These drift past as posters while the lines play.
    montage: [
      "Pengepungan Bukit Duri",
      "Final Destination Bloodlines",
      "28 Years Later",
      "The Housemaid",
      "Weapons",
      "The Mummy",
      "Black Phone 2",
      "Hokum",
      "Obsession",
      "Backrooms",
    ],
    lines: [
      "After Lembayung, we couldn't stop.",
      "Every horror movie we could find — we found them together.",
      "And Weapons — that's the one that got me the worst.",
      "Jacket all the way up. I think I watched half of it through a gap in the sleeve.",
      "She barely blinked.",
      "Her, calm as ever. Me, hiding. Every single time.",
      "Side by side for all of them.",
    ],
  },

  {
    id: "schotel",
    at: 1500,
    bg: "her_kitchen",
    lines: [
      "One day, she cooked for me.",
      "Macaroni schotel. The first thing she ever made me.",
      "I still remember the first bite — that this came from her hands, for me.",
      "I'd always hoped for someone who could make a place feel like home.",
      "Turns out she was already doing it.",
    ],
  },

  {
    id: "food_run",
    at: 1800,
    bg: "street_food",
    montage: [
      "Nasi Uduk Kebon Kacang",
      "Belah Duren",
      "Taichan Siram",
      "Yakudo Ramen",
      "Kanaka",
      "Sushi Matsuki",
      "Obihiro",
      "Kwetiaw Asap Medan",
      "Nogura",
      "Andi Soto",
      "Sinar Minang Baru",
    ],
    lines: [
      "Turns out we both loved the same thing: chasing good food.",
      "Viral places, hidden gems, tiny hawker stalls — if it was good, we found it.",
      "Every weekend, somewhere new. Or somewhere old that we loved too much to leave alone.",
      "Me in front, her behind me, the whole city smelling like something delicious.",
    ],
  },

  {
    id: "berselesa",
    at: 2100,
    bg: "berselesa",
    // The ache. Let the BeAT slow here — the pacing is the point.
    lines: [
      "There was one place — Berselesa. A little coffee shop that happened to make food we loved.",
      "Nasi goreng and an americano. Every time, the same order.",
      "We always went at night. Always up on the second floor —",
      "— no smoke up there, the AC was good, and it was quiet. Just us.",
      "We went back again and again.",
      "It's closed now. Permanently. We can't go anymore.",
      "Some places don't get to stay.",
      "But we did. We got to stay.",
    ],
  },

  {
    id: "sushi",
    at: 2400,
    bg: "kintaro",
    lines: [
      "Funny story. One night we were too late for Obihiro — they were closing.",
      "So we ended up at a sushi place instead. Somewhere I'd never have chosen.",
      "Because I always said I didn't like sushi.",
      "Then I dared myself. A place nearby — Kintaro.",
      "Chuka idako. Sashimi. All of it.",
      "I found out I didn't hate sushi at all. I just hadn't tried it with her.",
      "She keeps doing that. Opening doors in me I didn't know were closed.",
    ],
  },

  {
    id: "tuku",
    at: 2700,
    bg: "tuku",
    lines: [
      "After work, we had a place. Tuku. Kopi susu tetangga, every time.",
      "First time I tried it, I couldn't drink it without sugar. Too much for me.",
      "She told me it's better without. No sugar. Trust her.",
      "She was right. Of course she was right — it is better without.",
      "But I felt like I was losing money buying it plain.",
      "So now? I get the sugar on the side. Every time.",
      "I never use it. It just sits there.",
      "She laughs at me. I don't care. It's my sugar I'm not using.",
    ],
  },

  {
    id: "cats",
    at: 3000,
    bg: "her_home",
    // Bubu, Mumu, Sisil, Cemplung gather NEAR the BeAT — not running.
    lines: [
      "She has four cats. Bubu. Mumu. Sisil. Cemplung.",
      "The first time I came over, they scattered. Bolted the second I walked in.",
      "I was a stranger in their house.",
      "But I kept coming back. And slowly, so did they.",
      "Now? They don't run.",
      "Now they come to me. They wait by the door.",
      "Four cats decided I belong here.",
      "And somewhere along the way, so did I.",
    ],
  },

  {
    id: "september",
    at: 3300,
    bg: "open_road",
    // The road opens to a horizon. Hold on the final word, then fade.
    ending: true,
    lines: [
      "Two years.",
      "Uniqlo to here. A stranger's cats to a home. Every meal, every movie, every ride on the BeAT.",
      "It started on a September night. The weather just right. Something good coming.",
      "And here we are — September again.",
      "There's a road ahead I can't see the end of.",
      "But I know who's on the back of my bike.",
      "Arms around me. Like always.",
      "I'm not done walking with you.",
      "Not even close.",
      "September.",
    ],
  },
];

// ------------------------------------------------------------
//  Optional: flatten scenes into a simple { at, speaker, text }
//  list, if your existing trigger code expects flat rows.
//  Within a scene, only the first line keeps the `at` trigger;
//  the rest are { text } and advance on input.
// ------------------------------------------------------------
function flatten(story = STORY) {
  const rows = [];
  for (const scene of story) {
    scene.lines.forEach((text, i) => {
      rows.push(
        i === 0
          ? { at: scene.at, bg: scene.bg, scene: scene.id, speaker: "Me", text }
          : { speaker: "Me", text },
      );
    });
  }
  return rows;
}

// Export for whichever setup you use.
if (typeof module !== "undefined") module.exports = { STORY, flatten };
