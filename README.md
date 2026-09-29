# Homeoffice-Tracker

Kleine Desktop-App (Python + Tkinter, keine zusätzlichen Pakete) zum monatlichen Erfassen von Homeoffice-Tagen.

- Mo–Do: 8,5 h, Fr: 4,5 h
- Klick auf einen Tag: Büro → Homeoffice → Abwesend (Urlaub/Feiertag/Krank) → Büro
- Abwesende Tage zählen nicht zur Soll-Arbeitszeit
- Anzeige der HO-Quote (Limit 30 %) und des verbleibenden HO-Budgets in Stunden
- Daten werden in `~/.homeoffice_tracker.json` gespeichert

Start: `python homeoffice_tracker.py`
