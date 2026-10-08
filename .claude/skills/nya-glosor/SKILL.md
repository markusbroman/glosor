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

- `note` (valfri): en kort anteckning för vuxna när översättningen på pappret är tveksam, t.ex. plural mot singular ("bon" → "nest"), fel tempus eller ett ord som böjs annorlunda. Ändra aldrig själva glosan, skriv hellre en anteckning. Visas hopfälld längst ned på sidan "För vuxna".

## 4. Visa och bekräfta
Visa en tabell (svenska | engelska | ikon | exempelmening) och vänta på ok innan du skriver filen. Lista eventuella anteckningar under tabellen.

## 5. Skriv, testa, publicera
```json
{
  "title": "Kapitel 4",
  "due": "2026-10-15",
  "words": [
    { "sv": "…", "en": "…", "icon": "…", "example": { "en": "…", "sv": "…" }, "note": "…" }
  ]
}
```
1. Om `node_modules` saknas (t.ex. i en molnsession från mobilappen): kör `npm ci`.
2. Skriv `src/data/weeks/<due>.json`. Ändra inga andra filer i samma commit.
3. `npm test && npm run check && npm run build`. Testerna kontrollerar att datumet är en torsdag, att ikonerna finns och att exempelmeningarna innehåller ordet.
4. Commit, t.ex. `Lägg till glosor för <title> (<due>).`, och pusha:
   - **På `main`** (lokalt på datorn): `git push`. Flödet "Publicera" bygger sidan.
   - **På en `claude/...`-gren** (molnsession från mobilen): pusha grenen. Flödet "Glosor från mobilen" kontrollerar att bara veckofiler ändrats, kör testerna, slår ihop till `main` och publicerar. Ingen pull request behövs.
5. Om `gh` finns: följ körningen med `gh run watch`. Annars: berätta att orden är ute om cirka 2 minuter på https://markusbroman.github.io/glosor/.
