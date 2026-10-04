#!/usr/bin/env python3
"""Deploy a local build directory (dist/) into a subfolder of a webspace via FTPS.

Die Zugangsdaten kommen aus der Umgebung, es stehen KEINE Vorgaben im Skript:

    HOST=ftp.example.org USER=user FTP_PASS=... python3 scripts/deploy_dist_ftps.py \
        --local dist --remote web/subfolder --verify-base https://example.org/subfolder/

Drei Dinge, die dabei zuverlaessig schiefgehen:

1. Zielordner muessen existieren, sonst scheitert STOR. Das Skript legt jedes
   Pfadsegment an - mit ABSOLUTEN Pfaden, weil das cwd einer FTP-Sitzung zustands-
   behaftet ist und relative mkdir-Aufrufe sonst verschachtelten Unsinn erzeugen.
2. Vite hasht nur geaenderte Chunks neu; unveraenderte Dateien behalten ihren Hash.
   Beim Aufraeumen wird deshalb gegen die KOMPLETTE lokale Dateiliste verglichen
   (nie gegen "alles ausser der neuen Datei" - das loescht die noch genutzte CSS).
3. Verifikation: die ausgelieferte index.html muss jede relative Referenz ueber
   HTTP aufloesen, und darf nicht doppelt kodiertes UTF-8 enthalten.
"""
from __future__ import annotations

import argparse
import ftplib
import os
import re
import sys
import urllib.request

UA = {"User-Agent": "deploy-verify/1.0", "Cache-Control": "no-cache"}


def connect(host: str, user: str, password: str) -> ftplib.FTP_TLS:
    ftp = ftplib.FTP_TLS(host, user, password, timeout=60)
    ftp.prot_p()
    return ftp


def ensure_dir(ftp: ftplib.FTP_TLS, remote_dir: str) -> None:
    """Legt jedes fehlende Pfadsegment an - immer ueber ABSOLUTE Pfade."""
    parts = [p for p in remote_dir.strip("/").split("/") if p]
    cur = ""
    for part in parts:
        cur = f"{cur}/{part}" if cur else part
        try:
            ftp.mkd("/" + cur)
        except ftplib.error_perm:
            pass  # existiert bereits
    ftp.cwd("/" + cur)


def upload_tree(ftp: ftplib.FTP_TLS, local_root: str, remote_root: str) -> list[str]:
    hoch = []
    for root, _dirs, files in os.walk(local_root):
        for name in files:
            lokal = os.path.join(root, name)
            rel = os.path.relpath(lokal, local_root).replace(os.sep, "/")
            ziel = f"{remote_root}/{rel}"
            ensure_dir(ftp, os.path.dirname(ziel))
            with open(lokal, "rb") as fh:
                ftp.storbinary("STOR " + os.path.basename(ziel), fh)
            hoch.append(rel)
            print(f"  up {rel} ({os.path.getsize(lokal)} Bytes)")
    return hoch


def raeume_veraltete_assets(ftp: ftplib.FTP_TLS, remote_root: str, local_root: str) -> list[str]:
    lokal_assets = os.path.join(local_root, "assets")
    if not os.path.isdir(lokal_assets):
        return []
    behalten = set(os.listdir(lokal_assets))
    ensure_dir(ftp, f"{remote_root}/assets")
    vorhanden = {n for n in ftp.nlst() if n not in (".", "..")}
    weg = []
    for name in sorted(vorhanden - behalten):
        ftp.delete(name)
        weg.append(name)
        print(f"  rm veraltet {name}")
    return weg


def hole(url: str) -> bytes:
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()


def verify(base_url: str) -> int:
    base = base_url.rstrip("/") + "/"
    roh = hole(base)
    probleme = 0
    doppelt = roh.count(b"\xc3\x83\xc2")
    ersatz = roh.count(b"\xef\xbf\xbd")
    print(f"  index.html: {len(roh)} Bytes | doppelt kodiert: {doppelt} | U+FFFD: {ersatz}")
    if doppelt or ersatz:
        probleme += 1
        print("  !! Kodierung kaputt")
    html = roh.decode("utf-8", "replace")
    for ref in re.findall(r'(?:src|href)="([^"]+)"', html):
        if ref.startswith(("http://", "https://", "data:", "#", "mailto:")):
            continue
        url = base + ref.lstrip("./")
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                status = r.status
        except Exception as exc:  # noqa: BLE001
            status = f"FEHLER {exc}"
            probleme += 1
        print(f"  {ref:45s} {status}")
    return probleme


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--local", default="dist")
    ap.add_argument("--remote", required=True, help="Zielordner, z. B. web/app")
    ap.add_argument("--host", default=os.environ.get("HOST"))
    ap.add_argument("--user", default=os.environ.get("USER"))
    ap.add_argument("--verify-base", default=None)
    ap.add_argument("--no-clean", action="store_true")
    args = ap.parse_args()

    passwort = os.environ.get("FTP_PASS")
    if not (args.host and args.user and passwort):
        print("HOST, USER und FTP_PASS noetig (Umgebung oder --host/--user)", file=sys.stderr)
        return 2
    if not os.path.isdir(args.local):
        print(f"Ordner fehlt: {args.local}", file=sys.stderr)
        return 1

    ftp = connect(args.host, args.user, passwort)
    try:
        print("Upload:")
        hoch = upload_tree(ftp, args.local, args.remote)
        if not args.no_clean:
            weg = raeume_veraltete_assets(ftp, args.remote, args.local)
            print(f"  {len(weg)} veraltete Datei(en) entfernt")
        print(f"  {len(hoch)} Datei(en) hochgeladen")
    finally:
        try:
            ftp.quit()
        except Exception:  # noqa: BLE001
            ftp.close()

    if args.verify_base:
        print("Verifikation:")
        probleme = verify(args.verify_base)
        print("ERGEBNIS:", "OK" if probleme == 0 else f"{probleme} Problem(e)")
        return 1 if probleme else 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
