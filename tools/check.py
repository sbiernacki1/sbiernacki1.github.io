# -*- coding: utf-8 -*-
"""Checks to run before every commit:  python3 tools/check.py [--never REGEX ...]

Reads the site as it stands in this folder (the files git sees: committed, changed or new) and prints
each problem it finds, or "All good."

  Files     every file a page asks for is here: links, images, videos and their posters, scripts,
            stylesheets, the files listed in series-data and wall-data, url()s in stylesheets, and
            share images
  Works     the front page's list and its wall-data block name the same works, with the same titles
            and record lines, in the same order, newest first; every work page is in them, and
            nothing else is
  Pager     Previous and Next walk through the works in that order: no Previous on the first, and
            the last one's Next goes to the Statement
  Cards     every work page asks for its own card, assets/share/<page>.jpg?v=N, 1200 x 630, with one
            description and the day's bar under the name; every other page asks for the site's
            card, assets/og.png?v=N
  Versions  every page asks for the stylesheet and scripts with the same ?v= number
  Words     no page says Buy or gives a price, and none shows an email address
  Dashes    no file has more em dashes than it had at the last commit

--never adds words that must never appear on the site, as a regular expression. Keep such words out
of this file and out of the repository, which is public.
Needs Python 3 with Pillow and beautifulsoup4."""
import json
import os
import re
import subprocess
import sys
from urllib.parse import unquote, urljoin, urlparse

from bs4 import BeautifulSoup
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://stephenbiernacki.com/"
TEXT = (".html", ".css", ".js", ".md", ".json", ".txt", ".svg", ".xml")
problems = []


def say(kind, text):
    problems.append(f"{kind:9} {text}")


def tracked():
    out = subprocess.run(["git", "-C", ROOT, "ls-files", "--cached", "--others", "--exclude-standard"],
                         capture_output=True, text=True, check=True).stdout
    return sorted(f for f in out.split("\n") if f and os.path.isfile(os.path.join(ROOT, f)))


def read(f):
    with open(os.path.join(ROOT, f), encoding="utf-8") as fh:
        return fh.read()


def soup(f):
    return BeautifulSoup(read(f), "html.parser")


# ---------- Files ----------
def exists(path):
    full = os.path.join(ROOT, unquote(path).lstrip("/"))
    if path.endswith("/") or os.path.isdir(full):
        full = os.path.join(full, "index.html")
    return os.path.isfile(full)


def ref(page, raw, base):
    if not raw or raw.startswith(("#", "mailto:", "tel:", "data:", "javascript:")):
        return
    u = urlparse(urljoin(base, raw))
    if u.scheme in ("http", "https") and u.netloc not in ("stephenbiernacki.com", "www.stephenbiernacki.com"):
        return  # somewhere else: the minted works, Verse, Objkt and the rest
    if not exists(u.path):
        say("Files", f"{page} asks for {raw}, which isn't here")


def check_files(files):
    for f in files:
        if f.endswith(".html"):
            base = SITE + (f[:-len("index.html")] if f.endswith("index.html") else f)
            if f == "404.html":
                base = SITE + "any/missing/page/"  # it is served at any address, so it links from the root
            s = soup(f)
            for tag in s.find_all(True):
                for attr in ("href", "src", "poster", "data-src"):
                    if tag.has_attr(attr):
                        ref(f, tag[attr], base)
                if tag.has_attr("srcset"):
                    for part in tag["srcset"].split(","):
                        ref(f, part.strip().split(" ")[0], base)
                if tag.name == "meta" and tag.get("property") in ("og:image", "og:image:url", "og:image:secure_url"):
                    ref(f, tag.get("content", ""), base)
            for blk in s.select("script.series-data"):
                fig = blk.find_parent("figure")
                b = urljoin(base, fig.get("data-base", "")) if fig else base
                for d in json.loads(blk.string):
                    for v in [d] + [d[k] for k in ("loop",) if isinstance(d.get(k), dict)]:
                        for k in ("src", "small", "poster", "video", "mp4", "webm"):
                            if isinstance(v.get(k), str):
                                ref(f, v[k], b)
                        if isinstance(v.get("srcset"), str):
                            for part in v["srcset"].split(","):
                                ref(f, part.strip().split(" ")[0], b)
            for blk in s.select("script.wall-data"):
                for d in json.loads(blk.string):
                    for k in ("src", "href", "mp4", "webm"):
                        if isinstance(d.get(k), str):
                            ref(f, d[k], base)
        elif f.endswith(".css"):
            for m in re.finditer(r"url\(([^)]+)\)", read(f)):
                ref(f, m.group(1).strip("'\""), SITE + os.path.dirname(f) + "/")


