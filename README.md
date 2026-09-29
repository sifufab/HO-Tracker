# HO-Tracker

App für iOS, Android (und Web-Vorschau) zum Erfassen von Homeoffice-Stunden pro Monat.
Gebaut mit [Expo](https://expo.dev) / React Native und TypeScript.

## Funktionen

- Kalender pro Monat; Tippen auf einen Tag: **Büro**, **ganzer Tag Homeoffice**, **teilweise Homeoffice** (Stunden eingeben) oder **abwesend** (Urlaub, Feiertag, krank)
- Soll-Stunden pro Wochentag einstellbar (Standard: Mo–Do 8,5 h, Fr 4,5 h, Wochenende frei)
- Maximaler Homeoffice-Anteil einstellbar (Standard: 30 %)
- Anzeige: Soll-Arbeitszeit, HO-Stunden, HO-Anteil, verbleibendes HO-Budget in Stunden
- Abwesende Tage zählen nicht zur Soll-Arbeitszeit
- Daten bleiben lokal auf dem Gerät
- Werbebanner (Google AdMob) inkl. DSGVO-Einwilligung (Google UMP); im Web keine Werbung

## Entwicklung

```bash
npm install
npm run web        # Vorschau im Browser
npm test           # Unit-Tests der Berechnung
npm run typecheck
npx expo lint
```

Wegen AdMob (native Bibliothek) läuft die App **nicht in Expo Go**. Für iOS/Android braucht es einen
Development Build: `npx eas-cli@latest build --profile development --platform android` (bzw. `ios`).

## Veröffentlichen – Checkliste

1. **Konten:** Expo-Konto (gratis), Google Play Console (einmalig 25 USD), Apple Developer Program (99 USD/Jahr).
   iOS-Builds laufen über EAS in der Cloud, ein Mac ist nicht nötig.
2. **Bundle-ID:** in `app.json` ist `com.sifufab.hotracker` eingetragen, bei Bedarf vor dem ersten Release ändern (danach nicht mehr möglich).
3. **AdMob:** Konto anlegen, je eine App für iOS und Android registrieren, je eine Banner-Anzeigeneinheit erstellen.
   - App-IDs (`ca-app-pub-…~…`) in `app.json` beim Plugin `react-native-google-mobile-ads` eintragen (aktuell Googles Test-IDs).
   - Banner-IDs (`ca-app-pub-…/…`) in `src/ads/AdBanner.native.tsx` eintragen.
   - In AdMob unter „Datenschutz und Mitteilungen“ eine DSGVO-Mitteilung anlegen, sonst erscheint kein Einwilligungsdialog.
   - `app-ads.txt` auf einer eigenen Website hinterlegen (von AdMob verlangt).
4. **Datenschutzerklärung:** Pflicht in beiden Stores, sobald Werbung eingebunden ist (öffentliche URL).
5. **Store-Angaben:** Apple „App Privacy“ und Google „Data safety“ ausfüllen (AdMob erhebt Geräte-IDs/Nutzungsdaten).
6. **Build & Upload:** `npx eas-cli@latest build --profile production --platform all`, dann `npx eas-cli@latest submit`.

## Desktop-Version

`desktop/homeoffice_tracker.py` ist die ursprüngliche Python/Tkinter-Version (ohne Teil-Tage und ohne einstellbares Limit).
