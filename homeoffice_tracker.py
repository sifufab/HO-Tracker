"""Homeoffice-Tracker: markiert pro Monat Homeoffice-Tage und berechnet die HO-Quote.

Arbeitszeit: Mo-Do 8.5 h, Fr 4.5 h. Die Quote darf 30 % nicht überschreiten.
Klick auf einen Tag wechselt: Büro -> Homeoffice -> Abwesend (Urlaub/Feiertag/Krank) -> Büro.
Abwesende Tage zählen nicht zur Soll-Arbeitszeit des Monats.
"""

import calendar
import datetime as dt
import json
from pathlib import Path

HOURS_PER_WEEKDAY = {0: 8.5, 1: 8.5, 2: 8.5, 3: 8.5, 4: 4.5}  # Mo=0 ... Fr=4
LIMIT_PERCENT = 30.0
DATA_FILE = Path.home() / ".homeoffice_tracker.json"

OFFICE, HOME, ABSENT = "office", "home", "absent"
NEXT_STATUS = {OFFICE: HOME, HOME: ABSENT, ABSENT: OFFICE}
MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
          "August", "September", "Oktober", "November", "Dezember"]


def working_days(year, month):
    """Alle Werktage (Mo-Fr) des Monats."""
    _, ndays = calendar.monthrange(year, month)
    days = (dt.date(year, month, d) for d in range(1, ndays + 1))
    return [d for d in days if d.weekday() in HOURS_PER_WEEKDAY]


def month_stats(year, month, statuses):
    """statuses: dict ISO-Datum -> Status. Liefert Soll-, HO-Stunden, Quote und Rest-Budget."""
    total = home = 0.0
    for day in working_days(year, month):
        status = statuses.get(day.isoformat(), OFFICE)
        if status == ABSENT:
            continue
        hours = HOURS_PER_WEEKDAY[day.weekday()]
        total += hours
        if status == HOME:
            home += hours
    percent = home / total * 100 if total else 0.0
    remaining = total * LIMIT_PERCENT / 100 - home
    return {"total": total, "home": home, "percent": percent, "remaining": remaining}


def load_data(path=DATA_FILE):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_data(data, path=DATA_FILE):
    path.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")


class TrackerApp:
    COLORS = {OFFICE: "#e8e8e8", HOME: "#8fd18f", ABSENT: "#b0c4de"}
    LABELS = {OFFICE: "Büro", HOME: "Homeoffice", ABSENT: "Abwesend"}

    def __init__(self, root):
        import tkinter as tk

        self.tk = tk
        self.root = root
        self.data = load_data()
        today = dt.date.today()
        self.year, self.month = today.year, today.month

        root.title("Homeoffice-Tracker")
        root.resizable(False, False)

        nav = tk.Frame(root, padx=10, pady=10)
        nav.pack(fill="x")
        tk.Button(nav, text="◀", width=3, command=lambda: self.shift_month(-1)).pack(side="left")
        self.title = tk.Label(nav, font=("Helvetica", 14, "bold"))
        self.title.pack(side="left", expand=True)
        tk.Button(nav, text="▶", width=3, command=lambda: self.shift_month(1)).pack(side="right")

        self.grid = tk.Frame(root, padx=10)
        self.grid.pack()

        legend = tk.Frame(root, padx=10, pady=6)
        legend.pack(fill="x")
        for status in (OFFICE, HOME, ABSENT):
            tk.Label(legend, text=self.LABELS[status], bg=self.COLORS[status],
                     padx=6, relief="groove").pack(side="left", padx=3)
        tk.Label(legend, text="(Klick wechselt Status)", fg="grey").pack(side="left", padx=6)

        self.stats = tk.Label(root, justify="left", font=("Helvetica", 11), padx=10, pady=10)
        self.stats.pack(fill="x")

        self.render()

    def shift_month(self, delta):
        index = self.year * 12 + self.month - 1 + delta
        self.year, self.month = divmod(index, 12)
        self.month += 1
        self.render()

    def toggle(self, day):
        key = day.isoformat()
        new = NEXT_STATUS[self.data.get(key, OFFICE)]
        if new == OFFICE:
            self.data.pop(key, None)
        else:
            self.data[key] = new
        save_data(self.data)
        self.render()

    def render(self):
        tk = self.tk
        self.title.config(text=f"{MONTHS[self.month - 1]} {self.year}")
        for widget in self.grid.winfo_children():
            widget.destroy()

        for col, name in enumerate(["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]):
            tk.Label(self.grid, text=name, width=5, font=("Helvetica", 10, "bold")).grid(row=0, column=col)

        for row, week in enumerate(calendar.Calendar().monthdatescalendar(self.year, self.month), start=1):
            for col, day in enumerate(week):
                if day.month != self.month:
                    continue
                if col >= 5:
                    tk.Label(self.grid, text=day.day, width=5, height=2, fg="grey").grid(row=row, column=col, padx=1, pady=1)
                    continue
                status = self.data.get(day.isoformat(), OFFICE)
                tk.Button(self.grid, text=f"{day.day}\n{HOURS_PER_WEEKDAY[col]:g} h", width=5, height=2,
                          bg=self.COLORS[status], activebackground=self.COLORS[status],
                          command=lambda d=day: self.toggle(d)).grid(row=row, column=col, padx=1, pady=1)

        s = month_stats(self.year, self.month, self.data)
        over = s["percent"] > LIMIT_PERCENT
        budget = (f"Noch {s['remaining']:g} h Homeoffice möglich" if s["remaining"] >= 0
                  else f"Limit um {-s['remaining']:g} h überschritten!")
        self.stats.config(
            text=(f"Soll-Arbeitszeit:  {s['total']:g} h\n"
                  f"Homeoffice:        {s['home']:g} h\n"
                  f"Quote:             {s['percent']:.1f} %  (max. {LIMIT_PERCENT:g} %)\n"
                  f"{budget}"),
            fg="#c00000" if over else "#006400",
        )


def main():
    import tkinter as tk

    root = tk.Tk()
    TrackerApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
