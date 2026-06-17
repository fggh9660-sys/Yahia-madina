# M3 Spec — City of Knowledge Interaction Systems + Stage 3

**Status:** Draft for Yahia ACK before implementation begins
**Date:** 2026-05-31
**Phase:** 30-day engagement, second half (after M1 + M2 closed)

---

## Vision

> "Evolve the game from a simple runner into a richer interactive learning experience while still keeping the core flow clean and fun." — Yahia 2026-05-28

M3 is where the game shifts from "prototype with systems" to "world that feels alive." Two complementary directions:

- **M3a — Interaction depth:** Replace the current quiz popup with a family of short, varied mini-challenges that feel like discovery moments, not tests. Add Curiosity Fragments to create anticipation across runs.
- **M3b — World expansion:** New Stage 3 with its own atmosphere + stage transition moment + end-of-stage reward sequence.

Both milestones run under the same locked workflow that worked for M1 + M2:

1. Spec ACK from Yahia before any code
2. Single-batch implementation per milestone
3. Vercel preview = verification artifact
4. 2 revision rounds per item max → ship or queue for M4 polish
5. Sign-off → USD 12 → next milestone

---

## M3a — Interaction Systems (USD 12)

### Goal

Replace the existing question popup with a family of mini-challenges that match Yahia's reference mockups (sent 2026-05-29). Each mini-challenge:

- Fits in 15-30 seconds
- Fades in / fades out cleanly without breaking flow
- Pauses gameplay completely while active (per M2-R1a pattern)
- Returns a reward sized to the difficulty + correctness

Plus a new content delivery system — Curiosity Fragments — that creates anticipation across runs through paired question→answer chains.

### Deliverable 1: Mini-challenge framework

