# -*- coding: utf-8 -*-
"""Draws the card a work's page shows when it is shared: assets/share/<page>.jpg, 1200 x 630.

    python3 tools/share_card.py PAGE [PAGE ...]   draw these cards
    python3 tools/share_card.py --all             draw every card
    python3 tools/share_card.py --check           draw every card without saving and compare it with
                                                  the one on the site

The name in Fragment Mono at the top left, the footer's bar of the day's light under it, the title in
Stephen Hand at the left, and the whole work in a box at the right inside the site's hairline, never
cropped. The fonts are the site's own, in assets/fonts. The bar's colors are the list at the top of
assets/light.js: if that list changes, change DAY below to match and draw every card again.

A new work: add a line to CARDS with its page, its title, and the still to show (the work itself, or one
clear frame of a moving work), then run this with its page. --check is a quick way to see that a machine
draws the cards the way the site's were drawn: the name is set with Raqm, Pillow's fuller text layout,
and the title without it, and a Pillow without Raqm spaces the name a little differently.

Needs Python 3 with Pillow, and ffmpeg for frames taken from videos."""
import io
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageChops, ImageDraw, ImageFont

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# page: (title as the card shows it, still), the still being a file here, or (video, seconds in)
CARDS = {
    "my-hand-without-me": ("My Hand Without Me", "assets/works/my-hand-without-me/my-hand-without-me-poster.jpg"),  # the film's first frame
    "attestations": ("Attestations", "assets/works/attestations/01-dark-adaptation-1600.jpg"),
    "i-want-to-believe": ("I WANT TO BELIEVE", "assets/works/i-want-to-believe/i-want-to-believe-1100.png"),
    "alien-invasion-of-privacy": ("Alien Invasion of Privacy", "assets/works/alien-invasion-of-privacy/alien-invasion-of-privacy-560.png"),
    "vestige": ("Vestige", "assets/works/vestige/vestige-800.jpg"),
    "the-conceptual-armor-is-bullshit": ("The Conceptual Armor Is Bullshit", "assets/works/the-conceptual-armor-is-bullshit/01-left-1200.jpg"),
    "self-addressed": ("Self-Addressed", "assets/works/self-addressed/self-addressed-800.jpg"),  # 0x01
    "ephemeron": ("Ephemeron", "assets/works/ephemeron/01-ephemeron-1-poster.jpg"),
    # the first frame of the minted GIF of the truth is rarely pure and never simple, saved exactly
    "unbecoming": ("UNBECOMING", "tools/stills/the-truth-is-rarely-pure-and-never-simple-800.png"),
    "panopticism": ("PANOPTICISM", "assets/works/panopticism/panopticism-poster.jpg"),
    "process": ("Process", ("assets/works/process/process-1440.mp4", 30)),  # a full paragraph of requests
    "m-h-r": ("M-H_R", "assets/works/m-h-r/m-h-r-1600.jpg"),
    "insides-out": ("Insides Out", "assets/works/insides-out/insides-out-1600.jpg"),
    "untitled-for-jo": ("Untitled (For Jo)", "assets/works/untitled-for-jo/untitled-for-jo-poster-800.png"),
    "deathbed": ("Deathbed", ("assets/works/deathbed/01-deathbed-1080.mp4", 5.5)),  # the picture in focus
    "weathering-the": ("Weathering the", "assets/works/weathering-the/01-weathering-the-1600.jpg"),  # in quotes on its page, not here
    "red-herr1ng": ("RED HERR1NG", "assets/works/red-herr1ng/01-red-herr1ng-1600.jpg"),
    "syntax-synapse": ("Syntax/Synapse", "assets/works/syntax-synapse/01-the-left-hand-doesnt-know-what-the-right-hand-is-doing-1600.jpg"),
    "i-like-internet": ("I Like Internet", "assets/works/i-like-internet/i-like-internet-1600.jpg"),
}
PIXEL = {"i-want-to-believe": 11}  # pixel art: its 11 x 11 cells drawn as whole squares

# assets/light.js: the paper through the day, by the hour
DAY = [(0, "#121110"), (4.5, "#16151C"), (5.75, "#2B2C3C"), (6.75, "#8E8798"), (7.5, "#DCD6DA"), (9.5, "#F4F2ED"),
       (12, "#FAFAF8"), (15.5, "#F7F2E8"), (17.75, "#EEDCBA"), (18.75, "#E3C08E"), (19.75, "#4A3F4E"), (20.75, "#1F2230"),
       (22, "#121110"), (24, "#121110")]
PAPER, INK, RULE = (250, 250, 248), (28, 27, 24), (226, 224, 218)

_fonts = {}


