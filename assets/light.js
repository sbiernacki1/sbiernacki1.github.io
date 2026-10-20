/* light.js
   The light follows the visitor's own clock: dark through the night, pale at dawn, white at noon,
   warm at dusk. This runs in each page's head, before anything is drawn, so a page never opens in the
   wrong light, and it looks at the clock again as each minute begins. Whatever the hour, the ink is
   chosen so it reads clearly on the paper, and the pencil never drops below that either.
   The footer says the time where the visitor is, in words, above a bar of the whole day's light, from
   midnight to midnight, with an amber mark at now. Both change with the minute.
   It also keeps the count of how long a visitor has been with a work: nothing shows for the first
   minute; after that the line appears and goes up a minute at a time. Only time with the page in view
   counts, and the count ends when the page closes.
   Nothing is stored and nothing is sent. Without JavaScript, the device's light or dark setting decides,
   and there is no footer. */
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

  var tint = null;
  function apply(d) {
    var p = light(d.getHours() + d.getMinutes() / 60);
    var s = root.style;
    s.setProperty("--paper", p.paper);
    s.setProperty("--ink", p.ink);
    s.setProperty("--pencil", p.pencil);
    s.setProperty("--rule", p.rule);
    s.setProperty("--well", p.well);
    s.colorScheme = p.scheme;
    /* the phone's own bar matches the page */
    tint = tint || document.querySelector('meta[name="theme-color"]');
    if (tint) tint.setAttribute("content", p.paper);
  }

  /* the footer: the time in words, and the day's light from midnight to midnight with a mark at now.
     The bar is drawn from PAPER above, so it always holds the colors the page passes through. */
  var DAY = "linear-gradient(90deg, " + PAPER.map(function (k) { return k[1] + " " + +(k[0] / 24 * 100).toFixed(2) + "%"; }).join(", ") + ")";
  function said(d) {
    var hr = d.getHours(), mn = d.getMinutes();
    if (mn === 0 && hr === 0) return "midnight";
    if (mn === 0 && hr === 12) return "noon";
    var part = hr >= 5 && hr < 12 ? "in the morning" : hr >= 12 && hr < 17 ? "in the afternoon" : hr >= 17 && hr < 21 ? "in the evening" : "at night";
    return (hr % 12 || 12) + ":" + (mn < 10 ? "0" : "") + mn + " " + part;
  }
  function day(d) {
    var box = document.querySelector(".day");
    if (!box) return;
    var t = box.querySelector(".day-time"), bar = box.querySelector(".day-bar"), mark = box.querySelector(".day-mark");
    if (t) t.textContent = said(d);
    if (bar && !bar.style.backgroundImage) bar.style.backgroundImage = DAY;
    if (mark) mark.style.left = ((d.getHours() + d.getMinutes() / 60) / 24 * 100).toFixed(3) + "%";
    box.classList.add("is-on");
  }

  /* everything that follows the clock, again as each minute begins */
  var turn = null;
  function now() {
    var d = new Date();
    apply(d);
    day(d);
    clearTimeout(turn);
    turn = setTimeout(now, 60000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 30);
  }
  now();
  document.addEventListener("visibilitychange", function () { if (!document.hidden) now(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { day(new Date()); });

  /* a page with a wall hides its plain list of works before anything is drawn (see wall.js);
     if the wall can't be drawn, the list comes back once the page has loaded */
  var me = document.currentScript;
  if (me && me.hasAttribute("data-wall")) {
    root.classList.add("walled");
    window.addEventListener("load", function () {
      setTimeout(function () { if (!root.classList.contains("wall-ready")) root.classList.remove("walled"); }, 0);
    });
  }

  /* the count: time with the page in view, in whole minutes, shown from the first full minute */
  var kept = 0, since = document.hidden ? null : Date.now(), timer = null;
  function spent() { return kept + (since === null ? 0 : Date.now() - since); }
  function words(m) {
    function n(k, one, many) { return k === 1 ? one : k + " " + many; }
    if (m < 60) return n(m, "a minute", "minutes");
    var h = Math.floor(m / 60), r = m % 60;
    return n(h, "an hour", "hours") + (r ? " and " + n(r, "a minute", "minutes") : "");
  }
  function tick() {
    var ms = spent(), m = Math.floor(ms / 60000), i;
    if (m >= 1) {
      var counts = document.querySelectorAll(".count");
      for (i = 0; i < counts.length; i++) {
        var w = counts[i].querySelector(".watched");
        if (w) w.textContent = words(m);
        counts[i].classList.add("is-on");
      }
    }
    clearTimeout(timer);
    if (since !== null) timer = setTimeout(tick, 60000 - (ms % 60000) + 20);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (since !== null) { kept += Date.now() - since; since = null; } }
    else if (since === null) since = Date.now();
    tick();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick);
  else tick();
})();
