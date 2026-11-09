#!/usr/bin/env python3
"""Lengkapi inventori PKPRB dengan Arsitektur dan PWK dari direktori publik BAN-PT.

Sumber: https://www.banpt.or.id/direktori/prodi/pencarian_prodi.php
Data JSON: https://www.banpt.or.id/direktori/model/dir_prodi/get_hasil_pencariannew.php

Direktori BAN-PT tidak memuat nama provinsi. Kolom Wilayah memakai kode yang
ditampilkan BAN-PT (01–17 atau PTN/PTAN/PTAS/PTKL). Provinsi dibiarkan kosong.
Tidak mengubah situs PKPRB.
"""

from __future__ import annotations

import argparse
import json
import re
import urllib.request
from pathlib import Path

from openpyxl import Workbook, load_workbook

from scrape_sakti import COLUMNS as SAKTI_COLUMNS
from scrape_sakti import akhir_key, write_xlsx

JSON_URL = "https://www.banpt.or.id/direktori/model/dir_prodi/get_hasil_pencariannew.php"
PAGE_URL = "https://www.banpt.or.id/direktori/prodi/pencarian_prodi.php"
INVENTORI = Path("Inventori_Prodi_PKPRB_Lengkap.xlsx")

COLUMNS = [
    "Prodi",
    "Institusi",
    "Jenjang",
    "Peringkat",
    "Berlaku_Mulai",
    "Berakhir_Pada",
    "Disiplin_PKPRB",
    "Sumber",
    "Provinsi",
    "Wilayah",
    "No_SK",
    "Tahun_SK",
    "Status_Kedaluwarsa",
]

JENJANG = {
    "s1": "S1",
    "sarjana": "S1",
    "s2": "S2",
    "magister": "S2",
    "s3": "S3",
    "doktor": "S3",
    "d3": "D3",
    "d-iii": "D3",
    "d-3": "D3",
    "diploma tiga": "D3",
    "d4": "D4",
    "d-iv": "D4",
    "d-4": "D4",
    "sarjana terapan": "D4",
    "diploma empat": "D4",
    "profesi": "Profesi",
}

EXCLUDE = re.compile(
    r"perkapalan|infrastruktur sipil dan perancangan arsitektur",
    re.I,
)
PWK = re.compile(r"planologi|\bpwk\b|perencanaan wilayah", re.I)
ARSITEKTUR = re.compile(r"arsitektur", re.I)


def disiplin(prodi: str) -> str | None:
    if EXCLUDE.search(prodi or ""):
        return None
    if PWK.search(prodi or ""):
        return "PWK"
    if ARSITEKTUR.search(prodi or ""):
        return "Arsitektur"
    return None


def jenjang_kunci(value: str) -> str:
    text = (value or "").strip().casefold()
    return JENJANG.get(text, text)


