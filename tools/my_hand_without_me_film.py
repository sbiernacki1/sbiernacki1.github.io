# -*- coding: utf-8 -*-
"""Draws the film on My Hand Without Me's page, from tools/my_hand_without_me_film.html.

    python3 tools/my_hand_without_me_film.py            draw it
    python3 tools/my_hand_without_me_film.py --seed N   draw it with other drawings of the letters

A ruled page with one sentence written on every line: page A at rest, cleared, page B written, rested
and cleared, then page A written again, so the film loops without a seam. Each frame is drawn in Chromium
at twice the size and brought down to 1080 x 1080, 30 frames a second, so the handwriting stays crisp.

It writes, in assets/works/my-hand-without-me/:
  my-hand-without-me-1080.mp4 and .webm   the film in the frame on the work's page
  my-hand-without-me-poster.jpg           its first frame, shown before it plays
  my-hand-without-me-640.mp4, .webm, and -640-poster.jpg, the light loop for the walls, made by tools/loop.py

Needs Python 3 with Pillow and Playwright, Playwright's Chromium, and ffmpeg."""
import functools
import io
import os
import subprocess
import sys
import tempfile
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from PIL import Image
from playwright.sync_api import sync_playwright

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SITE, "assets", "works", "my-hand-without-me")
FPS = 30


class Quiet(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".woff2": "font/woff2", ".js": "text/javascript"}

    def log_message(self, *a):
        pass


def frames(master, seed=None):
    """every frame, in order, into a lossless film at master"""
    srv = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=SITE))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "png", "-i", "-",
                            "-vf", "scale=1080:1080:flags=lanczos", "-c:v", "libx264rgb", "-crf", "0", "-preset", "veryfast", master],
                           stdin=subprocess.PIPE)
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            pg = b.new_context(viewport={"width": 1080, "height": 1080}, device_scale_factor=2).new_page()
            errors = []
            pg.on("pageerror", lambda e: errors.append(str(e)))
            pg.goto(f"http://127.0.0.1:{srv.server_address[1]}/tools/my_hand_without_me_film.html" + (f"?seed={seed}" if seed else ""))
            pg.wait_for_function("() => window.READY === true", timeout=30000)
            info = pg.evaluate("window.INFO")
            n = round(info["length"] * FPS)
            for i in range(n):
                pg.evaluate(f"window.frame({i / FPS})")
                enc.stdin.write(pg.screenshot(type="png"))
                if i % 150 == 0:
                    print(f"  frame {i} of {n}", flush=True)
            b.close()
            if errors:
                raise SystemExit("The page had errors: " + "; ".join(errors))
    finally:
        srv.shutdown()
        enc.stdin.close()
        enc.wait()
    return info, n


def main(args):
    seed = None
    if args[:1] == ["--seed"] and len(args) == 2 and args[1].isdigit():
        seed = int(args[1])
    elif args:
        print(__doc__)
        return 2
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        master = os.path.join(tmp, "my-hand-without-me-master.mkv")
        info, n = frames(master, seed)
        print(f"{n} frames, {info['length']:.1f} seconds")
        stem = os.path.join(OUT, "my-hand-without-me-1080")
        common = ["ffmpeg", "-v", "error", "-y", "-i", master, "-an", "-map_metadata", "-1", "-pix_fmt", "yuv420p"]
        subprocess.run(common + ["-c:v", "libx264", "-preset", "slow", "-crf", "18", "-tune", "animation", "-movflags", "+faststart",
                                 stem + ".mp4"], check=True)
        subprocess.run(common + ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30", "-row-mt", "1", "-deadline", "good", "-cpu-used", "1",
                                 stem + ".webm"], check=True)
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", master, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
                             capture_output=True, check=True).stdout
        Image.open(io.BytesIO(raw)).convert("RGB").save(os.path.join(OUT, "my-hand-without-me-poster.jpg"), "JPEG", quality=90,
                                                         optimize=True, progressive=True)
        subprocess.run([sys.executable, os.path.join(SITE, "tools", "loop.py"), master, os.path.join(OUT, "my-hand-without-me")], check=True)
    for f in ("my-hand-without-me-1080.mp4", "my-hand-without-me-1080.webm", "my-hand-without-me-poster.jpg"):
        print(f"assets/works/my-hand-without-me/{f}  {os.path.getsize(os.path.join(OUT, f)) / 1e3:,.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