# ---------- Works and Pager ----------
def work_pages(files):
    return sorted(f.split("/")[1] for f in files if re.fullmatch(r"works/[^/]+/index\.html", f))


def check_works(files):
    s = soup("index.html")
    listed = [(li.select_one("a")["href"], li.select_one("a").get_text(), li.select_one("p.m").get_text())
              for li in s.select("ol.index li")]
    wall = [(d.get("href"), d.get("t"), d.get("m")) for d in json.loads(s.select_one("script.wall-data").string)]
    if listed != wall:
        for i, (a, b) in enumerate(zip(listed, wall)):
            if a != b:
                say("Works", f"front page, item {i + 1}: the list has {a}, the wall-data block has {b}")
                break
        if len(listed) != len(wall):
            say("Works", f"front page: {len(listed)} works in the list, {len(wall)} in the wall-data block")
    order = []
    for href, title, m in listed:
        hit = re.fullmatch(r"works/([^/]+)/", href)
        if not hit:
            say("Works", f"front page: {href} is not a work page")
            continue
        order.append((hit.group(1), title))
    pages = work_pages(files)
    for slug in sorted(set(pages) - {s_ for s_, _ in order}):
        say("Works", f"works/{slug}/ has a page but isn't on the front page")
    for slug in sorted({s_ for s_, _ in order} - set(pages)):
        say("Works", f"the front page lists works/{slug}/, which has no page")
    years = [re.match(r"(\d{4})", m) for _, _, m in listed]
    if all(years):
        ys = [int(y.group(1)) for y in years]
        for i in range(1, len(ys)):
            if ys[i] > ys[i - 1]:
                say("Works", f"front page: {listed[i][1]} ({ys[i]}) comes after {listed[i - 1][1]} ({ys[i - 1]}); newest go first")
    return order


def check_pager(order):
    for i, (slug, _) in enumerate(order):
        f = f"works/{slug}/index.html"
        if not os.path.isfile(os.path.join(ROOT, f)):
            continue
        nav = soup(f).select_one("nav.pager")
        if nav is None:
            say("Pager", f"{f} has no Previous and Next")
            continue
        want = []
        if i > 0:
            want.append(("prev", f"../../works/{order[i - 1][0]}/", order[i - 1][1]))
        if i + 1 < len(order):
            want.append(("next", f"../../works/{order[i + 1][0]}/", order[i + 1][1]))
        else:
            want.append(("next", "../../statement/", "Statement"))
        have = [(" ".join(a.get("class", [])), a.get("href"), a.select_one(".hand").get_text() if a.select_one(".hand") else "")
                for a in nav.select("a")]
        if have != want:
            say("Pager", f"{f} has {have}, but the front page's order needs {want}")


