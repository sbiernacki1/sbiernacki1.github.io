# -*- coding: utf-8 -*-
"""Draws the site's own share card, The day, to assets/og.png (1200 x 630).

    python3 tools/site_card.py            draw it
    python3 tools/site_card.py --check    draw it without saving and compare it with the one on the site
    python3 tools/site_card.py --seed N   draw a trial with other drawings of the letters, outside the site

The card is the page tools/site_card.html, drawn in Chromium at twice the size and brought down to
1200 x 630, so the edges and the handwriting stay crisp. When the card changes, raise the number in
og.png?v= on every page that asks for it (the README's Share cards says which).

Needs Python 3 with Pillow and Playwright, and Playwright's Chromium."""
import functools
import io
import os
import sys
import tempfile
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Quiet(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".woff2": "font/woff2", ".js": "text/javascript"}

    def log_message(self, *a):
        pass


def draw(seed=None):
    srv = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=SITE))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            pg = b.new_context(viewport={"width": 1200, "height": 630}, device_scale_factor=2).new_page()
            errors = []
            pg.on("pageerror", lambda e: errors.append(str(e)))
            pg.goto(f"http://127.0.0.1:{srv.server_address[1]}/tools/site_card.html" + (f"?seed={seed}" if seed else ""), wait_until="load")
            pg.wait_for_function("() => window.READY === true", timeout=20000)
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(250)
            big = pg.screenshot(clip={"x": 0, "y": 0, "width": 1200, "height": 630})
            b.close()
            if errors:
                raise SystemExit("The page had errors: " + "; ".join(errors))
    finally:
        srv.shutdown()
    im = Image.open(io.BytesIO(big)).convert("RGB").resize((1200, 630), Image.LANCZOS)
    out = io.BytesIO()
    im.save(out, "PNG", optimize=True)
    return out.getvalue()


def main(args):
    path = os.path.join(SITE, "assets", "og.png")
    if args == ["--check"]:
        new, old = draw(), open(path, "rb").read()
        if new == old:
            print("The card comes out the same as the site's.")
            return 0
        diff = ImageChops.difference(Image.open(io.BytesIO(new)).convert("RGB"), Image.open(path).convert("RGB"))
        most = max(c[1] for c in diff.getextrema())
        print("The card comes out the same as the site's." if not most else f"The card differs from the site's, by up to {most} of 255.")
        return 1 if most else 0
    if len(args) == 2 and args[0] == "--seed" and args[1].isdigit():
        out = os.path.join(tempfile.gettempdir(), f"site-card-{args[1]}.png")
        open(out, "wb").write(draw(int(args[1])))
        print(out)
        return 0
    if args:
        print(__doc__)
        return 2
    open(path, "wb").write(draw())
    print(os.path.relpath(path, SITE))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
