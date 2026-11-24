"""Download CIM Top 20 Noord and compare the two 19:00 news programmes."""
import argparse
import csv
import re
from datetime import date, datetime, time, timedelta
from html.parser import HTMLParser
from pathlib import Path
from statistics import mean
from time import sleep
from urllib.parse import urlencode
from urllib.request import Request, urlopen

SOURCE = "https://www.cim.be/nl/televisie"
ENDPOINT = "https://www.cim.be/nl/tv-media-response"
FIELDS = ("rang", "programma", "zender", "uitzenddatum", "start", "duur", "kijkers", "meting")
PROGRAMMES = {"VRT 1": "HET 7 UUR-JOURNAAL", "VTM": "NIEUWS 19U VTM"}


class DayTable(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_table = False
        self.row = None
        self.cell = None
        self.rows = []
        self.heading = []
        self.in_heading = False

    def handle_starttag(self, tag, attrs):
        if tag == "table" and dict(attrs).get("id") in {
            "my-custom-table", "my-custom-table-2",
        }:
            self.in_table = True
        if self.in_table and tag == "thead":
            self.in_heading = True
        if self.in_table and tag == "tr":
            self.row = []
        if self.in_table and tag == "td" and self.row is not None:
            self.cell = []

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)
        if self.in_heading:
            self.heading.append(data)

    def handle_endtag(self, tag):
        if tag == "td" and self.cell is not None:
            self.row.append(" ".join("".join(self.cell).split()))
            self.cell = None
        if tag == "tr" and self.row is not None:
            if self.row:
                self.rows.append(self.row)
            self.row = None
        if tag == "thead":
            self.in_heading = False
        if tag == "table":
            self.in_table = False


def fetch_day(day):
    body = urlencode(dict(val="daily", date=day.isoformat(), region="north",
                         pgid=1, year=2025, period="yearly_top_100", week="")).encode()
    request = Request(ENDPOINT, data=body, headers={
        "Referer": SOURCE, "X-Requested-With": "XMLHttpRequest",
    })
    for attempt in range(3):
        try:
            with urlopen(request, timeout=25) as response:
                html = response.read().decode("utf-8")
            break
        except OSError:
            if attempt == 2:
                raise
            sleep(attempt + 1)

    table = DayTable()
    table.feed(html)
    if len(table.rows) != 20:
        raise ValueError(f"{day}: {len(table.rows)} rijen, verwacht 20")
    measurement = re.search(r"Live\+(?:VOSDAL|[0-9]+)", "".join(table.heading))
    if not measurement:
        raise ValueError(f"{day}: meetperiode ontbreekt")
    rows = []
    for rank, programme, channel, airdate, start, duration, viewers in table.rows:
        if datetime.strptime(airdate, "%d/%m/%Y").date() != day:
            raise ValueError(f"{day}: onverwachte uitzenddatum {airdate}")
        if not re.fullmatch(r"[0-9]+|[0-9]{1,3}(?:\.[0-9]{3})+", viewers):
            raise ValueError(f"{day}: ongeldig kijkcijfer {viewers!r}")
        rows.append((int(rank), programme, channel, day.isoformat(), start,
                     duration, int(viewers.replace(".", "")), measurement.group()))
    if {row[0] for row in rows} != set(range(1, 21)):
        raise ValueError(f"{day}: ongeldige rangnummers")
    return rows


def write_csv(path, header, rows):
    with path.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow(header)
        writer.writerows(rows)


def news_counts(rows):
    counts = []
    for channel, programme in PROGRAMMES.items():
        matches = [
            viewers for _, title, station, _, start, _, viewers, _ in rows
            if station == channel and title == programme
            and time(18, 45) <= time.fromisoformat(start) <= time(19, 15)
        ]
        if len(matches) > 1:
            raise ValueError(f"Meerdere 19-uurnieuwsuitzendingen op {channel}")
        counts.append(matches[0] if matches else None)
    return counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("start", type=date.fromisoformat, help="Eerste datum (JJJJ-MM-DD)")
    parser.add_argument("--end", type=date.fromisoformat, help="Laatste datum, inclusief")
    parser.add_argument("--output", type=Path, default=Path("cim-kijkcijfers"))
    args = parser.parse_args()
    end = args.end or args.start
    if end < args.start:
        parser.error("--end ligt vóór de startdatum")
    comparison = []
    for offset in range((end - args.start).days + 1):
        day = args.start + timedelta(days=offset)
        rows = fetch_day(day)
        vrt, vtm = news_counts(rows)
        directory = args.output / str(day.year)
        directory.mkdir(parents=True, exist_ok=True)
        write_csv(directory / f"CIM_{day:%d-%m}.csv", FIELDS, rows)
        comparison.append((day.isoformat(), vrt, vtm, rows[0][-1]))
        print(f"{day} | VRT 1: {vrt} | VTM: {vtm}", flush=True)
        if day < end:
            sleep(0.35)

    if args.end is not None:
        write_csv(args.output / f"journaals_{args.start}_{end}.csv",
                  ("uitzenddatum", "VRT 1", "VTM", "meting"), comparison)
    paired = [(vrt, vtm) for _, vrt, vtm, _ in comparison if vrt is not None and vtm is not None]
    if paired:
        print(f"{len(paired)}/{len(comparison)} vergelijkbare dagen | "
              f"VRT 1 wint {sum(vrt > vtm for vrt, vtm in paired)} | "
              f"VTM wint {sum(vtm > vrt for vrt, vtm in paired)} | "
              f"gemiddelden: {mean(vrt for vrt, _ in paired):.0f} / "
              f"{mean(vtm for _, vtm in paired):.0f}")


if __name__ == "__main__":
    main()
