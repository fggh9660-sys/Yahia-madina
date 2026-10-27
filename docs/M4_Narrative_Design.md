# M4: Narrative Design Document & Roadmap

**Project:** Knowledge Runner (working title)
**Milestone:** M4, The Narrative Loop
**Status:** Draft for review (not locked yet)
**Author:** Victor, Script Smelter Studios
**Date:** 14 June 2026

---

## 0. A quick note before you dive in

I've kept two things visibly separate in here so we don't trip over scope later.

When you see **[M4 SCOPE]**, that's stuff I'm actually committing to build and ship this milestone. Treat it as the contract. When you see **[VISION / FUTURE]**, that's me thinking out loud about where these systems could go in later milestones. It's real design, but it's not part of M4, and I've flagged it so it doesn't quietly creep in.

Almost nothing here starts from scratch. It sits on top of what the game already has: the lore fragments, Noor's lines and the bond scaffold, the mini-challenges, the collection saving, the three-stage flow. Where something is genuinely new I'll say so; otherwise assume I'm extending what's already in the code.

Please be rough with this. Cross things out, scribble in the margins, tell me where I'm wrong. The whole reason we're doing M4 on paper first is so we can have that argument now, before I've written a single line of engine code.

---

## 1. The idea, in one breath

Right now we have a runner with collectibles in it. What I want M4 to do is turn those collectibles into a chain that actually means something.

The shape of it: you find a torn page, the page asks you something you can't answer yet, you go looking, the world eventually hands you the missing piece, and Noor ties it back to the story. The Lost Book gets one page closer to whole, and that page points you at the next question.

It's the difference between "I picked up twelve books" and "I'm three pages from finishing the book, and I still have no idea what that seventh page was on about." The second one is what keeps people running.

---

## 2. The core loop

This is the part everything else hangs off. If we only agree on one thing in this document, it should be this.

```
        ┌─────────────────────────────────────────────────────┐
        │                                                       │
        ▼                                                       │
  [1] LOST BOOK PAGE found in the run                           │
        │   "A torn page. Half a sentence. It asks something."  │
        ▼                                                       │
  [2] CURIOSITY FRAGMENT opens: the question/mystery           │
        │   "Why did the astronomers face the qibla to map      │
        │    the stars?"  ... you don't know yet                │
        ▼                                                       │
  [3] KNOWLEDGE FRAGMENT: the answer is out in the world        │
        │   found later in the run / next run, as a glowing     │
        │    lore pickup that resolves an open curiosity         │
        ▼                                                       │
  [4] NOOR CONNECTS: she links the answer back to the page      │
        │   "So that's what the page meant. You're reading       │
        │    the sky the way they did."                          │
        ▼                                                       │
  [5] LOST BOOK updates: page restored, progress visible        │
        └───────────────────────────────────────────────────────┘
            and the restored page hints at the NEXT curiosity
```

A few reasons I keep coming back to this shape.

It gives the pickups a reason to exist. A Knowledge Fragment stops being "+20 score" and becomes the answer to the thing page four was asking you. That alone changes how it feels to grab one.

It pulls the player forward. An open question is an itch, and people will start another run mostly to scratch it. We get retention out of curiosity instead of out of a daily-reward Skinner box.

And practically, once the engine understands the loop, you can author all the new pages, questions and answers in the data files yourself. No engine work to add content, which is the same content-ownership setup we've had since M2.

It also leans on things we already built rather than replacing them. The lore fragments become the Knowledge half. Noor's line system becomes the connector. The collection-saving layer becomes the Lost Book's ledger.

---

## 3. The systems, one at a time

### 3.1 Lost Book progression

The Lost Book is the player's long-term goal and, mechanically, it's the ledger the whole loop writes to. It's a set of pages, each one torn (a mystery) until the matching Knowledge Fragment puts it back together.

We've already planted the seed for this. There's a `lost-book-intro` fragment in the game now with that line about the pages holding secrets you only uncover by collecting them all, and there's a `collectionState` save layer (`kr.collection.v1`) tracking which IDs you've found and which milestones you've hit. What M4 does is take that flat list and give it structure: real pages, each with a state.

Here's the shape I'd add to the editable data files:

```ts
interface LostBookPage {
  id: string;                 // 'page-01-stars'
  stage: 1 | 2 | 3;           // where the page is found
  order: number;              // display order in the book
  tornLine: string;           // the half-sentence shown when found (the hook)
  curiosityId: string;        // the question this page opens
  knowledgeId: string;        // the lore fragment that restores it
  restoredTitle: string;      // page title once completed
  restoredBody: string;       // the full lore once restored
  noorConnectCue: string;     // which Noor line fires on restore
}
```

A page moves through four states over its life: undiscovered, then found-but-torn, then curiosity-open, then restored.

