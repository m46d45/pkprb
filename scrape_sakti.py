#!/usr/bin/env python3
"""Ambil database akreditasi publik SAKTI LAM Teknik dan saring prodi relevan PKPRB.

Sumber: https://sakti.lamteknik.or.id/database-akreditasi
Tidak mengubah situs PKPRB. Hasilnya berkas Excel.
"""

from __future__ import annotations

import argparse
import re
import time
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

from openpyxl import Workbook

BASE = "https://sakti.lamteknik.or.id/database-akreditasi"
OUT_SAKTI = Path("Inventori_Prodi_SAKTI.xlsx")
OUT_LENGKAP = Path("Inventori_Prodi_PKPRB_Lengkap.xlsx")
COLUMNS = [
    "Prodi",
    "Institusi",
    "Jenjang",
    "Peringkat",
    "Berlaku_Mulai",
    "Berakhir_Pada",
    "Disiplin_PKPRB",
]

# Urutan penting: yang lebih khusus dicek lebih dulu.
# "Teknik Sipil dan Lingkungan" masuk Sipil, bukan Lingkungan.
RULES: list[tuple[str, re.Pattern[str]]] = [
    ("Kebencanaan", re.compile(r"bencana", re.I)),
    ("PWK", re.compile(r"planologi|\bpwk\b|perencanaan wilayah", re.I)),
    ("Geologi", re.compile(r"geologi", re.I)),
    ("Kelautan", re.compile(r"kelautan|oseanografi", re.I)),
    ("Arsitektur", re.compile(r"arsitektur", re.I)),
    ("Sipil", re.compile(r"\bsipil\b", re.I)),
    (
        "Multidisiplin",
        re.compile(r"multidisiplin|ilmu lingkungan|studi pembangunan|pembangunan wilayah", re.I),
    ),
    ("Lingkungan", re.compile(r"lingkungan", re.I)),
]


class TableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._in_td = False
        self._cell: list[str] = []
        self._row: list[str] = []
        self.rows: list[list[str]] = []

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self._row = []
        elif tag == "td":
            self._in_td = True
            self._cell = []

    def handle_endtag(self, tag):
        if tag == "td" and self._in_td:
            text = re.sub(r"\s+", " ", "".join(self._cell)).strip()
            self._row.append(text)
            self._in_td = False
        elif tag == "tr" and self._row:
            self.rows.append(self._row)

    def handle_data(self, data):
        if self._in_td:
            self._cell.append(data)


def disiplin_pkprb(prodi: str) -> str | None:
    for name, pattern in RULES:
        if pattern.search(prodi or ""):
            return name
    return None


def fetch_page(page: int) -> str:
    url = BASE if page <= 1 else f"{BASE}?page={page}"
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "PKPRB-research/1.0 (inventori prodi; kontak penelitian)"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read().decode("utf-8", "replace")


def rows_from_html(html: str) -> list[dict[str, str]]:
    parser = TableParser()
    parser.feed(html)
    found: list[dict[str, str]] = []
    for cells in parser.rows:
        # Sel pertama adalah tombol detil (kosong). Sisanya enam kolom.
        data = [cell for cell in cells if cell] if cells and cells[0] == "" else cells
        if cells and cells[0] == "":
            data = cells[1:]
        else:
            data = cells
        if len(data) < 6:
            continue
        prodi, institusi, jenjang, peringkat, mulai, akhir = data[:6]
        if not prodi or prodi == "Prodi" or not institusi:
            continue
        disiplin = disiplin_pkprb(prodi)
        if not disiplin:
            continue
        found.append(
            {
                "Prodi": prodi,
                "Institusi": institusi,
                "Jenjang": jenjang,
                "Peringkat": peringkat,
                "Berlaku_Mulai": mulai,
                "Berakhir_Pada": akhir,
                "Disiplin_PKPRB": disiplin,
            }
        )
    return found


def scrape(max_pages: int, pause: float = 0.35, start_page: int = 1) -> list[dict[str, str]]:
    collected: list[dict[str, str]] = []
    empty = 0
    for page in range(start_page, max_pages + 1):
        html = fetch_page(page)
        batch = rows_from_html(html)
        collected.extend(batch)
        if not batch and "Tidak ada" in html:
            empty += 1
        else:
            empty = 0
        print(f"halaman {page}/{max_pages}: +{len(batch)} relevan, terkumpul {len(collected)}", flush=True)
        if empty >= 2:
            print("dua halaman kosong berturut-turut, berhenti.")
            break
        time.sleep(pause)
    return collected


def akhir_key(value: str) -> tuple[int, int, int]:
    match = re.match(r"(\d{2})-(\d{2})-(\d{4})", value or "")
    if not match:
        return (0, 0, 0)
    day, month, year = match.groups()
    return (int(year), int(month), int(day))


def dedupe(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    best: dict[tuple[str, str, str], dict[str, str]] = {}
    for row in rows:
        key = (
            row["Institusi"].casefold().strip(),
            row["Prodi"].casefold().strip(),
            row["Jenjang"].casefold().strip(),
        )
        current = best.get(key)
        if current is None or akhir_key(row["Berakhir_Pada"]) > akhir_key(current["Berakhir_Pada"]):
            best[key] = row
    return sorted(best.values(), key=lambda row: (row["Disiplin_PKPRB"], row["Institusi"], row["Prodi"], row["Jenjang"]))


def write_xlsx(path: Path, rows: list[dict[str, str]]) -> None:
    book = Workbook()
    sheet = book.active
    sheet.title = "Prodi"
    sheet.append(COLUMNS)
    for row in rows:
        sheet.append([row[column] for column in COLUMNS])
    book.save(path)


def report(rows: list[dict[str, str]]) -> None:
    counts: dict[str, int] = {}
    for row in rows:
        counts[row["Disiplin_PKPRB"]] = counts.get(row["Disiplin_PKPRB"], 0) + 1
    print(f"total {len(rows)}")
    for name in ["Sipil", "Arsitektur", "PWK", "Geologi", "Lingkungan", "Kelautan", "Kebencanaan", "Multidisiplin"]:
        print(f"  {name}: {counts.get(name, 0)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-pages", type=int, default=50)
    parser.add_argument("--start-page", type=int, default=1)
    parser.add_argument("--output", type=Path, default=None)
    args = parser.parse_args()
    raw = scrape(args.max_pages, start_page=args.start_page)
    clean = dedupe(raw)
    if args.output:
        write_xlsx(args.output, clean)
        print(f"mentah relevan {len(raw)} -> {args.output}")
        print(f"setelah buang duplikat {len(clean)}")
        report(clean)
        return
    write_xlsx(OUT_SAKTI, raw)
    write_xlsx(OUT_LENGKAP, clean)
    print(f"mentah relevan {len(raw)} -> {OUT_SAKTI}")
    print(f"setelah buang duplikat {len(clean)} -> {OUT_LENGKAP}")
    report(clean)


if __name__ == "__main__":
    main()