# ---------- Cards ----------
def check_cards(files):
    for f in files:
        if not f.endswith(".html"):
            continue
        h = read(f)
        if 'http-equiv="refresh"' in h:
            continue  # a page that only forwards
        imgs = re.findall(r'<meta property="og:image" content="([^"]*)">', h)
        alts = re.findall(r'<meta property="og:image:alt" content="([^"]*)">', h)
        wh = (re.findall(r'og:image:width" content="(\d+)"', h), re.findall(r'og:image:height" content="(\d+)"', h))
        if len(imgs) != 1 or len(alts) != 1 or not alts[0].strip() or wh != (["1200"], ["630"]):
            say("Cards", f"{f}: needs one og:image, 1200 x 630, with one og:image:alt")
            continue
        m = re.fullmatch(re.escape(SITE) + r"(assets/share/([a-z0-9-]+)\.jpg|assets/og\.png)\?v=\d+", imgs[0])
        work = re.fullmatch(r"works/([^/]+)/index\.html", f)
        if not m:
            say("Cards", f"{f}: asks for {imgs[0]}")
            continue
        if work and m.group(2) != work.group(1):
            say("Cards", f"{f}: should ask for its own card, assets/share/{work.group(1)}.jpg?v=N")
            continue
        if not work and m.group(2):
            say("Cards", f"{f}: asks for a work's card, but isn't that work's page")
        path = os.path.join(ROOT, m.group(1))
        if not os.path.isfile(path):
            continue  # Files has said so
        im = Image.open(path)
        if im.size != (1200, 630):
            say("Cards", f"{m.group(1)} is {im.size[0]} x {im.size[1]}, not 1200 x 630")
        elif work:
            im = im.convert("RGB")
            ends, noon = [im.getpixel((66, 102)), im.getpixel((531, 102))], im.getpixel((299, 102))
            if any(max(c) > 40 for c in ends) or min(noon) < 238:
                say("Cards", f"{m.group(1)} has no day bar under the name: draw it with tools/share_card.py")


# ---------- Versions, Words, Dashes ----------
def check_versions(files):
    seen = {}
    for f in files:
        if f.endswith(".html"):
            for m in re.finditer(r'(?:href|src)="[^"]*?assets/([\w-]+\.(?:css|js))(\?v=(\d+))?"', read(f)):
                if not m.group(2):
                    say("Versions", f"{f} asks for assets/{m.group(1)} without ?v=")
                else:
                    seen.setdefault(m.group(3), set()).add(f)
    if len(seen) > 1:
        say("Versions", "pages ask for the stylesheet and scripts with different numbers: "
            + "; ".join(f"?v={v} on {len(fs)} page{'s' if len(fs) > 1 else ''}" for v, fs in sorted(seen.items())))


def check_words(files, never):
    pats = [(r"\bbuy\b", "Buy: links say View"), (r"\bprices?\b", "a price"),
            (r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}", "an email address"), (r"mailto:", "an email link")]
    pats += [(p, "a word that must never appear") for p in never]
    for f in files:
        if f.endswith(".html"):
            h = read(f)
            for pat, what in pats:
                for m in re.finditer(pat, h, re.I):
                    say("Words", f"{f}: {what}, near {h[max(0, m.start() - 40):m.end() + 40]!r}")


def check_dashes(files):
    for f in files:
        if not f.endswith(TEXT):
            continue
        now = read(f).count("\u2014")
        before = subprocess.run(["git", "-C", ROOT, "show", "HEAD:" + f], capture_output=True, text=True)
        was = before.stdout.count("\u2014") if before.returncode == 0 else 0
        if now > was:
            say("Dashes", f"{f}: {now - was} new em dash{'es' if now - was > 1 else ''}; new text goes without them")


def main(args):
    never = []
    while "--never" in args:
        i = args.index("--never")
        never.append(args[i + 1])
        args = args[:i] + args[i + 2:]
    files = [f for f in tracked() if not f.startswith("tools/")]  # the helpers aren't the site
    check_files(files)
    order = check_works(files)
    check_pager(order)
    check_cards(files)
    check_versions(files)
    check_words(files, never)
    check_dashes(files)
    for p in problems:
        print(p)
    pages = sum(f.endswith(".html") for f in files)
    print(f"{len(problems)} problem{'s' if len(problems) != 1 else ''}." if problems
          else f"All good: {pages} pages, {len(order)} works.")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