I want a simple Lost Book screen to go with this, reachable from the pause menu and the stage-results screen. Picture a grid of book spines: grey ones you haven't found, cracked-and-faintly-glowing ones that have an open question attached, gold ones you've restored. Tap a restored page and you read its lore; tap a torn one and it reminds you what you're still chasing. This screen is really where retention lives, because it's the place the player can see how close they are and what's still a blank.

For M4 I'd aim at around twelve pages, four per stage. That's enough to feel like a genuine book without being a slog to build, and you can keep adding to it afterwards.

**[FUTURE]** Down the line this could grow branching pages, "forbidden" pages that need two answers before they unlock, and a final assembled page that triggers the ending cinematic.

---

### 3.2 Curiosity Fragments

This is the question half of the loop, and it's the piece that makes the rest click. A Curiosity is just an open thread, something the player suddenly wants to know. I'd keep its voice wondering and a little playful, to set it apart from Knowledge, which is matter-of-fact.

We reserved room for this in the collection layer but never built it; it was always the thing we pushed to M4. So this one's genuinely new.

```ts
interface CuriosityFragment {
  id: string;                 // 'cur-why-qibla-stars'
  stage: 1 | 2 | 3;
  question: string;           // the wonder, in Noor's / the page's voice
  answeredByKnowledgeId: string;
  hint?: string;              // optional nudge toward where the answer lives
}
```

When a page is found, its Curiosity pops up as a short card that doesn't block the run. I'd reuse the existing fragment-lore modal styling but give it its own look, a question mark, lighter colour, a more curious tone. It then drops into an "Open Curiosities" list you can see in the Lost Book screen.

The bit I'm most keen on is the pull. While you're carrying an open question, the Knowledge Fragment that answers it glows a little brighter when it shows up, so the world feels like it's responding to what's on your mind. That's the small hit of satisfaction that ties the loop together.

**[FUTURE]** Later we could have curiosities that can only be answered in a different stage, ones on a timer, or even ones the player poses themselves.

---

### 3.3 Knowledge Fragments

This is the answer half, and honestly it's the system we're in the best shape on already, so I want to extend it rather than touch the foundations.

What's there today: 26 lore fragments spread across the stages, stage-filtered spawning roughly every 80m, the rare golden variants, the saving, the milestone rewards at 3 / 6 / 10 / 15, and Noor's `rare_fragment_discovery` reactions. All of it editable in `data/loreFragments.ts`.

The only change M4 needs is one optional field:

```ts
interface LoreFragment {
  // ...existing fields...
  answersCuriosityId?: string;   // NEW: links an answer back to a question
}
```

When you collect a fragment that answers a currently-open curiosity, it does more than show its lore: it kicks off the resolution beat from step four. Noor connects the dots, the page restores, the reward fires. Any fragment without an open curiosity behaves exactly as it does now. Because it's purely additive, the 26 existing fragments keep working untouched and the new linked ones light up the loop.

---

### 3.4 Noor's narrative chain

Noor is what stops all of this from feeling like a checklist. She's the one who actually narrates the connection, so when a page comes back together it lands as a story beat instead of a counter ticking up.

What we have: `data/noorLines.ts` with eight cues (stage entries, low HP, combo, rare discovery, the lost-book intro, colour discovery) and `data/noorBond.ts` with a five-tier bond scaffold, thresholds running 30 up to 400, cosmetic and passive keys, and placeholder dialogue. The bond HUD is hidden at the moment, waiting on your redesign, but the scaffolding underneath is all still there.

There are three things to do here.

First, the new connector lines, which are the loop's actual voice. I'd add cues for when a curiosity opens, when a knowledge fragment answers one, when a page restores, when the book is nearly done, and when it's complete. These are the lines that make the payoff feel earned, and they're yours to write in `noorLines.ts`.

Second, and this is the one I'd really like your read on: I think we should drop the abstract points-based bond meter and pin Noor's progression to the Lost Book instead. Restoring pages *is* the relationship deepening. Her first real beat opens at three pages, a bit of backstory at six, a turning point around nine, her closing moment at the final page. Right now we'd be asking the player to watch two progress bars that don't talk to each other, and collapsing them into one means a single number carries all the weight.

Third, the placeholder tiers. Tiers three, four and five in `noorBond.ts` still say "[Yahia to fill]". Those become the page-restore beats above, so filling them and designing the milestones is the same job.

**[FUTURE]** The cosmetics and passives we scaffolded (scarf colours, a slow-motion ability) stay future work, unless you want one small visible reward to surface in M4. I touch on that in 3.8.

---

### 3.5 Library progression and rewards

The Library in Stage 2, the Bayt al-Hikma, is the obvious home for the Lost Book. It's literally the place pages would be studied and restored, so M4 leans into that and treats it as the loop's anchor location.

