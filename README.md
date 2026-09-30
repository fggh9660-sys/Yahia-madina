# Knowledge Run — City of Knowledge (مدينة العلم)

An educational endless runner for children, set in an Arabic-inspired world. Players run through the desert and the old city with **Prince Noor**, collect stars, avoid obstacles and answer questions to open magic gates, on the way to **the House of Wisdom (بيت الحكمة)**.

The game is fully bilingual: **English** and **Arabic** (with right-to-left layout), switchable at any time.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Phaser](https://img.shields.io/badge/Phaser-3.90-8A2BE2)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

---

## Table of Contents

- [Features](#features)
- [Gameplay](#gameplay)
- [Controls](#controls)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Localization (English / Arabic)](#localization-english--arabic)
- [Deployment](#deployment)
- [Tech Stack](#tech-stack)

---

## Features

- **Two themed stages**: *The Desert Road* and *The City Entrance*, ending at the House of Wisdom.
- **Learning built into play**: gate questions (math, language, general knowledge, science) and short mini-puzzles.
- **Story events**: sandstorms with a Bedouin-tent shelter, magic flying carpets, a travel gate and a cinematic ending.
- **Prince Noor as a guide**: an animated companion who explains, encourages and warns the player.
- **Age groups**: 5–7, 8–10 and 11–13.
- **Progress and results**: stage progress bar, hearts, shields, stars and an end-of-stage summary (distance, stars, correct/wrong answers, time).
- **English and Arabic**: every in-game text is translated, the language can be changed at any time, and the choice is remembered.
- **Audio**: separate music for the menu and each stage, sound effects, and independent sound/music toggles that are remembered between sessions.
- **Pause menu**: resume, restart the stage, return to the main menu or change the language. The game pauses automatically when the tab loses focus.
- **Responsive**: plays on desktop and mobile browsers.

## Gameplay

1. **Home** → **How to Play** → **Choose your age group** → **Game details** → **Start**.
2. Run automatically and **jump** over obstacles. Hold the jump longer to jump higher.
3. **Collect stars** to increase your score, and pick up hearts and shields.
4. **Answer the gate questions** correctly to open the magic gates.
5. Survive the sandstorm, ride the magic carpet and reach **the House of Wisdom**.

You start with 3 hearts. The game ends when all hearts are lost.

## Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Jump (hold for a higher jump) | `Space` / `↑` / mouse click | Tap (and hold) |
| Answer a question or puzzle | Click an option | Tap an option |
| Pause | ⏸ button | ⏸ button |
| Restart after game over | `R` or **Play Again** | **Play Again** |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (comes with Node.js)

### Installation

```bash
git clone https://github.com/fggh9660-sys/Yahia-madina.git
cd Yahia-madina
npm install
```

### Run in development

```bash
npm run dev
```

Then open **http://localhost:3000**. The dev server also listens on your local network, so you can test on a phone connected to the same Wi-Fi.

No API keys or environment variables are needed.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot reload (port 3000) |
| `npm run build` | Build an optimized production bundle into `dist/` |
| `npm run preview` | Serve the production build locally for a final check |

## Project Structure

```
├── App.tsx                 # Screen flow (intro → home → how to play → age → details → game), audio control
├── index.tsx / index.html  # Entry point
├── types.ts                # Shared types for game state (game ↔ UI)
├── constants.ts            # Physics, stage lengths, ground and camera settings
├── i18n/                   # Localization
│   ├── translations.ts     #   All English and Arabic UI text
│   ├── index.ts            #   Language store, t() and formatDigits()
│   └── useLanguage.ts      #   React hook
├── components/             # React UI screens and overlays (HUD, menus, results, language switcher)
├── game/                   # Phaser game
│   ├── game.ts             #   Phaser configuration
│   ├── scenes/             #   BootScene, HomeScene, MainScene
│   ├── managers/           #   Audio, collision, environment, events and spawning
│   ├── objects/            #   Player, Noor, obstacles, collectibles, gates, carpet, buildings…
│   ├── generators/         #   Procedurally drawn textures and scenery
│   └── data/questions.ts   #   Bilingual question bank
└── public/                 # Static assets (audio, Noor images, favicon)
```

**Architecture in short:** Phaser renders and runs the game world. React draws all the menus and overlays on top of it. The game sends its state to React through a callback, and React calls methods on `MainScene` for player actions (answering, pausing, restarting).

## Localization (English / Arabic)

- Players switch language from the intro screen, the home screen or the pause menu.
- The choice is saved in `localStorage`. On a first visit, Arabic is chosen for Arabic-language browsers and English for everyone else.
- The game sends **translation keys** (not finished text) to the UI, so switching language re-translates text that is already on screen.

### Adding or changing text

1. Add the key and Arabic text to the `ar` object in [`i18n/translations.ts`](i18n/translations.ts).
2. Add the same key to the `en` object. TypeScript reports an error if an English entry is missing.
3. Use it in a component with `const { t } = useLanguage();` and `t('your.key')`, or in game code with `import { t } from '../../i18n'`.

### Adding a question

Add an entry to [`game/data/questions.ts`](game/data/questions.ts) with the text and options in both languages. Keep the options in the same order in both languages so `correctIndex` is right for each.

```ts
{
  id: 'm4', correctIndex: 0, category: 'math',
  text:    { ar: '٣ + ٣ = ؟', en: '3 + 3 = ?' },
  options: { ar: ['٦', '٥', '٨'], en: ['6', '5', '8'] }
}
```

### Adding another language

Add its code to `Language` and `LANGUAGES` in `i18n/index.ts` and a full dictionary in `translations.ts`, then add the new language to each question in `questions.ts`.

## Deployment

The game is a static site. Build it and upload the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, Firebase Hosting and so on):

```bash
npm run build
```

- **Netlify / Vercel / Cloudflare Pages**: build command `npm run build`, output directory `dist`.
- **Serve from the domain root** (for example `https://your-game.com/`). Audio files are loaded from absolute paths such as `/audio/...`, so hosting under a sub-path (such as GitHub Pages project sites) needs those paths updated first.

## Tech Stack

- [Phaser 3](https://phaser.io/) for the game engine (rendering, physics, animation, audio)
- [React 19](https://react.dev/) for UI screens and overlays
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for the dev server and build
- [Tailwind CSS](https://tailwindcss.com/) for UI styling (via CDN)
- [Cairo](https://fonts.google.com/specimen/Cairo) font for Arabic and Latin text
