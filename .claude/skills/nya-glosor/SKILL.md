---
name: nya-glosor
description: Lägg in veckans nya glosor i Glosspelet från ett foto av glospappret (eller inklistrad text), med ikoner och exempelmeningar, och publicera. Använd när användaren ger en bild på glosor, skriver /nya-glosor eller ber om att lägga till veckans ord.
---

# Nya glosor

Lägg in en ny veckolista i `src/data/weeks/` och publicera den. Läxförhöret är på torsdagar.

## 1. Läs av orden
- Läs bilden (eller texten) noga. Ta med varje par svenska–engelska och behåll exakt stavning, även apostrofer och bindestreck.
- Skriv orden med liten bokstav om de inte är namn eller "I".
- Om något är svårläst: fråga hellre än att gissa.

## 2. Bestäm vecka
- Filnamn och `due` = **nästa torsdag** efter idag (om idag är torsdag: torsdag nästa vecka), format `YYYY-MM-DD`.
- `title` = rubriken på pappret (t.ex. "Kapitel 4"), annars "Vecka <veckonummer>".
- Om en fil för det datumet redan finns: fråga om orden ska läggas till eller ersätta.

## 3. Komplettera varje ord
- `icon`: ett Phosphor-ikonnamn utan "Icon"-suffix som bildmässigt passar ordet. Kontrollera att `node_modules/phosphor-svelte/lib/<Namn>Icon.svelte` finns (`ls node_modules/phosphor-svelte/lib | grep -i <sökord>`). Hoppa över ikonen hellre än att välja en missvisande.
- `example`: en kort, naturlig mening på engelska (max ca 10 ord) för en 11–12-åring, med vardagliga ämnen som skola, kompisar, sport, mat och djur. Meningen **måste innehålla glosan exakt** som den skrivs i `en` (stor bokstav i början är okej), och `sv` är en naturlig svensk översättning.

## 4. Visa och bekräfta
Visa en tabell (svenska | engelska | ikon | exempelmening) och vänta på ok innan du skriver filen.

## 5. Skriv, testa, publicera
```json
{
  "title": "Kapitel 4",
  "due": "2026-10-15",
  "words": [
    { "sv": "…", "en": "…", "icon": "…", "example": { "en": "…", "sv": "…" } }
  ]
}
```
1. Skriv `src/data/weeks/<due>.json`.
2. `npm test && npm run check && npm run build`. Testerna kontrollerar att datumet är en torsdag, att ikonerna finns och att exempelmeningarna innehåller ordet.
3. Commit, t.ex. `Lägg till glosor för <title> (<due>).`, och `git push`.
4. Följ bygget med `gh run watch`. När det är grönt finns orden på https://markusbroman.github.io/glosor/.