We've already got the Library building, the magic carpet, the mini-challenge sequence and the Stage 2 results screen, with the matching challenges as the main encounter there.

Two extensions. The Library becomes the in-world spot where the Lost Book screen gets framed properly, Noor at a reading desk, your restored pages laid out. And the Library's rewards get tied to pages: solving a Library challenge can restore a page directly, the studious route, as an alternative to going and finding the field fragment. So there are two ways to close the same question, exploring or solving. The existing rewards stay as they are (15 to 35 stars for correct, a light slowdown for wrong); page-restore just layers on top for challenges that happen to sit on an open curiosity.

**[FUTURE]** Eventually this could become a Library you actually walk around between runs.

---

### 3.6 Discovery and mystery

This is the "I wonder what's over there" texture that sits around the loop rather than inside it.

The `MiniEncounterManager` already runs seven ambient little vignettes per stage, the wind streaks, fireflies, sand devils, lantern processions, firing every ten to eighteen seconds. Pure mood, nothing blocking, and they respect the rule about keeping the middle 60% of the screen clear.

For M4 I'd turn a small slice of those moments into actual hooks. Once in a while a distant glow resolves into a hidden page or a rare curiosity, a real "oh, what's that" rather than just decoration. And I'd give a handful of curiosities deliberately vague hints, so their answer isn't obvious and finding it feels like you solved something. The important word is small: most ambient encounters stay pure atmosphere, discovery is the occasional spice, and the centre-of-screen rule holds throughout.

**[FUTURE]** A secret set of pages that only appears under certain conditions, night runs or perfect combos, with lore that reveals itself conditionally.

---

### 3.7 Reward structure

My one rule here: every reward should feed either the run or the book, and M4's job is mostly to make the book rewards readable.

| Reward | Source | Feeds | Status |
|---|---|---|---|
| Stars | pickups, correct challenges, milestones | run score | exists |
| Hearts | pickups, milestones | run survival | exists |
| Shield | pickups | run survival | exists |
| Speed boost | pickups | run momentum | exists |
| Knowledge Fragment | field spawns | book (answers curiosities) | extend |
| Lost Book page restore | loop completion | book + Noor arc | NEW |
| Milestone bundles (3/6/10/15) | collection count | run + book | exists, re-tune to pages |

The beats themselves: opening a curiosity is light, a small chime and the question card, just enough to register the itch. Finding the answer to an open one is the big moment, the golden burst, Noor's connector line, the page knitting itself back together in the book, a star arc. And every few pages there's a book milestone, a Noor beat plus something tangible like an extra starting heart.