**Rest moment shell** — shared UI wrapper for every mini-challenge:
- Soft fade-in backdrop (subtle library art per Yahia's mockup reference)
- Noor character in framing position (small portrait beside the challenge area)
- Title chip (Arabic + English bilingual if needed)
- Prompt / instruction text
- Challenge interaction area
- Reward preview chip(s)
- Tap-to-start or auto-start on appearance
- Tap-anywhere-to-continue on completion

**Dispatcher** — `MiniChallengeManager` replaces direct `showQuestionUI` calls from EventManager:
- Receives encounter trigger
- Picks a challenge type from current stage's pool
- Renders via shared shell
- Routes correctness back to EventManager (existing reward flow)

### Deliverable 2: Six mini-challenge types

Each is a self-contained class implementing a common interface (`MiniChallenge`). Stage-themed pool drives which set is in rotation. Order below matches Yahia's mockup numbering.

#### 1. Draw a Shape

- Player traces a target shape (star, square, simple symbol) within a time window (15s)
- Touch / mouse drag captured as path
- Path compared to target with tolerance
- Reward: +stars + small speed boost
- Stage themes: desert (crescent, palm), city (book, lantern outline)

#### 2. Connect the Dots

- Grid of dots (3×3 or 4×4)
- Player draws single continuous line connecting all dots in correct order
- Visual feedback per correct dot
- Reward: +stars + 1 heart OR 1 knowledge fragment
- Stage themes: desert (caravan trail), city (constellation, architectural diagram)

#### 3. Pattern Match

- Sequence of 4 symbols with `?` as 5th slot
- 4 answer options below
- Player picks the symbol that completes the pattern
- Reward: +stars + 1 shield
- Stage themes: desert (animal tracks, calligraphy), city (geometric tiles, scientific symbols)

#### 4. Word Scramble

- 5-7 Arabic letters scrambled
- Player rearranges into target word (knowledge-tied vocabulary)
- Tap letter to add to answer slot, tap slot to remove
- Reward: +stars + 1 knowledge fragment
- Stage themes: desert (heritage words), city (science / scholarship vocabulary)

#### 5. Riddle Time

- Short Arabic riddle (1-3 lines, kid-appropriate)
- 3-4 answer choices
- Player picks the answer
- Reward: +stars + 1 heart
- Stage themes: desert (animals, nature), city (objects, concepts)

#### 6. Choose Your Path

- Brief pause + two themed gates appear visually side by side
- Each path shows label + reward preview (Wisdom +Stars / Courage +Heart)
- Player picks left or right (tap or A/D key)
- Chosen path's rewards seed into next 5-10 seconds of run
- **Replaces legacy Split Path system** removed in M2-R3
- No parallel-track architecture — cinematic decision moment only

### Deliverable 3: Curiosity Fragments chain mechanism

Per Yahia's "Curiosity Fragments System" proposal (2026-05-29).

**Schema:**
```ts
interface CuriosityFragment {
    id: string;          // unique
    chainId: string;     // pairs question + answer
    role: 'question' | 'answer';
    emoji: string;
    text: string;        // 1-2 lines max
    noorLine?: string;   // optional Noor reaction on pickup
    stage?: 1 | 2 | 3;   // distribution control
}
```

**Pairing logic:**
- Question fragment spawns → modal shows question + ❓ visual
- Answer fragment spawns later (after time/distance/stage advance) → modal shows answer + reveal
- State tracker holds which chain IDs have shown question vs answer to avoid duplicates per run

**Distribution per Yahia's spec:**
- Stage 1 = chains 1-2 (4 fragments)
- Stage 2 = chains 3-4 (4 fragments)
- Stage 3+4 = chains 5-8 (8 fragments, seeded for M3b + M4)
- Content is Yahia-provided 16 fragments; lands in `data/curiosityFragments.ts` (Yahia-editable per project convention)

**Visual differentiation:**
- Question fragments: ❓ icon style with cyan accent
- Answer fragments: ✨ icon style with gold accent (reveal moment)
- Both use the existing fragment pickup modal flow (M2-R1a)

### Deliverable 4: Encounter trigger integration

Replace the legacy `showQuestionUI` path with the new dispatcher:
- Existing chest/gate encounter triggers route through `MiniChallengeManager.openEncounter()`
- Mini-challenge picks from stage pool based on encounter type
- Correct → existing reward flow (open chest/gate + bonus stars)
- Wrong → existing M2-R1 behavior (light slowdown + encounter dismissed, no damage)

Old quiz `Question` interface stays as fallback / migration shim; new `MiniChallenge` interface is canonical.

### M3a effort estimate

| Item | Effort |
|------|--------|
| Mini-challenge framework + shell | ~1 day |
| Draw a Shape | ~1 day |
| Connect the Dots | ~1 day |
| Pattern Match | ~0.5 day |
| Word Scramble | ~0.5 day |
| Riddle Time | ~0.5 day |
| Choose Your Path | ~0.5 day |
| Curiosity Fragments chain mechanism + content data + visual differentiation | ~1.5 day |
| Encounter trigger integration + cleanup | ~0.5 day |
| Integration polish + Vercel preview | ~0.5 day |
| **Total** | **~7-8 days** |

### M3a branch + workflow

- Branch: `feature/mini-challenge-system` off `main` (after M2 merged from `feature/skill-depth-noor`)
- Single-batch push when all 6 types + framework + Curiosity Fragments ready
- Vercel preview link to Yahia for validation
- Up to 2 revision rounds per item, then ship or M4 polish queue
- Sign-off → USD 12 → M3b begins

---

## M3b — Stage 3 + World Progression (USD 12)

### Goal

New stage that expands the world beyond desert (Stage 1) and city (Stage 2). Plus the transition gate + end-of-stage reward moment Yahia added to M2 scope but agreed to defer.

### Deliverable 1: Stage 3 design doc

Collaborative async with Yahia. Covers:
- Theme + mood references (Yahia to provide art direction)
- Obstacle types (1-2 new ones specific to Stage 3)
- Signature encounter (1 new set-piece like collapsing bridge in Stage 2)
- Music brief (Yahia's deliverable; Nanda provides placeholder synth)
- Art direction outline (Yahia's deliverable)

**Yahia go/no-go decision point BEFORE any real art is committed.**

### Deliverable 2: First playable slice

- Environment skeleton — background layers + ground tiles + parallax
- 1 new obstacle type
- 1 new event / encounter
- Stage transition cinematic placeholder (full cinematic in deliverable 3)
- All art placeholder (Nanda canvas-generated style)

### Deliverable 3: Stage transition gate

- Larger themed portal (vs the simple gate currently used at Stage 1→2)
- Cinematic camera sweep on approach
- Noor dialogue narrating the transition (data file editable)
- Atmospheric particles (subtle per visual style ground rule)

### Deliverable 4: End-of-stage reward moment

- Triggers when player completes a stage
- Satisfying reward sequence (star cluster, score tally, lore drop)
- Slows pace to let achievement land
- Music swell + Noor congratulation line
- Smoothly transitions into next stage or stage results UI

### M3b effort estimate

| Item | Effort |
|------|--------|
| Stage 3 design doc (collaborative with Yahia) | ~1 day spread |
| First playable slice (env + obstacle + event + transition placeholder) | ~3 days |
| Stage transition gate (cinematic + dialogue + particles) | ~1.5 days |
| End-of-stage reward moment | ~1 day |
| Integration polish + Vercel preview | ~0.5 day |
| **Total** | **~7 days** |

### M3b branch + workflow

- Branch: `feature/stage-3` off `main` (after M3a merged)
- Same workflow as M3a
- Sign-off → USD 12 → M4 begins

---

## Out of M3 scope (deferred or dropped)

### Deferred to M4 polish queue
- **Lost Book "Book of Noor" UI** — collection screen showing all collected lore + curiosity fragments
- **Two-lane visual rendering** for the original Split Path (legacy code removed in M2-R3, Choose Your Path mini-challenge in M3a is the replacement)
- **Chunky bridge tiles** for collapsing bridge

### Dropped from list by Yahia 2026-05-29
- ❌ **Choose Your Color personalization** — character visual reskin pipeline
- ❌ **Badge system** — color-conditional Noor + persistent rewards
- ❌ **Future 8 fragment categories** (Space, Animal, Science, World Wonders, Ancient Civilizations, City of Knowledge Secrets, Noor Fragments, Lost Book Fragments) — content expansion, not engine work

### Out of engagement scope entirely
- Final art assets (Yahia's deliverable)
- Final audio production (Yahia's deliverable; Nanda provides placeholder synth)
- App store submission
- Marketing

---

## Durable rules carrying through M3

- **Visual style:** subtle cinematic — small particles, edge-only motion, center 60% stays clear
- **Set-piece identity:** when Yahia says "still feels similar", go BIGGER structurally — new ground type, void, physics, camera
- **Yahia-editable content files:** all gameplay content lives in `/data/*.ts` (loreFragments, noorLines, questions, curiosityFragments) — Yahia can edit without touching engine code
- **Revision discipline:** 2 rounds per item max, then ship or M4 polish queue
- **Spec as contract:** Vercel preview = verification artifact
- **Single-batch push per milestone:** lock spec → batch implement → single ship → revisions only after preview

---

## Payment cadence (reminder)

| Milestone | Status | Payment |
|-----------|--------|---------|
| M1 | ✅ Closed 2026-05-26 | USD 12 received |
| M2 | ✅ Closed 2026-05-31 | USD 12 received |
| **M3a** | 🚧 spec ACK pending | USD 12 on sign-off |
| **M3b** | ⏳ queued after M3a | USD 12 on sign-off |
| M4 | ⏳ queued after M3b | USD 12 on sign-off |

In-phase total: USD 60 (5 × USD 12). USD 24 received, USD 36 remaining.

Deferred USD 140 in monthly installments after phase close.

---

## Sign-off prompt for Yahia

Once you've reviewed:

1. Are the 6 mini-challenge types right? Anything you'd add, drop, or reframe?
2. Is the Curiosity Fragments chain mechanism aligned with your 2026-05-29 proposal?
3. Is the M3a / M3b split rhythm acceptable, or do you prefer a different split?
4. Any constraints on the Stage 3 theme direction you want to share before we draft the design doc collaboratively?

ACK on this spec → M3a coding begins.