def font(name, size, layout=ImageFont.Layout.BASIC):
    """The site's own font file. A Pillow that can't read WOFF2 gets a converted copy (pip install fonttools brotli)."""
    if (name, size, layout) not in _fonts:
        path = os.path.join(SITE, "assets", "fonts", name + ".woff2")
        try:
            f = ImageFont.truetype(path, size, layout_engine=layout)
        except OSError:
            from fontTools.ttLib import TTFont
            ttf = os.path.join(tempfile.gettempdir(), name + ".ttf")
            if not os.path.exists(ttf):
                t = TTFont(path)
                t.flavor = None
                t.save(ttf)
            f = ImageFont.truetype(ttf, size, layout_engine=layout)
        _fonts[name, size, layout] = f
    return _fonts[name, size, layout]


def paper_at(h):
    for (h0, c0), (h1, c1) in zip(DAY, DAY[1:]):
        if h0 <= h <= h1:
            f = (h - h0) / max(0.0001, h1 - h0)
            a = [int(c0[i:i + 2], 16) for i in (1, 3, 5)]
            b = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
            return tuple(round(a[j] + (b[j] - a[j]) * f) for j in range(3))
    return (18, 17, 16)


def day_bar(w, h):
    im = Image.new("RGB", (w, h))
    for x in range(w):
        c = paper_at((x + 0.5) / w * 24)
        for y in range(h):
            im.putpixel((x, y), c)
    return im


def still(spec):
    if isinstance(spec, tuple):
        video, seconds = spec
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(seconds), "-i", os.path.join(SITE, video), "-frames:v", "1",
                              "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True, check=True).stdout
        return Image.open(io.BytesIO(raw)).convert("RGB")
    return Image.open(os.path.join(SITE, spec)).convert("RGB")


def wrap(text, f, width):
    lines, cur = [], ""
    for word in text.split():
        trial = (cur + " " + word).strip()
        if cur and f.getlength(trial) > width:
            lines.append(cur)
            cur = word
        else:
            cur = trial
    return lines + [cur]


def card(page):
    title, spec = CARDS[page]
    im = Image.new("RGB", (1200, 630), PAPER)
    d = ImageDraw.Draw(im)
    d.text((64, 52), "Stephen Biernacki", font=font("FragmentMono-Regular", 24, ImageFont.Layout.RAQM), fill=INK)
    # the footer's bar of the day's light, under the name
    bx, by, bw, bh = 64, 96, 470, 12
    im.paste(day_bar(bw, bh), (bx, by))
    d.rectangle((bx - 1, by - 1, bx + bw, by + bh), outline=RULE, width=1)
    # the work, whole, in a box on the right, inside the site's hairline
    bx, by, bw, bh = 600, 48, 552, 534
    art = still(spec)
    if page in PIXEL:
        cells = PIXEL[page]
        side = int(min(bw, bh) // cells) * cells
        art = art.resize((side, side), Image.NEAREST)
    else:
        s = min(bw / art.width, bh / art.height)
        art = art.resize((round(art.width * s), round(art.height * s)), Image.LANCZOS)
    ax, ay = bx + (bw - art.width) // 2, by + (bh - art.height) // 2
    im.paste(art, (ax, ay))
    d.rectangle((ax - 1, ay - 1, ax + art.width, ay + art.height), outline=RULE, width=1)
    # the title in the hand: as few lines as the title allows, then as large as those lines allow
    hand = lambda size: font("StephenHand-Regular", size)
    tries = [(size, wrap(title, hand(size), 470)) for size in (88, 80, 72, 64, 56, 48)]
    tries = [(s_, l) for s_, l in tries if all(hand(s_).getlength(x) <= 470 for x in l)]
    tries = [x for x in tries if x[0] >= 64] or tries
    fewest = min(len(l) for _, l in tries)
    size, lines = next((s_, l) for s_, l in tries if len(l) == fewest)
    lh = round(size * 1.18)
    top = 330 - (lh * len(lines)) // 2 + 10
    for i, l in enumerate(lines):
        d.text((64, top + i * lh), l, font=hand(size), fill=INK)
    out = io.BytesIO()
    im.save(out, "JPEG", quality=90, subsampling=0, optimize=True, progressive=True)
    return out.getvalue()


def main(args):
    if args == ["--check"]:
        off = 0
        for page in CARDS:
            path = os.path.join(SITE, "assets", "share", page + ".jpg")
            if not os.path.exists(path):
                print(f"{page}: no card on the site yet")
                off += 1
                continue
            new, old = card(page), open(path, "rb").read()
            if new == old:
                continue
            diff = ImageChops.difference(Image.open(io.BytesIO(new)).convert("RGB"), Image.open(path).convert("RGB"))
            most = max(c[1] for c in diff.getextrema())
            if most:
                print(f"{page}: differs from the site's, by up to {most} of 255")
                off += 1
        print(f"All {len(CARDS)} cards come out the same as the site's." if not off else f"{off} of {len(CARDS)} differ.")
        return 1 if off else 0
    pages = list(CARDS) if args == ["--all"] else args
    if not pages or any(p not in CARDS for p in pages):
        print(__doc__)
        print("Pages:", ", ".join(CARDS))
        return 2
    for page in pages:
        path = os.path.join(SITE, "assets", "share", page + ".jpg")
        with open(path, "wb") as f:
            f.write(card(page))
        print(os.path.relpath(path, SITE))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
