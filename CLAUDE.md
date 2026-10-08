# Glosspelet

Glosövningsspel (svenska ↔ engelska) för en 11–12-åring. Live på https://markusbroman.github.io/glosor/ (repo `markusbroman/glosor`). Push till `main` bygger och publicerar via GitHub Actions. Push till en `claude/**`-gren som bara ändrar veckofiler slås ihop till `main` automatiskt (`.github/workflows/glosor-fran-mobilen.yml`), så att nya ord kan läggas in från Claude-appen på mobilen.

## Stack
Vite + Svelte 5 (runes) + TypeScript, Vitest, `phosphor-svelte` för ikoner, Lexend som typsnitt. Ingen backend: framstegen ligger i `localStorage` (`glosor.progress`).

## Veckans ord
- En fil per vecka: `src/data/weeks/<förhörsdatum>.json` (förhör = torsdag). Använd skillen `/nya-glosor` för att lägga till ord från ett foto.
- Ikoner: Phosphor-namn utan `Icon`-suffix. Pluginen `wordIcons` i `vite.config.ts` importerar bara de ikoner som används.

## Logik
- `src/lib/weeks.ts`: vilken vecka som är aktuell (byts på torsdagen när nästa lista finns).
- `src/lib/progress.ts`: Leitner-lådor 1–5, högst en låda upp per dag, två ned vid fel.
- `src/lib/scheduler.ts`: dagens pass (cirka 12 steg, 75 % veckans ord, 25 % äldre ord på tur), läge per låda, generalrepetition dagen före och på förhörsdagen.
- `src/exercises/`: ett läge per komponent. Varje komponent anropar `onAnswer` en gång.

## Designprinciper
Följ dem vid ändringar. Hon kan ha svårt att hålla fokus.
- En uppgift per skärm, lugna färger, inga tidtagare och inga emojis (använd Phosphor-ikoner).
- Korta pass med tydligt slut. Fel rättas lugnt och ordet kommer tillbaka senare i passet.
- Respektera `prefers-reduced-motion` och ljust/mörkt läge (tokens i `src/app.css`).

## Kommandon
`npm run dev` (testa annan dag: `/glosor/?idag=2026-10-05`), `npm test`, `npm run check`, `npm run build`.
