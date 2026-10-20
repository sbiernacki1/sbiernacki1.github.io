# stephenbiernacki — website

Plain HTML, CSS, and a little JavaScript. No framework, no build step, no cookies, no analytics.
Every page is a folder with an `index.html`, so URLs stay clean (`/works/vestige/`).

## Put it online (GitHub Pages + stephenbiernacki.com)

1. Repository `sbiernacki1.github.io` (public) holds these files at its root, with `index.html` at the top level.
   The site has 181 files, and GitHub's upload page takes fewer than 100 at a time. GitHub Desktop
   (desktop.github.com) has no limit: clone the repository, copy everything in this folder into the
   clone, then Commit to main and Push origin. Later updates go the same way.
   With the upload page instead, go in three rounds: first everything except `assets/works` (50 files);
   then, on GitHub, open `assets`, choose Add file → Upload files, and drop in `works` with
   `syntax-synapse` moved out of it for a moment (91 files); then open `assets/works` and drop in
   `syntax-synapse` (40 files).
   Either way, on a Mac, Finder hides `.nojekyll`. Press Shift-Command-Period to show it, so it goes too.
2. Settings → Pages → Build and deployment → Deploy from a branch → `main`, `/ (root)`.
3. Settings → Pages → Custom domain → `stephenbiernacki.com` → Save (the `CNAME` file may have filled it
   in already). Do this before changing DNS.
4. Namecheap → Domain List → stephenbiernacki.com → Manage → Advanced DNS: remove the parking records, then add
   four A records for host `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`,
   and one CNAME record: host `www`, value `sbiernacki1.github.io`.
5. Back in Settings → Pages, tick "Enforce HTTPS" once it becomes available. Vestige needs HTTPS for the microphone.

`.nojekyll` tells GitHub to serve the files as-is. `CNAME` holds the domain, so it stays set however
the files are uploaded. `404.html` is the not-found page.

Every page links to its stylesheet and scripts with `?v=7` at the end (`assets/site.css?v=7`). After
changing any file in `assets` that ends in `.css` or `.js`, raise that number on every page, so
browsers fetch the new files at once instead of reusing their copies of the old ones for up to ten
minutes.

## Not on the site yet

Every work now has its image or its live link. Anything added later without one is simply left off its page.