def fetch() -> list[list]:
    request = urllib.request.Request(
        JSON_URL,
        headers={
            "User-Agent": "PKPRB-research/1.0 (inventori prodi; direktori publik BAN-PT)",
            "Referer": PAGE_URL,
        },
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        payload = json.load(response)
    return payload["data"]


def banpt_rows(raw: list[list]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for item in raw:
        if len(item) < 9:
            continue
        institusi, prodi, strata, wilayah, no_sk, tahun, peringkat, kedaluwarsa, status = item[:9]
        kode = disiplin(prodi or "")
        if not kode or not institusi:
            continue
        rows.append(
            {
                "Prodi": (prodi or "").strip(),
                "Institusi": (institusi or "").strip(),
                "Jenjang": (strata or "").strip(),
                "Peringkat": "" if peringkat is None else str(peringkat),
                "Berlaku_Mulai": "",
                "Berakhir_Pada": "" if not kedaluwarsa or kedaluwarsa == "-" else str(kedaluwarsa),
                "Disiplin_PKPRB": kode,
                "Sumber": "BAN-PT",
                "Provinsi": "",
                "Wilayah": "" if wilayah is None else str(wilayah),
                "No_SK": "" if no_sk is None else str(no_sk),
                "Tahun_SK": "" if tahun is None else str(tahun),
                "Status_Kedaluwarsa": "" if status is None else str(status),
            }
        )
    return rows


def load_existing(path: Path) -> list[dict[str, str]]:
    book = load_workbook(path)
    sheet = book.active
    header = [cell.value for cell in sheet[1]]
    index = {name: i for i, name in enumerate(header)}
    rows: list[dict[str, str]] = []
    for values in sheet.iter_rows(min_row=2, values_only=True):
        if not values or not values[0]:
            continue
        row = {column: "" for column in COLUMNS}
        for name, position in index.items():
            if name in row and position < len(values) and values[position] is not None:
                row[name] = str(values[position])
        if not row["Sumber"]:
            row["Sumber"] = "SAKTI"
        rows.append(row)
    return rows


def kunci(row: dict[str, str]) -> tuple[str, str, str]:
    return (
        row["Institusi"].casefold().strip(),
        row["Prodi"].casefold().strip(),
        jenjang_kunci(row["Jenjang"]),
    )


def write(path: Path, rows: list[dict[str, str]]) -> None:
    book = Workbook()
    sheet = book.active
    sheet.title = "Prodi"
    sheet.append(COLUMNS)
    for row in rows:
        sheet.append([row.get(column, "") for column in COLUMNS])
    note = book.create_sheet("Keterangan")
    note.append(["Butir", "Isi"])
    note.append(["Sumber BAN-PT", PAGE_URL])
    note.append(["Berkas data", JSON_URL])
    note.append(
        [
            "Provinsi",
            "Direktori BAN-PT tidak memuat provinsi. Kolom Wilayah adalah kode yang ditampilkan BAN-PT (01-17, PTN, PTAN, PTAS, PTKL).",
        ]
    )
    note.append(
        [
            "Disaring",
            "Arsitektur dan variannya, serta Perencanaan Wilayah dan Kota / Planologi / PWK. "
            "Dikecualikan: Teknologi Rekayasa Arsitektur Perkapalan dan Teknik Infrastruktur Sipil Dan Perancangan Arsitektur.",
        ]
    )
    note.append(
        [
            "Sumber SAKTI",
            "https://sakti.lamteknik.or.id/database-akreditasi halaman 1 sampai 277. "
            "Jika prodi yang sama ada di SAKTI dan BAN-PT, baris SAKTI yang dipertahankan.",
        ]
    )
    book.save(path)


def gabungkan_sakti(path: Path) -> None:
    """Tambahkan sisa halaman SAKTI. Baris SAKTI mengalahkan BAN-PT pada kunci yang sama."""
    existing = load_existing(INVENTORI)
    tambahan = load_existing(path)
    for row in tambahan:
        row["Sumber"] = "SAKTI"
    sakti = [row for row in existing if row["Sumber"] == "SAKTI"] + tambahan
    banpt = [row for row in existing if row["Sumber"] == "BAN-PT"]
    terbaik: dict[tuple[str, str, str], dict[str, str]] = {}
    for row in sakti:
        key = kunci(row)
        current = terbaik.get(key)
        if current is None or akhir_key(row["Berakhir_Pada"]) > akhir_key(current["Berakhir_Pada"]):
            terbaik[key] = row
    tertahan: list[dict[str, str]] = []
    diganti = 0
    for row in banpt:
        if kunci(row) in terbaik:
            diganti += 1
            continue
        tertahan.append(row)
    combined = list(terbaik.values()) + tertahan
    kosong = [row for row in combined if not row["Disiplin_PKPRB"]]
    if kosong:
        raise SystemExit(f"{len(kosong)} baris tanpa Disiplin_PKPRB")
    combined.sort(key=lambda row: (row["Disiplin_PKPRB"], row["Institusi"], row["Prodi"], row["Jenjang"]))
    write(INVENTORI, combined)
    sakti_bersih = sorted(terbaik.values(), key=lambda row: (row["Disiplin_PKPRB"], row["Institusi"], row["Prodi"], row["Jenjang"]))
    write_xlsx(Path("Inventori_Prodi_SAKTI.xlsx"), [{column: row[column] for column in SAKTI_COLUMNS} for row in sakti_bersih])
    print(f"sakti {len(terbaik)} banpt {len(tertahan)} diganti karena sama dengan SAKTI {diganti}")
    print(f"total {len(combined)} -> {INVENTORI}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--gabung-sakti", type=Path, default=None)
    args, _unknown = parser.parse_known_args()
    if args.gabung_sakti:
        gabungkan_sakti(args.gabung_sakti)
        return
    existing = load_existing(INVENTORI)
    known = {kunci(row) for row in existing}
    added = {"Arsitektur": 0, "PWK": 0}
    fresh: list[dict[str, str]] = []
    seen: set[tuple[str, str, str]] = set()
    for row in banpt_rows(fetch()):
        key = kunci(row)
        if key in known or key in seen:
            continue
        seen.add(key)
        fresh.append(row)
        added[row["Disiplin_PKPRB"]] += 1
    combined = existing + sorted(
        fresh, key=lambda row: (row["Disiplin_PKPRB"], row["Institusi"], row["Prodi"], row["Jenjang"])
    )
    write(INVENTORI, combined)
    print(f"baris lama {len(existing)}")
    print(f"baru Arsitektur {added['Arsitektur']}")
    print(f"baru PWK {added['PWK']}")
    print(f"total {len(combined)} -> {INVENTORI}")


if __name__ == "__main__":
    main()
