/* series.js
   One frame per series. Each visit opens on the first work, or on the one the address names (#slug).
   "Show another", on the frame's top edge beside "3 of 20", or a tap on a still or a moving work,
   steps to the next work in order and starts over after the last. Live works play in the frame
   itself, loaded from where they were minted; a tap there belongs to the work.
   A still can load from where it was minted too (an https link), like a GIF an owner chose.
   A moving work too heavy to show as minted plays as a silent, looping video of the same frames;
   a tap on it steps, as with a still.
   The wall of the whole series below the frame (wall.js) can open any work here.
   The page address follows along (#slug), so any single work can be linked.
   Nothing is stored and nothing is sent. */
(function () {
  /* a link to one work (#slug) opens on that work; otherwise the first */
  function start(list, slug) {
    slug = (slug || "").toLowerCase();
    for (var i = 0; i < list.length; i++) if (list[i].slug === slug) return i;
    return 0;
  }

  function setup(fig) {
    var list = JSON.parse(fig.querySelector(".series-data").textContent);
    var base = fig.getAttribute("data-base") || "";
    var name = fig.getAttribute("data-name") || "";
    var sizes = fig.getAttribute("data-sizes") || "100vw";
    var frame = fig.querySelector(".series-frame");
    var title = fig.querySelector(".v-title");
    var pos = fig.querySelector(".v-pos");
    var next = fig.querySelector(".series-next");
    var linked = !window.__PREVIEW__;
    var img = null, i = 0;

    function place(node) {
      while (frame.firstChild) frame.removeChild(frame.firstChild);
      frame.appendChild(node);
    }

    function remote(d) { return /^https?:/.test(d.src || ""); }
    function url(p) { return /^https?:/.test(p) ? p : base + p; }

    /* a still has one size, or a small one too (800 wide unless it says otherwise) */
    function srcset(d) {
      return d.small ? url(d.small) + " " + (d.sw || 800) + "w, " + url(d.src) + " " + d.w + "w" : "";
    }

    function load(el, d) {
      var s = srcset(d);
      if (s) { el.sizes = sizes; el.srcset = s; } else el.removeAttribute("srcset");
      el.referrerPolicy = "no-referrer";
      el.src = url(d.src);
    }

    function show(k, follow) {
      var d = list[k];
      if ((d.embed || remote(d)) && window.__PREVIEW__) {
        var ph = document.createElement("div");
        ph.className = "ph";
        ph.textContent = d.title + " plays here on the live site";
        place(ph);
        img = null;
      } else if (d.video) {
        /* a moving work kept as a light video file: it plays on its own, silent and looping, like a GIF */
        var v = document.createElement("video");
        v.className = "series-video";
        v.muted = true;
        v.loop = true;
        v.autoplay = true;
        v.playsInline = true;
        ["muted", "loop", "autoplay", "playsinline"].forEach(function (a) { v.setAttribute(a, ""); });
        v.width = d.w;
        v.height = d.h;
        if (d.poster) v.poster = url(d.poster);
        v.setAttribute("aria-label", d.alt);
        /* MP4 plays almost everywhere; a WebM copy covers browsers built without it */
        [[d.video, "video/mp4"], [d.webm, "video/webm"]].forEach(function (s) {
          if (!s[0]) return;
          var o = document.createElement("source");
          o.src = url(s[0]);
          o.type = s[1];
          v.appendChild(o);
        });
        if (list.length > 1) v.addEventListener("click", step);
        place(v);
        img = null;
      } else if (d.embed) {
        /* a new frame for every work, so the browser's Back button leaves the page */
        var f = document.createElement("iframe");
        f.className = "series-live";
        f.title = name && d.title.indexOf(name) !== 0 ? name + ", " + d.title : d.title;
        f.setAttribute("referrerpolicy", "no-referrer");
        if (d.allow) f.setAttribute("allow", d.allow);
        f.src = d.embed;
        place(f);
        img = null;
      } else {
        if (!img) {
          img = document.createElement("img");
          img.className = "series-img";
          img.decoding = "async";
          if (list.length > 1) img.addEventListener("click", step);
          place(img);
        }
        img.width = d.w;
        img.height = d.h;
        img.alt = d.alt;
        load(img, d);
      }
      i = k;
      title.textContent = d.title;
      if (pos) pos.textContent = (k + 1) + " of " + list.length;
      if (follow && linked && window.history && history.replaceState) history.replaceState(null, "", "#" + d.slug);
      var n = list[(k + 1) % list.length];
      if (n.src && n !== d && !(remote(n) && window.__PREVIEW__)) load(new Image(), n);
      var e;
      try { e = new CustomEvent("series:change", { detail: { index: k } }); }
      catch (x) { e = document.createEvent("CustomEvent"); e.initCustomEvent("series:change", false, false, { index: k }); }
      fig.dispatchEvent(e);
    }

    function step() { if (list.length > 1) show((i + 1) % list.length, true); }

    /* the wall below asks for a particular work */
    fig.addEventListener("series:show", function (e) {
      var k = e.detail ? e.detail.index : -1;
      if (k >= 0 && k < list.length) show(k, true);
    });
    fig.seriesCurrent = function () { return i; };

    show(start(list, linked ? decodeURIComponent(location.hash.slice(1)) : ""), false);
    if (list.length > 1) next.addEventListener("click", step);
    else { next.hidden = true; if (pos) pos.hidden = true; }
    fig.classList.add("is-ready");
  }

  window.initSeries = function (scope) {
    var figs = (scope || document).querySelectorAll(".series:not(.is-ready)");
    for (var i = 0; i < figs.length; i++) setup(figs[i]);
  };

  if (!window.__HAND_MANUAL__) window.initSeries();
})();
