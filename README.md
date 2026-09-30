# HO-Tracker

App für iOS, Android (und Web-Vorschau) zum Erfassen von Homeoffice-Stunden pro Monat.
Gebaut mit [Expo](https://expo.dev) / React Native und TypeScript.

## Funktionen

- Kalender pro Monat; Tippen auf einen Tag: **Büro**, **ganzer Tag Homeoffice**, **teilweise Homeoffice** (Stunden eingeben) oder **abwesend** (Urlaub, Feiertag, krank)
- Soll-Stunden pro Wochentag einstellbar (Standard: Mo–Do 8,5 h, Fr 4,5 h, Wochenende frei)
- Maximaler Homeoffice-Anteil einstellbar (Standard: 30 %)
- Anzeige: Soll-Arbeitszeit, HO-Stunden, HO-Anteil, verbleibendes HO-Budget in Stunden
- Abwesende Tage zählen nicht zur Soll-Arbeitszeit
- Sprachen: Deutsch und Englisch (automatisch nach Gerätesprache oder in den Einstellungen wählbar); Texte in `src/i18n.tsx`
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

## Web-App (GitHub Pages)

Jeder Push auf `main` baut die Web-Version und veröffentlicht sie unter
**https://sifufab.github.io/HO-Tracker/** (Workflow `.github/workflows/deploy-pages.yml`).

- Installierbar als App: iPhone (Safari) → Teilen → „Zum Home-Bildschirm“; Android (Chrome) → Menü → „App installieren“.
- Funktioniert nach dem ersten Aufruf auch offline (Service Worker in `public/sw.js`).
- Daten liegen nur im Browser des Geräts (localStorage). Browserdaten löschen = Einträge weg.
- Einmalige Einrichtung: Repo öffentlich (GitHub Pages ist für private Repos nur mit GitHub Pro verfügbar),
  dann Settings → Pages → Source: **GitHub Actions**.
- Der Pfad `/HO-Tracker` ist in `app.json` unter `experiments.baseUrl` hinterlegt; bei Umbenennung des Repos anpassen.

## Ohne Server: eine einzelne HTML-Datei

Falls `github.io` gesperrt ist (z. B. im Firmennetz): `standalone/HO-Tracker.html` herunterladen
(auf GitHub die Datei öffnen → „Download raw file“) und per Doppelklick im Browser öffnen.
Es braucht keinen Server, keine Installation und keine Internetverbindung.

- Die Einträge liegen im Browser-Speicher dieser Datei. Datei nicht verschieben oder umbenennen und immer im selben Browser öffnen,
  sonst erscheint der Kalender leer (Firefox trennt Daten nach Dateipfad).
- Neu erzeugen nach Code-Änderungen: `npm run build:standalone`.
- Nicht enthalten: Installation als App, Offline-Cache (unnötig, die Datei ist lokal), Werbung.

## Veröffentlichen in den Stores – Checkliste

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
