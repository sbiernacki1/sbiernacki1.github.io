/* view.js
   Full screen, for any work: the work alone on the page's own light, as large as the screen allows,
   never cropped. Where the browser allows it (a computer, Android, an iPad) the work leaves the
   browser's frame entirely; on an iPhone, which keeps true full screen for videos, it fills the browser
   window instead. Close, or Esc, brings the page back. In a series, the line above the frame comes
   along, so Show another, or the arrow keys, still step through the series.
   A live work also has a link that opens it in a tab of its own, as it was minted.
   On a computer these appear under the work while the pointer is over it, or when the keyboard reaches
   them; on a phone they are always there, small, under the work and never on it.
   Nothing is stored and nothing is sent. */
(function () {
  var root = document.documentElement;
  var fig = document.querySelector(".stage > .viewer");
  if (!fig) return;
  var stage = fig.parentNode;
  var frame = fig.querySelector(".frame");
  var acts = fig.querySelector(".acts");
  if (!frame || !acts) return;
  var full = acts.querySelector(".full"), shut = acts.querySelector(".shut"), alone = acts.querySelector(".alone");
  var series = fig.classList.contains("series");
  var count = 0;
  if (series) { try { count = JSON.parse(fig.querySelector(".series-data").textContent).length; } catch (x) { count = 0; } }
  var real = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  var open = false, quiet = [], keep = 0, pageSizes = null;

  /* full screen shows a still larger than the page does, so the browser may pick its larger copy */
  function sharpen() {
    var m = frame.querySelector("img[srcset]");
    if (!m) return;
    if (open) {
      if (pageSizes === null) pageSizes = m.getAttribute("sizes") || "";
      if (m.getAttribute("sizes") !== "100vw") m.sizes = "100vw";
    } else if (pageSizes !== null) {
      m.sizes = fig.getAttribute("data-sizes") || pageSizes;
      pageSizes = null;
    }
  }

  function shown() { return document.fullscreenElement || document.webkitFullscreenElement || null; }

  /* the shape the work keeps when it fills the screen, and where its link goes if it is live */
  function sync() {
    var m = frame.querySelector("img, video, iframe"), r = 0;
    if (m && m.tagName !== "IFRAME") {
      var w = +m.getAttribute("width") || m.naturalWidth || m.videoWidth;
      var h = +m.getAttribute("height") || m.naturalHeight || m.videoHeight;
      if (w && h) r = w / h;
    }
    if (!r) r = parseFloat(getComputedStyle(stage).getPropertyValue("--arn")) || 1;
    fig.style.setProperty("--fs-ar", r);
    if (alone) {
      var live = !!(m && m.tagName === "IFRAME" && /^https?:/.test(m.src));
      alone.hidden = !live;
      if (live) alone.href = m.src;
    }
    if (open) sharpen();
  }

  function step(by) {
    if (!series || count < 2) return;
    if (by > 0) {
      var next = fig.querySelector(".series-next");
      if (next) next.click();
      return;
    }
    var k = fig.seriesCurrent ? fig.seriesCurrent() : 0, e, to = (k - 1 + count) % count;
    try { e = new CustomEvent("series:show", { detail: { index: to } }); }
    catch (x) { e = document.createEvent("CustomEvent"); e.initCustomEvent("series:show", false, false, { index: to }); }
    fig.dispatchEvent(e);
  }

  function enter() {
    if (open) return;
    open = true;
    sync();
    var name = fig.querySelector(".v-title") || document.querySelector(".work-title");
    /* the work's place on the page keeps its size while the work is away, so nothing behind it moves */
    keep = window.pageYOffset || 0;
    stage.style.minHeight = stage.getBoundingClientRect().height + "px";
    fig.classList.add("is-focus");
    root.classList.add("focusing");
    fig.setAttribute("role", "dialog");
    fig.setAttribute("aria-modal", "true");
    if (name) fig.setAttribute("aria-label", name.textContent);
    /* the rest of the page is out of reach until the work comes back */
    var rest = document.querySelectorAll(".skip, .hd, .about, .set, .pager, .foot, .media-note");
    for (var i = 0; i < rest.length; i++) {
      quiet.push([rest[i], rest[i].getAttribute("aria-hidden")]);
      rest[i].inert = true;
      rest[i].setAttribute("aria-hidden", "true");
    }
    full.hidden = true;
    shut.hidden = false;
    sharpen();
    if (real) {
      var go = fig.requestFullscreen || fig.webkitRequestFullscreen;
      try { var p = go.call(fig); if (p && p.catch) p.catch(function () {}); } catch (x) { /* the window-filling view stays */ }
    }
    shut.focus();
  }

  function leave() {
    if (!open) return;
    open = false;
    if (shown() === fig) {
      var out = document.exitFullscreen || document.webkitExitFullscreen;
      try { var p = out.call(document); if (p && p.catch) p.catch(function () {}); } catch (x) {}
    }
    fig.classList.remove("is-focus");
    root.classList.remove("focusing");
    fig.removeAttribute("role");
    fig.removeAttribute("aria-modal");
    fig.removeAttribute("aria-label");
    quiet.forEach(function (q) {
      q[0].inert = false;
      if (q[1] === null) q[0].removeAttribute("aria-hidden"); else q[0].setAttribute("aria-hidden", q[1]);
    });
    quiet = [];
    shut.hidden = true;
    full.hidden = false;
    sharpen();
    stage.style.minHeight = "";
    window.scrollTo(0, keep);
    try { full.focus({ preventScroll: true }); } catch (x) { full.focus(); }
  }

  full.addEventListener("click", enter);
  shut.addEventListener("click", leave);
  /* leaving full screen the browser's way (Esc, a swipe) brings the page back too */
  ["fullscreenchange", "webkitfullscreenchange"].forEach(function (t) {
    document.addEventListener(t, function () { if (open && shown() !== fig) leave(); });
  });
  document.addEventListener("keydown", function (e) {
    if (!open) return;
    if (e.key === "Escape" || e.key === "Esc") { e.preventDefault(); leave(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  });
  fig.addEventListener("series:change", sync);
  window.addEventListener("load", sync);
  sync();
})();
