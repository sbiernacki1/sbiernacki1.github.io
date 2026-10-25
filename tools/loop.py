# -*- coding: utf-8 -*-
"""Makes a moving work's loop for the walls: a light, silent copy of its own frames.

    python3 tools/loop.py SOURCE OUT [--crf N]

SOURCE is the work as minted, or a video of it (GIF, MP4, WebM). OUT is where the files go and how they
start, for example assets/works/deathbed/deathbed. It writes three files named for their width:
OUT-640.mp4, OUT-640.webm and OUT-640-poster.jpg, the poster being the first frame, which the wall
shows as the still. 640 pixels wide, or the work's own width if it is narrower, never cropped; the
source's own frames and timing; no sound.

These are the settings of the newest loops on the site, UNBECOMING's 26: H.264 at CRF 23 tuned for
grain, VP9 at CRF 28, the poster a JPEG at quality 88. Older loops used a CRF picked for each work, from
18 (0x01) to 30 (Ephemeron). --crf sets the H.264 one, when a loop comes out too heavy or too soft.

It prints the entry to put in the page's series-data, or the front page's wall-data, as the loop.
Needs ffmpeg with libx264 and libvpx-vp9, and Python 3 with Pillow."""
import io
import json
import os
import subprocess
import sys

from PIL import Image

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def size(src):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", src],
                         capture_output=True, text=True, check=True).stdout
    w, h = (int(x) for x in out.strip().split(",")[:2])
    return w, h


def main(args):
    crf = "23"
    if "--crf" in args:
        i = args.index("--crf")
        crf = args[i + 1]
        args = args[:i] + args[i + 2:]
    if len(args) != 2:
        print(__doc__)
        return 2
    src, out = args
    sw, sh = size(src)
    w = min(640, sw) // 2 * 2
    h = round(sh * w / sw / 2) * 2
    stem = f"{out}-{w}"
    scale = f"scale={w}:{h}:flags=lanczos"
    common = ["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", scale + ",format=yuv420p", "-fps_mode", "passthrough", "-an", "-map_metadata", "-1"]
    subprocess.run(common + ["-c:v", "libx264", "-preset", "slow", "-crf", crf, "-tune", "grain", "-movflags", "+faststart", stem + ".mp4"], check=True)
    subprocess.run(common + ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "28", "-row-mt", "1", "-deadline", "good", "-cpu-used", "1", stem + ".webm"], check=True)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-vf", scale, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
                         capture_output=True, check=True).stdout
    Image.open(io.BytesIO(raw)).convert("RGB").save(stem + "-poster.jpg", "JPEG", quality=88, optimize=True, progressive=True)
    rel = lambda p: os.path.relpath(os.path.abspath(p), SITE)
    for ext in (".mp4", ".webm", "-poster.jpg"):
        print(f"{rel(stem + ext)}  {os.path.getsize(stem + ext) / 1e3:,.0f} KB")
    print(json.dumps({"mp4": rel(stem + ".mp4"), "webm": rel(stem + ".webm"), "poster": rel(stem + "-poster.jpg"), "w": w, "h": h}))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
