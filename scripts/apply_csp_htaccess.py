#!/usr/bin/env python3
"""Schreibt die Content-Security-Policy + Basis-Header in dist/ und als Meta-Tag.

Nach JEDEM Build erneut ausfuehren (der Build leert dist/).

    python3 scripts/apply_csp_htaccess.py --dist dist --index index.html
    python3 scripts/apply_csp_htaccess.py --dist dist --index index.html --csp "default-src 'self'; ..."

Ohne --csp gilt die Standard-Policy fuer diese App: eigene Dateien, Google Fonts,
Blob-/Data-URLs fuer die im Browser erzeugten Exporte (PNG/GIF) und Bilder.
"""
import argparse
import os
import re
import sys

DEFAULT_CSP = (
    "default-src 'self' blob:; "
    "img-src 'self' data: blob:; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' data: https://fonts.gstatic.com; "
    "script-src 'self' 'unsafe-inline'; "
    "connect-src 'self'; "
    "media-src 'self' blob: data:; "
    "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"
)

HTACCESS = """# Automatisch erzeugt von scripts/apply_csp_htaccess.py - nicht von Hand editieren.
# Nach jedem Build erneut ausfuehren (der Build leert dist/).
Options -Indexes
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
  Header always set Content-Security-Policy "{csp}"
  Header always set Cache-Control "no-cache"
</IfModule>
<IfModule mod_mime.c>
  AddCharset UTF-8 .html .css .js .json .webmanifest
</IfModule>
"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dist", default="dist", help="Build-Ausgabeordner")
    ap.add_argument("--index", default=None, help="Quell-index.html fuer das Meta-Tag")
    ap.add_argument("--csp", default=DEFAULT_CSP, help="CSP-String")
    args = ap.parse_args()

    if not os.path.isdir(args.dist):
        print(f"Ordner fehlt: {args.dist}", file=sys.stderr)
        return 1

    inhalt = HTACCESS.format(csp=args.csp)
    with open(os.path.join(args.dist, ".htaccess"), "w", encoding="utf-8") as f:
        f.write(inhalt)
    print(f"  geschrieben: {args.dist}/.htaccess ({len(inhalt)} Bytes)")

    assets = os.path.join(args.dist, "assets")
    if os.path.isdir(assets):
        klein = "# Assets: Header und Charset erben vom Ordner oben\n"
        with open(os.path.join(assets, ".htaccess"), "w", encoding="utf-8") as f:
            f.write(klein)
        print(f"  geschrieben: {args.dist}/assets/.htaccess")

    if args.index and os.path.isfile(args.index):
        # frame-ancestors ist per Meta-Tag wirkungslos -> aus der Meta-Variante entfernen
        meta_csp = args.csp.replace("; frame-ancestors 'self'", "")
        html = open(args.index, encoding="utf-8").read()
        tag = f'<meta http-equiv="Content-Security-Policy" content="{meta_csp}">'
        html = re.sub(r'\s*<meta http-equiv="Content-Security-Policy"[^>]*>', "", html)
        html = html.replace("</head>", "    " + tag + "\n  </head>", 1)
        open(args.index, "w", encoding="utf-8").write(html)
        print(f"  Meta-CSP in {args.index} aktualisiert")

    print("\nGegenpruefen: curl -sI <url> | grep -i content-security-policy")
    return 0


if __name__ == "__main__":
    sys.exit(main())