The live works load from where they were minted: Vestige, Alien Invasion of Privacy, Untitled (For Jo),
RED HERR1NG (1'M HERE), and Self-Addressed from Verse's servers, except ten of the Self-Addressed works,
which load from Transient's, as all of UNBECOMING does.

## The front page

The front page is the works. The bio comes first; then every work, newest first, hung by chance: a
different size, place and lean on every visit, with the order always the same (`assets/wall.js`). On a
wide screen the first few works sit beside the bio. Each title is written in the hand and measured from
the widths of the drawings it will use, so nothing overlaps or runs off the page.

After the works, the question that ends each part of the Statement sits in a row, in order, and links
to its part (`#witnessed`, `#remembered`, `#withheld`). The three are plain text in `index.html`, in the
`asks` section after the list, word for word as they appear in the Statement.

The wall reads the `wall-data` block at the bottom of `index.html`: each work's title, its record line,
its page, and a still about 800 pixels wide. A moving work also has a light, silent loop of its own
frames (640 pixels wide, or the work's own size if smaller, as MP4 and WebM), with its first frame as
the still. Eight works move on the wall: Alien Invasion of Privacy, Self-Addressed, Ephemeron,
UNBECOMING, PANOPTICISM, Process, Untitled (For Jo) and Deathbed. Loops play only while they are on
screen, and not at all for anyone whose device asks for less motion. Without JavaScript, the plain
list above the block (`<ol class="index">`) shows instead, so keep the two in step.

`/works/` forwards to the front page, so old links still land on the works.

## A work's page

The work sits in a frame on the left, inside a thin edge. In a series, a line above the frame names the
work showing and says "3 of 20" beside Show another; a single work's frame stands alone, since its
title is beside it. Beside the frame: the title, the words, the record, and the links. On a wide
screen the frame stays in view while the words are read.

Under the frame, Full screen shows the work alone on the page's own light, as large as the screen
allows and never cropped (`assets/view.js`). On a computer, Android or an iPad the work leaves the
browser's frame entirely; on an iPhone, where true full screen is kept for videos, it fills the browser
window. Close or Esc comes back. In a series, Show another and the arrow keys still step through. A live
work also has Open in a new tab, which opens it where it was minted, by itself. On a computer these
appear while the pointer is over the work; on a phone they are always there, under the work, never on
it. There is no download: the files here are display copies, and the minted originals are one link
away under each work.

Once a visitor has been with a work for a full minute, a line appears below its title and words: "You
have been with Deathbed for a minute." It then goes up a minute at a time. Only time with the page in view
counts, nothing is stored, and the count ends when the page closes (`assets/light.js`).

A work that asks something of the visitor says what in one line under the frame, in pencil:
Vestige's "Tap or click to start. The work listens through your microphone.", Alien Invasion of
Privacy's "Tap or click a camera to open it.", and UNBECOMING's "Move a cursor or finger over the
work." In a series the line belongs to the works it is true of (an entry's `note` in its `series-data`)
and shows only while one of them is in the frame: UNBECOMING's live works have it, its five GIF
versions don't.

Under a series where every work has a still here, the whole series hangs on a wall, by chance: the
order, the sizes and the places are new on every visit (the front page keeps its order, newest first).
A tap on any work opens it in the frame. A moving work hangs as a light, silent loop of its own (an
entry's `loop`: 640 pixels, MP4 and WebM, with its first frame as the still), and plays only while it
is on screen, and not at all for anyone whose device asks for less motion. Self-Addressed, UNBECOMING
and RED HERR1NG include live works with no still here yet, so they show the frame alone.

## Adding an image or a live work

Live embed (inside the frame, `<div class="frame">`, on the work's page):

```html
<iframe src="ARTWORK_URL" title="Vestige" allow="microphone" loading="lazy" referrerpolicy="no-referrer"></iframe>
```

Only Vestige needs `allow="microphone"`. If a work is a single self-contained file, put a copy in
`/art/` and embed that instead: the page then makes no requests to anyone else's servers.

Still image (same spot): put the file in `/assets/works/` and use

```html
<img src="../../assets/works/FILENAME.jpg" alt="Short plain description" loading="lazy">
```

The `--ar` value on the frame's holder, `<div class="stage">`, sets the frame's proportions; change it to
match the image (for example `--ar: 4 / 5; --arn: 0.8`).

Every page with more than one work, like Attestations, uses one frame: `<figure class="viewer series">`, with the works
listed in its `series-data` block in order (title, image paths, size, description). `assets/series.js`
opens on the first work; "Show another" or a tap on the image steps to the next one and starts
over after the last. The address follows along (`#fresnel`), so a single work can be linked.
Without JavaScript, the first work shows. Images are shown exactly as minted, never cropped.
Big ones have two sizes: 1600 and 800 pixels wide.

A series can also hold live works, like Self-Addressed: each entry has an `embed` link to the minted
file instead of image paths, and plays in the frame. A tap on a live work belongs to the work, so only
"Show another" steps. Each step makes a new frame, so the browser's Back button still leaves the page.

A series can mix stills and live works, like RED HERR1NG. On the stage, `--arn` (width over height)
keeps the frame within 74% of the screen's height, and `--live-bg` is the color a live work's frame
shows while it loads. A still that is small enough is served as the original file, in one size.
A still can also load from where it was minted, with an https link as its `src`: five UNBECOMING
owners chose a GIF version of their work, and those show that way, filling the square.
A moving work too heavy to show as minted plays as a silent, looping video of the same frames,
with its first frame as the poster: Deathbed's minted GIF is 188 MB, and its video is about 3.5 MB.

## Adding a work

Copy any folder in `/works/`, rename it, and edit the title, the record lines, the media, and the text.
Add it to the front page twice: a row in the list where it falls by date, newest first, and an entry
in the same place in the `wall-data` block with its still (and its loop, if it moves). The wall hangs
the works in the block's order. Then update the Previous/Next
links on its neighbors.
The last work's Next link goes to the Statement, so a walk through the works ends there.

Every work with a page is on the front page. Under "Also", it links to everything on Rodeo and on
Tezos; those overlap with pages here on purpose, so they say "All".
A page with no words (Ephemeron, Process) simply has none: the frame and the record.

## How the handwriting works

`assets/hand.js` runs on every page load. Stephen Hand keeps between one and ten drawings of each
character, and the script picks one per letter: every drawing kept in the font is equally likely, and a
character never repeats the drawing it used last. Every visit is written out fresh. Nothing is stored or
sent. Screen readers and copy/paste get the plain text. Without JavaScript, the font's own built-in
cycling takes over. The last two words of each handwritten paragraph are kept on one line, so no
paragraph ends on a single word.

The table at the top of `hand.js` lists those drawings and is generated from the font file (its version
is noted in the comment). If the font is updated, regenerate the table along with the font file,
and leave the digit 1 out of it: only its default drawing has a flag, and the others read as an l.

The titles on the walls are written by `assets/wall.js` the same way, from the same drawings, with
one difference: each arrangement picks them from its own number, so every visit writes them anew. Its
table also holds how wide each drawing is, so a title's size can be worked out before it is placed.
That table is generated from the font file too, and needs regenerating with it.

## Light

The site's light follows the visitor's own clock: dark through the night, pale at dawn, white at noon,
warm at dusk (`assets/light.js`). It runs in each page's head before anything is drawn, and looks at the
clock again as each minute begins. At every hour the ink is chosen to read clearly on the paper (at
least 4.5 to 1), and the pencil gray never falls below that either. Amber stays amber, and the artworks
are never changed. Nothing is stored and nothing is sent. The hours and colors are listed at the top of
`light.js`.

The footer of every page shows it: "It is 12:46 in the afternoon where you are. The color of this page
follows your clock." Under that, a bar holds the whole day's light from midnight to midnight, drawn
from the same list of colors, with an amber mark at now, so the color under the mark is the page's own.
The words and the mark change as each minute begins. Noon and midnight on the dot are said as "noon"
and "midnight"; otherwise it is morning from 5, afternoon from noon, evening from 5 and night from 9.
The last line is "This site does not track you."

Without JavaScript, the page follows the device's own light or dark setting instead, so the footer
says only "This site does not track you."

## Share cards

When a work's page is shared, on X or in a message, the card shows the work: `assets/share/<page>.jpg`,
1200 × 630, the whole artwork on the paper color beside its title in the hand, never cropped. Moving works
use one clear frame. Work pages are titled "Deathbed by Stephen Biernacki". The live works without a card
of their own yet (Alien Invasion of Privacy, Vestige, Self-Addressed, UNBECOMING, Untitled (For Jo)) use
the site's own card, `assets/og.png`.

## Fonts

- Stephen Hand — © Stephen Biernacki. Not licensed for reuse.
- Fragment Mono — SIL Open Font License 1.1 (`assets/fonts/OFL-FragmentMono.txt`).
