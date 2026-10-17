# stephenbiernacki — website

Plain HTML, CSS, and a little JavaScript. No framework, no build step, no cookies, no analytics.
Every page is a folder with an `index.html`, so URLs stay clean (`/works/vestige/`).

## Put it online (GitHub Pages + stephenbiernacki.com)

1. Repository `sbiernacki1.github.io` (public) holds these files at its root, with `index.html` at the top level.
   The site has 132 files, and GitHub's upload page takes fewer than 100 at a time. GitHub Desktop
   (desktop.github.com) has no limit: clone the repository, copy everything in this folder into the
   clone, then Commit to main and Push origin. Later updates go the same way.
   With the upload page instead, go in two rounds: first everything, with `assets/works/syntax-synapse`
   moved out for a moment (92 files); then, on GitHub, open `assets/works`, choose Add file → Upload
   files, and drop in `syntax-synapse` (40 files).
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

## Not on the site yet

Every work now has its image or its live link. Anything added later without one is simply left off its page.

The live works load from where they were minted: Vestige, Alien Invasion of Privacy, Untitled (For Jo),
RED HERR1NG (1'M HERE), and Self-Addressed from Verse's servers, except ten of the Self-Addressed works,
which load from Transient's, as all of UNBECOMING does.

## Adding an image or a live work

Live embed (inside a `<figure class="media">` placed above the text):

```html
<iframe src="ARTWORK_URL" title="Vestige" allow="microphone" loading="lazy" referrerpolicy="no-referrer"></iframe>
```

Only Vestige needs `allow="microphone"`. If a work is a single self-contained file, put a copy in
`/art/` and embed that instead: the page then makes no requests to anyone else's servers.

Still image (same spot): put the file in `/assets/works/` and use

```html
<img src="../../assets/works/FILENAME.jpg" alt="Short plain description" loading="lazy">
```

The figure's `--ar` value sets the frame's proportions; change it to match the image
(for example `--ar: 4 / 5; --arn: 0.8`).

Every page with more than one work, like Attestations, uses one frame: `<figure class="series">`, with the works
listed in its `series-data` block in order (title, image paths, size, description). `assets/series.js`
opens on the first work; "Show another" or a tap on the image steps to the next one and starts
over after the last. The address follows along (`#fresnel`), so a single work can be linked.
Without JavaScript, the first work shows. Images are shown exactly as minted, never cropped.
Big ones have two sizes: 1600 and 800 pixels wide.

A series can also hold live works, like Self-Addressed: each entry has an `embed` link to the minted
file instead of image paths, and plays in the frame. A tap on a live work belongs to the work, so only
"Show another" steps. Each step makes a new frame, so the browser's Back button still leaves the page.

A series can mix stills and live works, like RED HERR1NG. On the figure, `--arn` (width over height)
keeps the frame within 74% of the screen's height, and `--live-bg` is the color a live work's frame
shows while it loads. A still that is small enough is served as the original file, in one size.
A still can also load from where it was minted, with an https link as its `src`: five UNBECOMING
owners chose a GIF version of their work, and those show that way, filling the square.
A moving work too heavy to show as minted plays as a silent, looping video of the same frames,
with its first frame as the poster: Deathbed's minted GIF is 188 MB, and its video is about 3.5 MB.

## Adding a work

Copy any folder in `/works/`, rename it, and edit the title, margin lines, media, and text.
Add a row to `works/index.html` where it falls by date, newest first, and update the Previous/Next
links on its neighbors.
The last work's Next link goes to the Statement, so a walk through the works ends there.

Every work with a page is in the main list, newest first. Under "Also", `works/index.html` links to
everything on Rodeo and on Tezos; those overlap with pages here on purpose, so they say "All".
A page with no words (Ephemeron, Process) simply has none: the margin and the work.

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

## Light and dark

The site follows the visitor's device: dark when their phone or computer is set to dark, light otherwise.
The word at the right end of the header (Dark, or Light) lets them choose instead, and `assets/theme.js`
keeps that choice in their own browser so it holds from page to page; nothing is sent. A one-line script
in each page's head applies a saved choice before anything is drawn. The colors live at the top of
`assets/site.css`: in the dark, the paper takes the ink's color and the ink a softened paper, amber stays
amber, and the artworks are never changed.

## Share cards

When a work's page is shared, on X or in a message, the card shows the work: `assets/share/<page>.jpg`,
1200 × 630, the whole artwork on the paper color beside its title in the hand, never cropped. Moving works
use one clear frame. Work pages are titled "Deathbed by Stephen Biernacki". The live works with no still
here (Alien Invasion of Privacy, Vestige, Self-Addressed, UNBECOMING, Untitled (For Jo)) use the site's
own card, `assets/og.png`, until they have one.

## Fonts

- Stephen Hand — © Stephen Biernacki. Not licensed for reuse.
- Fragment Mono — SIL Open Font License 1.1 (`assets/fonts/OFL-FragmentMono.txt`).
