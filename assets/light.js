/* light.js
   The light follows the visitor's own clock: dark through the night, pale at dawn, white at noon,
   warm at dusk. This runs in each page's head, before anything is drawn, so a page never opens in the
   wrong light, and it looks at the clock again every minute. Whatever the hour, the ink is chosen so
   it reads clearly on the paper, and the pencil never drops below that either.
   It also keeps the clock on a work's frame, and the count of how long a visitor has been with a work:
   the count starts when the page opens and ends when it closes.
   Nothing is stored and nothing is sent. Without JavaScript, the device's light or dark setting decides. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  /* the paper through the day, by the hour on the visitor's clock */
  var PAPER = [[0, "#121110"], [4.5, "#16151C"], [5.75, "#2B2C3C"], [6.75, "#8E8798"], [7.5, "#DCD6DA"], [9.5, "#F4F2ED"],
    [12, "#FAFAF8"], [15.5, "#F7F2E8"], [17.75, "#EEDCBA"], [18.75, "#E3C08E"], [19.75, "#4A3F4E"], [20.75, "#1F2230"],
    [22, "#121110"], [24, "#121110"]];
  var DARK_INK = [28, 27, 24], LIGHT_INK = [236, 232, 224];

  function rgb(hex) { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; }
  function lum(c) {
    var v = c.map(function (x) { x = x / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function css(c) { return "rgb(" + c.map(Math.round).join(", ") + ")"; }

  function light(h) {
    var a = PAPER[0], b = PAPER[1];
    for (var i = 0; i < PAPER.length - 1; i++) if (h >= PAPER[i][0] && h <= PAPER[i + 1][0]) { a = PAPER[i]; b = PAPER[i + 1]; break; }
    var f = (h - a[0]) / Math.max(0.0001, b[0] - a[0]);
    var ca = rgb(a[1]), cb = rgb(b[1]);
    var paper = [0, 1, 2].map(function (j) { return Math.round(ca[j] + (cb[j] - ca[j]) * f); });
    var dark = contrast(DARK_INK, paper) >= contrast(LIGHT_INK, paper);
    var ink = dark ? DARK_INK : LIGHT_INK;
    /* in the middle of dawn and dusk, neither ink is quite enough on its own: go to black or white */
    if (contrast(ink, paper) < 4.5) ink = dark ? [0, 0, 0] : [255, 255, 255];
    /* pencil is the ink, faded, but never past a clear 4.5 to 1 */
    var alpha = 0.66, pencil;
    for (;;) {
      pencil = [0, 1, 2].map(function (j) { return ink[j] * alpha + paper[j] * (1 - alpha); });
      if (alpha >= 1 || contrast(pencil, paper) >= 4.5) break;
      alpha = Math.min(1, alpha + 0.02);
    }
    return {
      paper: css(paper),
      ink: css(ink),
      pencil: css(pencil),
      rule: "rgba(" + ink.join(", ") + ", " + (dark ? 0.16 : 0.18) + ")",
      well: css(paper.map(function (x) { return x * (dark ? 0.93 : 0.45); })),
      scheme: dark ? "light" : "dark"
    };
  }

  var bar = null;
  function apply() {
    var d = new Date();
    var p = light(d.getHours() + d.getMinutes() / 60);
    var s = root.style;
    s.setProperty("--paper", p.paper);
    s.setProperty("--ink", p.ink);
    s.setProperty("--pencil", p.pencil);
    s.setProperty("--rule", p.rule);
    s.setProperty("--well", p.well);
    s.colorScheme = p.scheme;
    /* the phone's own bar matches the page */
    bar = bar || document.querySelector('meta[name="theme-color"]');
    if (bar) bar.setAttribute("content", p.paper);
  }
  apply();
  setInterval(apply, 60000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) apply(); });

  /* a page with a wall hides its plain list of works before anything is drawn (see wall.js);
     if the wall can't be drawn, the list comes back once the page has loaded */
  var me = document.currentScript;
  if (me && me.hasAttribute("data-wall")) {
    root.classList.add("walled");
    window.addEventListener("load", function () {
      setTimeout(function () { if (!root.classList.contains("wall-ready")) root.classList.remove("walled"); }, 0);
    });
  }

  /* the clock on a work's frame, and the count */
  var opened = Date.now();
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var d = new Date(), i;
    var time = two(d.getHours()) + ":" + two(d.getMinutes()) + ":" + two(d.getSeconds());
    var clocks = document.querySelectorAll(".clock");
    for (i = 0; i < clocks.length; i++) clocks[i].textContent = time;
    var s = Math.floor((Date.now() - opened) / 1000);
    var spent = Math.floor(s / 3600) + ":" + two(Math.floor(s / 60) % 60) + ":" + two(s % 60);
    var counts = document.querySelectorAll(".watched");
    for (i = 0; i < counts.length; i++) counts[i].textContent = spent;
    setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick);
  else tick();
})();