The balance I'd push for is generous, frequent run rewards (that's the fun floor that keeps moment-to-moment play good) and rarer, earned book rewards (that's the pull). The thing to avoid is making the book feel grindy. Twelve pages should come together over a handful of focused runs, not fifty.

---

### 3.8 Long-term retention

The honest, shippable version for M4 leans on a few things.

The biggest one is free once the loop exists: open curiosities are themselves the reason to come back. An unanswered question is a reason to run again, and we don't have to build anything extra to get it. On top of that I'd put a Lost Book completion percentage on the menu and results screen, the classic "you're at 8 of 12, go finish it" nudge. And I'd add one permanent unlock for finishing the book or hitting a milestone, something small but yours forever; my suggestion is either a Noor cosmetic like the gold scarf or a +1 starting heart, both of which the bond-tier scaffold in `noorBond.ts` already supports. One visible "your progress stuck to you" reward is plenty for this milestone. Underneath it all, the book and curiosity state needs to persist across sessions, which is just extending the localStorage we already use, so the book is always waiting where you left it.

**[VISION / FUTURE]** explicitly not M4, but worth having on record so we both know where this could go: a daily curiosity or daily page, cross-device save sync (which needs a backend, so it's out for a client-only build), a full Noor wardrobe, new chapters as recurring content drops, leaderboards and streaks. None of these are in the M4 contract. They're just what the foundation makes possible.

---

### 3.9 Stage integration

The loop runs across all three stages, with each one giving its pages and answers a different flavour.

| Stage | Theme | Pages (~4 each) | Curiosity flavour | Answers from |
|---|---|---|---|---|
| 1. Desert / Heritage | Bedouin sky-reading, oasis, caravan | star navigation, the oasis, caravan routes | "How did they cross with no map?" | desert Knowledge Fragments |
| 2. City / Bayt al-Hikma | Golden-age science, the Library | translation, the astrolabe, the House of Wisdom | "Who wrote the page I'm holding?" | Library challenges + city fragments |
| 3. Observatory | Astronomy, constellations, Al-Sufi | star catalogues, moon phases, the qibla | "Why map the heavens at all?" | observatory fragments, final page |

A couple of rules that hold it together. Pages are found in their home stage, but a curiosity you open in Stage 1 can be answered in Stage 2 or 3. That cross-stage thread is what makes a full playthrough feel connected rather than like three separate games stitched end to end. And Stage 3's final pages assemble into the closing page that triggers the ending: Noor's last line, the book made whole. That gives Stage 3 a genuine narrative climax, which also feeds straight into the bar you set about Stage 3 needing to feel like a clear step up. It's the payoff stage for the entire loop. None of this touches the existing transitions mechanically, the desert-gate-city-carpet-ascent-observatory chain stays as it is; M4 just lays the book and curiosity beats over the top.

---

### 3.10 What a real run looks like

Easiest way to show the loop working is to walk one through, start to finish.

You start in the desert. Around 60m Noor does her intro and the Lost Book intro page appears with that line about secrets only revealed by collecting them all. That beat already exists; now it's framed as page zero.

A bit further on, 180m or so, you find page two, torn: "They never lost their way, because they read the…" and the sentence just stops. A curiosity opens, "How did the caravans cross the desert with no map?", and it goes onto your open list. Noor: "A good question. Keep your eyes on the sky."

At 320m a Knowledge Fragment spawns, glowing brighter than the usual ones because it answers a question you're already carrying. You grab it: "Bedouin navigators steered by the fixed stars, the sky was their map." The resolution beat fires, golden burst, Noor connects it back ("So that's what the page meant, the stars themselves"), page two knits back together in gold, stars arc up to the counter. What the player feels in that moment is simple: I asked something, the world answered, my book grew.

Then in Stage 2 you open page five, torn, with a curiosity about who actually wrote these pages, but the answer isn't in reach this run. So it stays open, nagging at you.

Which is why you start run two partly just to close it. In Stage 2 you solve the Library challenge tied to it and the page restores through the studious route instead. You cross six restored pages, which trips a book milestone, so Noor opens up a little more and you keep a permanent extra heart.

By run three or four you're in the Observatory chasing the last pages. The closing page assembles, Noor gets her final line, the book is whole, the ending plays, and the menu ticks over to 100%.

That whole arc, find, wonder, discover, connect, grow, run again, is the M4 experience in a sentence.

---

## 4. Where I need your call

These are the decisions I'd genuinely like you to weigh in on before we lock anything.

1. Noor's progression. Are you happy folding the abstract bond-points meter into the Lost Book milestones? I'm fairly strongly for it, one number that means everything, but it's your character so it's your call.
2. Page count. Twelve (four a stage) feels right to me for shipping plus leaving you room to expand. More, fewer?
3. The permanent unlock. Gold scarf, or +1 starting heart? Or one at each of two milestones?
4. The Library studious route. Do you want page-restore-via-challenge as an alternative to finding it in the field, or would you rather keep the two systems apart?
5. Cross-stage threads. Comfortable with a Stage 1 curiosity being answered in Stage 2 or 3? It's the connective tissue, but it does ask for a bit more care when authoring.
6. The Curiosity-vs-Knowledge tone. Curiosity in a wondering voice, Knowledge plain and factual. Does that split sit right with you?

---

## 5. What M4 actually covers

**[M4 SCOPE]** the build:

1. The core loop engine, page → curiosity → knowledge answer → Noor connect → restore.
2. The Lost Book screen (pause and results), with around twelve authored pages across the three stages.
3. The Curiosity Fragments system, the open-curiosities list, and the answer-glow pull.
4. The Knowledge Fragment extension (`answersCuriosityId`) and the resolution beat.
5. Noor's connector cues, collapsing the bond into page milestones, and filling the placeholder beats.
6. The Library page-link integration (one route).
7. Discovery hooks, the occasional page or curiosity surfacing from an ambient glow, kept light.
8. Page-linked reward beats plus one permanent unlock.
9. The Stage 3 closing page and the ending beat.
10. Persisting book and curiosity state, with completion percentage on the menu.
11. The iOS / Safari pass and demo build, carried over from the original M4 line.

**[VISION / FUTURE]** explicitly not in M4: daily content, cross-device sync, a full Noor wardrobe, new chapters, leaderboards, conditional secret page-sets, a walkable Library hub.

One thing that doesn't change: all the new content (pages, curiosities, answers, Noor lines) lives in the editable `data/*.ts` files. You write the content, the engine code stays put.

---

## 6. My recommendation

If we lock one thing first, make it the core loop in section 2 and the twelve-page structure in 3.1 and 3.9. That's the irreducible heart of M4. Everything else in section 3 is a layer sitting on that spine, and we can tune any of it in review without disturbing the foundation.

The single decision that matters most is the first one in section 4, collapsing Noor's bond into the book. If we go that way, M4 becomes one clean progression instead of two competing ones. It's simpler to build, simpler to feel, and it makes the Lost Book the actual soul of the game.

Send me your marks on section 4 and anything you'd add, and I'll roll it all into a v2 and lock the final scope.
