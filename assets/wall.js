/* wall.js
   The works, hung by chance. On the front page they keep their order, newest first; under a series,
   chance decides the order too. Every visit draws a new hanging: which works share a row, how large each
   one is, where it sits in its share of the row, how far it leans, and how each title is written. Each
   hanging comes from one number, its seed, so every layout is one of nine thousand.
   Nothing overlaps and nothing runs off the page: every title is measured from the widths of the very
   drawings it will be written with, before anything is placed.
   On the front page the wall holds every work, and on a wide screen it starts beside the bio. Under a
   series, it holds the whole series, and a tap opens that work in the frame above (series.js).
   Moving works play silently, only while they're on screen, and not at all for anyone whose device
   asks for less motion. Nothing is stored and nothing is sent. */
(function () {
  /* how wide each drawing of each character is, in thousandths of an em, read from Stephen Hand 0.940.
     A character's list is as long as the number of drawings hand.js chooses from. */
  var W = {" ":[688],"!":[302,248,228],"\"":[402],"#":[648,651,634],"$":[591,459],"%":[800,857,656],"&":[529],"'":[276],"(":[343,331,384],")":[331,329,409],"*":[612,644,543],"+":[580,550,644],",":[364,337,335,313,341,310,293],"-":[526,521,516,517,596,611],".":[230,227,226,221,222,281,322],"/":[336,381],"0":[631,633,662,651],"1":[602],"2":[629,607,622,605],"3":[599,669,576,539,611],"4":[642,436,505,531,575],"5":[686,627,728,695,837],"6":[523,431,472,577],"7":[631,648,652],"8":[547,555,497,661],"9":[556,520,649],":":[230,216,231],";":[261,265,241],"<":[597],"=":[548],">":[499,501],"?":[443,415],"@":[787,678],"A":[561,499,499,523,510,533],"B":[515,490,455,484],"C":[537,523,511,525,604],"D":[553,493,542,516,467,581],"E":[492,432,428,479,555],"F":[483,454,532,408,440],"G":[610,566,519,475,523],"H":[527,509,439,463,506],"I":[653,625,534,699],"J":[490,516,452,528,493],"K":[727,718,689,650,682,668],"L":[594,668,620,782,570],"M":[680,725,796,752,736],"N":[622,543,684,682],"O":[640,691,662,675,605,704],"P":[490,470,559,549,476],"Q":[629,672,606,685,753],"R":[605,600,566,554,538,626],"S":[677,570,695,557],"T":[743,848,770,829],"U":[613,652,702,735,658],"V":[587,739,734,736,763],"W":[780,816,941,893,828,990],"X":[579,597,760,647,624],"Y":[599,667,600,718,537,586],"Z":[609,781,737,955],"[":[463,495],"\\":[549,440],"]":[477,441],"^":[674,538],"_":[923,913],"`":[337,337,326,367,306],"a":[448,447,437,407,382,438,427,422,479,425],"b":[492,482,439,463,473,423,441,448,494,459],"c":[471,455,435,467,484,527,433,457,542,434],"d":[453,433,416,415,475,450,424,455],"e":[421,438,466,434,440,493,486,472],"f":[475,417,374,367,488,500,476,469,400],"g":[460,476,416,465,476,473,432,458,542],"h":[439,499,484,428,446,429,432],"i":[200,227,201,233,212,204,237,237,222,266],"j":[538,519,492,402,481,537,494,508,534],"k":[539,647,463,488,438,511,515,554],"l":[204,250,207,223,183,220,225,218,243,229],"m":[574,614,616,597,624,678,712,674],"n":[394,443,438,435,464,490,491,461,532,449],"o":[418,479,440,499,454,477,522,443,529],"p":[410,384,388,424,422,436,468,380,407],"q":[506,497,494,586,451,481,473],"r":[464,593,478,563,427,469,460,448],"s":[456,438,435,516,495,447,473],"t":[426,526,511,426,446,442,493],"u":[467,529,489,504,480,465,517,514,569],"v":[526,504,585,517,484,528,596],"w":[743,620,668,852,788,789,658,793,831],"x":[558,493,598,494,532,435,449,511],"y":[483,514,465,486,414,454,425,527,465],"z":[563,559,485,613,727,623,550,681],"{":[511,402],"|":[217,201],"}":[502,471],"~":[663,654],"\u00a2":[473,532],"\u00a3":[569,457],"\u00a5":[793,775],"\u00a7":[678],"\u00a8":[504,532,362],"\u00a9":[896,962],"\u00ae":[973],"\u00af":[439,502,380],"\u00b0":[381,339],"\u00b1":[838,916],"\u00b4":[295,288,368],"\u00b8":[325,318,400],"\u00c0":[561,499,499,523,510,533],"\u00c1":[561,499,499,523,510,533],"\u00c2":[561,499,499,523,510,533],"\u00c3":[561,499,499,523,510,533],"\u00c4":[561,499,499,523,510,533],"\u00c5":[561,499,499,523,510,533],"\u00c6":[776],"\u00c7":[537,523,511,525,604],"\u00c8":[492,432,428,479,555],"\u00c9":[492,432,428,479,555],"\u00ca":[492,432,428,479,555],"\u00cb":[492,432,428,479,555],"\u00cc":[653,625,534,699],"\u00cd":[653,625,534,699],"\u00ce":[653,625,534,699],"\u00cf":[653,625,534,699],"\u00d0":[982,971],"\u00d1":[622,543,684,682],"\u00d2":[640,691,662,675,605,704],"\u00d3":[640,691,662,675,605,704],"\u00d4":[640,691,662,675,605,704],"\u00d5":[640,691,662,675,605,704],"\u00d6":[640,691,662,675,605,704],"\u00d7":[501,611],"\u00d8":[921],"\u00d9":[613,652,702,735,658],"\u00da":[613,652,702,735,658],"\u00db":[613,652,702,735,658],"\u00dc":[613,652,702,735,658],"\u00dd":[599,667,600,718,537,586],"\u00de":[675,705],"\u00df":[590],"\u00e0":[448,447,437,407,382,438,427,422,479,425],"\u00e1":[448,447,437,407,382,438,427,422,479,425],"\u00e2":[448,447,437,407,382,438,427,422,479,425],"\u00e3":[448,447,437,407,382,438,427,422,479,425],"\u00e4":[448,447,437,407,382,438,427,422,479,425],"\u00e5":[448,447,437,407,382,438,427,422,479,425],"\u00e6":[680,568],"\u00e7":[471,455,435,467,484,527,433,457,542,434],"\u00e8":[421,438,466,434,440,493,486,472],"\u00e9":[421,438,466,434,440,493,486,472],"\u00ea":[421,438,466,434,440,493,486,472],"\u00eb":[421,438,466,434,440,493,486,472],"\u00ec":[223,240,193],"\u00ed":[223,240,193],"\u00ee":[223,240,193],"\u00ef":[223,240,193],"\u00f0":[595],"\u00f1":[394,443,438,435,464,490,491,461,532,449],"\u00f2":[418,479,440,499,454,477,522,443,529],"\u00f3":[418,479,440,499,454,477,522,443,529],"\u00f4":[418,479,440,499,454,477,522,443,529],"\u00f5":[418,479,440,499,454,477,522,443,529],"\u00f6":[418,479,440,499,454,477,522,443,529],"\u00f7":[653,746],"\u00f8":[702,652],"\u00f9":[467,529,489,504,480,465,517,514,569],"\u00fa":[467,529,489,504,480,465,517,514,569],"\u00fb":[467,529,489,504,480,465,517,514,569],"\u00fc":[467,529,489,504,480,465,517,514,569],"\u00fd":[483,514,465,486,414,454,425,527,465],"\u00fe":[505,673],"\u00ff":[483,514,465,486,414,454,425,527,465],"\u0110":[758],"\u0111":[789],"\u0130":[236],"\u0131":[223,240,193],"\u0141":[724],"\u0142":[371,360],"\u0152":[876],"\u0153":[882,898,862],"\u02c6":[470,492,380],"\u02c7":[472,540,398],"\u02d8":[428,435,465],"\u02d9":[238,252],"\u02da":[360,331,419],"\u02db":[364,377,317],"\u02dc":[551,615,474],"\u02dd":[431,427,358],"\u2013":[540,525,614],"\u2014":[820,771,1010],"\u2018":[227,237,210],"\u2019":[276,279,283,259,254,349],"\u201c":[402],"\u201d":[402,391,429],"\u2022":[352,293],"\u2026":[955,782,708],"\u20ac":[722],"\u2122":[1005,1008],"\u2260":[637,671]};
  var root = document.documentElement;
  var calm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var probe = document.createElement("video");
  var can = function (t) { return probe.canPlayType ? probe.canPlayType(t) : ""; };
  var fmt = can('video/mp4; codecs="avc1.42E01E"') ? "mp4" : (can('video/webm; codecs="vp9"') ? "webm" : "");

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function sum(p, q) { return p + q; }
  function newSeed() { return 1000 + Math.floor(Math.random() * 9000); }

  /* ---------- the arrangement ---------- */
  function arrange(items, fw, seed, home) {
    var R = rng(seed), last = {};
    function write(text) {
      /* each character takes one of its drawings, never the one it used last */
      return Array.from(text).map(function (c) {
        var n = W[c] ? W[c].length : 1, k = 0;
        if (n > 1) { do { k = Math.floor(R() * n); } while (k === last[c]); }
        last[c] = k;
        return { c: c, k: k };
      });
    }
    function adv(g) { var t = W[g.c]; return t ? (t[g.k] || t[0]) / 1000 : 0.8; }
    function runs(gl) {
      /* the unbreakable stretches between spaces, in em, with the space that follows each */
      var out = [{ w: 0, sp: 0 }];
      gl.forEach(function (g) {
        if (g.c === " ") { out[out.length - 1].sp = adv(g); out.push({ w: 0, sp: 0 }); }
        else out[out.length - 1].w += adv(g);
      });
      return out;
    }
    function lines(r, fs, width) {
      /* breaks at spaces the way the browser does, and never reports fewer lines than it draws */
      var n = 1, line = r[0].w * fs;
      for (var j = 1; j < r.length; j++) {
        var add = (r[j - 1].sp + r[j].w) * fs;
        if (line + add <= width - 2) line += add; else { n++; line = r[j].w * fs; }
      }
      return n;
    }
    function mono(text, width) {
      /* the record line under a title is Fragment Mono at 12px, 0.618 em per character */
      var cw = 7.416, ws = text.split(" "), n = 1, line = ws[0].length * cw;
      for (var j = 1; j < ws.length; j++) {
        var add = (1 + ws[j].length) * cw;
        if (line + add <= width - 2) line += add; else { n++; line = ws[j].length * cw; }
      }
      return n;
    }

    /* the front page keeps the works in their own order, newest first; a series is hung in any order */
    var list = items.slice();
    if (!home) for (var s = list.length - 1; s > 0; s--) { var o = Math.floor(R() * (s + 1)), sw0 = list[s]; list[s] = list[o]; list[o] = sw0; }
    var narrow = fw < 700;
    var P = home
      ? (narrow ? { Lmin: 112, Lmax: fw * 0.7, fill: [0.6, 0.32], fsImg: [17, 3], fsTxt: [28, 10], drop: 24, gap: [22, 30], G: 14, inset: 0, edge: 8, lh: 1.12, lean: 2.5 }
                : { Lmin: 120, Lmax: 330, fill: [0.5, 0.42], fsImg: [22, 6], fsTxt: [34, 12], drop: 64, gap: [36, 56], G: 36, inset: 18, edge: 0, lh: 1.12, lean: 2.5 })
      : (narrow ? { Lmin: 112, Lmax: fw * 0.8, fill: [0.62, 0.34], fsImg: [16, 2], fsTxt: [28, 10], drop: 26, gap: [20, 26], G: 14, inset: 0, edge: 8, lh: 1.15, lean: 2 }
                : { Lmin: 130, Lmax: 300, fill: [0.52, 0.42], fsImg: [18, 5], fsTxt: [34, 12], drop: 64, gap: [32, 54], G: 36, inset: 18, edge: 0, lh: 1.15, lean: 2 });
    var tilt = Math.sin(P.lean * Math.PI / 180);
    var drawn = list.map(function (it) {
      var g = write(it.t), rs = runs(g);
      return {
        it: it, g: g, r: rs,
        lw: rs.reduce(function (m, q) { return Math.max(m, q.w); }, 0),
        tw: rs.reduce(function (t, q) { return t + q.w + q.sp; }, 0)
      };
    });
    function need(d) {
      /* the narrowest share of a row a piece can have and still fit its longest word */
      var it = d.it;
      if (it.src) return Math.max(P.Lmin * Math.min(1, it.ar), P.fsImg[0] * d.lw + 8) + P.G;
      return P.fsTxt[0] * d.lw + 8 + P.G;
    }
    function place(row, width, y0, out) {
      /* one row: random shares of the width, random sizes and offsets inside each share */
      var needs = row.map(need);
      var spare = Math.max(0, width - needs.reduce(sum, 0));
      var wts = row.map(function () { return 0.7 + R() * 0.9; });
      var tot = wts.reduce(sum, 0);
      /* on a phone the wall keeps 8px clear at its left, more than a tilt can swing a title out past its
         box; elsewhere each piece's own inset does that */
      var x0 = P.edge, rowH = 0;
      row.forEach(function (d, j) {
        var it = d.it, seg = needs[j] + spare * wts[j] / tot, room = seg - P.G, w, fs, used, bh;
        if (it.src) {
          var m = Math.min(1, it.ar);
          var L = Math.min(Math.max(room * (P.fill[0] + R() * P.fill[1]), P.Lmin, (P.fsImg[0] * d.lw + 8) / m), P.Lmax);
          w = Math.floor(Math.min(L * m, room));
          fs = Math.min(P.fsImg[0] + Math.round(R() * P.fsImg[1]), Math.floor((w - 8) / d.lw));
          bh = lines(d.r, fs, w) * fs * P.lh;
          used = w / it.ar + 10 + bh + (it.m ? Math.max(6 + mono(it.m, w) * 16.8, w * tilt) : w * tilt + 6);
        } else {
          fs = Math.min(P.fsTxt[0] + Math.round(R() * P.fsTxt[1]), Math.floor((room - 8) / d.lw));
          w = Math.floor(Math.min(room, Math.max(fs * d.tw * (0.55 + R() * 0.5), fs * d.lw + 8)));
          bh = lines(d.r, fs, w) * fs * P.lh;
          used = 10 + bh + (it.m ? Math.max(6 + mono(it.m, w) * 16.8, w * tilt) : w * tilt + 6);
        }
        var top = y0 + R() * P.drop;
        var x = Math.round(x0 + P.inset + R() * Math.max(0, room - w));
        var rot = (R() - 0.5) * 2 * P.lean;
        /* a title that tilts up toward its picture moves down by whatever the 10px gap under the picture
           can't take, so its letters stay at least 3px clear of the picture */
        var lift = it.src && rot < 0 ? Math.max(0, Math.ceil(w * Math.sin(-rot * Math.PI / 180)) - 7) : 0;
        out.push({ d: d, w: w, fs: fs, lh: P.lh, x: x, y: Math.round(top), rot: rot.toFixed(2), lift: lift });
        rowH = Math.max(rowH, top - y0 + lift + used + 4);
        x0 += seg;
      });
      return rowH;
    }

    /* on the front page of a wide screen, the wall starts beside the bio: two or three works to its right */
    var side = [], sideH = 0, bioW = 0, rest = drawn;
    if (home && fw >= 900) {
      bioW = Math.min(640, Math.round(fw * 0.47));
      var sw = fw - bioW - 56;
      var kb = 3;
      while (kb > 1 && drawn.slice(0, kb).map(need).reduce(sum, 0) > sw) kb--;
      sideH = Math.ceil(place(drawn.slice(0, kb), sw, 0, side));
      rest = drawn.slice(kb);
    }

    /* a set number of rows, so the wall keeps a steady height while everything in it moves */
    var kLo = Math.max(2, Math.min(4, Math.floor(fw / 300)));
    var sizes = [], q;
    if (narrow) {
      var singles = rest.length % 2 ? 1 : 2;
      if (singles > rest.length) singles = rest.length;
      for (q = 0; q < (rest.length - singles) / 2; q++) sizes.push(2);
      for (q = 0; q < singles; q++) sizes.splice(Math.floor(R() * (sizes.length + 1)), 0, 1);
    } else {
      var rows = Math.max(1, Math.round(rest.length / (kLo + 0.5))), base = Math.floor(rest.length / rows);
      for (q = 0; q < rows; q++) sizes.push(base + (q < rest.length - base * rows ? 1 : 0));
      for (q = sizes.length - 1; q > 0; q--) { var u = Math.floor(R() * (q + 1)), v = sizes[q]; sizes[q] = sizes[u]; sizes[u] = v; }
    }
    var cells = [], y = 0, i = 0, ri = 0;
    while (i < rest.length) {
      var want = sizes[ri] || rest.length - i;
      var k = Math.min(want, rest.length - i);
      while (k > 1 && rest.slice(i, i + k).map(need).reduce(sum, 0) > fw - P.edge) k--;
      if (k < want) { if (ri + 1 < sizes.length) sizes[ri + 1] += want - k; else sizes.push(want - k); }
      ri++;
      var rowH = place(rest.slice(i, i + k), fw - P.edge, y, cells);
      i += k;
      y += rowH + P.gap[0] + R() * P.gap[1];
    }
    return { side: side, sideH: sideH, bioW: bioW, cells: cells, height: Math.ceil(y) };
  }

  /* ---------- drawing it ---------- */
  var watching = [];
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (!v.getAttribute("poster")) v.poster = v.getAttribute("data-poster");
        if (!v.getAttribute("src")) v.src = v.getAttribute("data-src");
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else if (!v.paused) v.pause();
    });
  }, { rootMargin: "200px 0px" }) : null;

  function inked(g) {
    var ink = document.createElement("span");
    ink.className = "hw-ink";
    ink.setAttribute("aria-hidden", "true");
    g.forEach(function (x) {
      var s = document.createElement("span");
      if (x.k) s.className = "v" + x.k;
      s.textContent = x.c;
      ink.appendChild(s);
    });
    return ink;
  }
  function plain(text) {
    var s = document.createElement("span");
    s.className = "vh";
    s.textContent = text;
    return s;
  }
  function still(it) {
    var img = document.createElement("img");
    img.alt = "";
    img.width = it.w;
    img.height = it.h;
    img.loading = "lazy";
    img.decoding = "async";
    if (it.px) img.className = "pixelated";
    img.src = it.src;
    return img;
  }
  function moving(it) {
    var v = document.createElement("video");
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    ["muted", "loop", "playsinline"].forEach(function (a) { v.setAttribute(a, ""); });
    v.setAttribute("preload", "none");
    v.setAttribute("aria-hidden", "true");
    v.width = it.w;
    v.height = it.h;
    /* its first frame and its file load only as it nears the screen, so a long wall stays light */
    v.setAttribute("data-poster", it.src);
    v.setAttribute("data-src", it[fmt]);
    if (io) { io.observe(v); watching.push(v); }
    else { v.poster = it.src; v.src = it[fmt]; v.autoplay = true; }
    return v;
  }
  function moves(it) { return !calm && !!fmt && !!it[fmt]; }
  function draw(box, cells, make) {
    while (box.firstChild) box.removeChild(box.firstChild);
    cells.forEach(function (c) {
      var cell = document.createElement("div");
      cell.className = "cell";
      cell.style.left = c.x + "px";
      cell.style.top = c.y + "px";
      cell.style.width = c.w + "px";
      cell.appendChild(make(c));
      box.appendChild(cell);
    });
  }
  function caption(c) {
    var cap = inked(c.d.g);
    cap.classList.add("cap");
    cap.style.fontSize = c.fs + "px";
    cap.style.lineHeight = c.lh;
    cap.style.transform = "rotate(" + c.rot + "deg)";
    if (c.lift) cap.style.marginTop = 10 + c.lift + "px";
    return cap;
  }

  /* a work on the front page: its still or its loop, its title in the hand, its year and size in the log */
  function workCell(c) {
    var it = c.d.it;
    var link = document.createElement("a");
    link.className = "it";
    link.href = it.href;
    link.appendChild(moves(it) ? moving(it) : still(it));
    link.appendChild(plain(it.t));
    link.appendChild(caption(c));
    if (it.m) {
      var meta = document.createElement("span");
      meta.className = "meta";
      meta.textContent = it.m;
      link.appendChild(meta);
    }
    return link;
  }

  function onResize(main, render) {
    var w = main.clientWidth, t = null;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () { if (main.clientWidth !== w) { w = main.clientWidth; render(); } }, 150);
    });
  }

  function forget() {
    if (io) watching.forEach(function (v) { io.unobserve(v); });
    watching = [];
  }

  /* ---------- the front page ---------- */
  function home(main) {
    var data = JSON.parse(main.querySelector(".wall-data").textContent);
    var items = data.map(function (d) { var x = {}; for (var k in d) x[k] = d[k]; if (d.w) x.ar = d.w / d.h; return x; });
    var bio = main.querySelector(".bio"), side = main.querySelector(".side"), wall = main.querySelector(".wall");
    var seed = newSeed();
    function render() {
      forget();
      var L = arrange(items, main.clientWidth, seed, true);
      bio.style.width = L.bioW ? L.bioW + "px" : "";
      side.hidden = !L.side.length;
      side.style.height = L.sideH + "px";
      draw(side, L.side, workCell);
      wall.style.height = L.height + "px";
      draw(wall, L.cells, workCell);
      wall.hidden = false;
      root.classList.add("wall-ready");
    }
    render();
    onResize(main, render);
  }

  /* ---------- a series: the whole of it under the frame ---------- */
  function series(main, set) {
    var fig = main.querySelector(".series");
    if (!fig) return;
    var list = JSON.parse(fig.querySelector(".series-data").textContent);
    var base = fig.getAttribute("data-base") || "";
    /* a moving work hangs as a light loop of its own, with its first frame as the still; a live work,
       which has no still in the frame, hangs as the picture chosen for it (its still or its loop) */
    var items = list.map(function (d, k) {
      var x = { t: d.title, src: base + (d.small || d.src || d.poster), w: d.w, h: d.h, idx: k };
      if (d.still) { x.src = base + d.still.src; x.w = d.still.w; x.h = d.still.h; }
      if (d.loop) {
        x.src = base + d.loop.poster; x.mp4 = base + d.loop.mp4; x.webm = base + d.loop.webm;
        if (d.loop.w) { x.w = d.loop.w; x.h = d.loop.h; }
      }
      x.ar = x.w / x.h;
      return x;
    });
    var wall = set.querySelector(".wall");
    var seed = newSeed();
    function current() { return fig.seriesCurrent ? fig.seriesCurrent() : 0; }
    function mark() {
      var picks = wall.querySelectorAll(".pick"), now = current();
      for (var j = 0; j < picks.length; j++) picks[j].setAttribute("aria-current", +picks[j].getAttribute("data-idx") === now ? "true" : "false");
    }
    function pickCell(c) {
      var it = c.d.it;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pick";
      b.setAttribute("data-idx", it.idx);
      b.appendChild(moves(it) ? moving(it) : still(it));
      b.appendChild(plain(it.t));
      b.appendChild(caption(c));
      b.addEventListener("click", function () {
        var e;
        try { e = new CustomEvent("series:show", { detail: { index: it.idx } }); }
        catch (x) { e = document.createEvent("CustomEvent"); e.initCustomEvent("series:show", false, false, { index: it.idx }); }
        fig.dispatchEvent(e);
        try { window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" }); } catch (x) { window.scrollTo(0, 0); }
      });
      return b;
    }
    function render() {
      forget();
      var L = arrange(items, main.clientWidth, seed, false);
      wall.style.height = L.height + "px";
      draw(wall, L.cells, pickCell);
      mark();
      set.hidden = false;
    }
    fig.addEventListener("series:change", mark);
    render();
    onResize(main, render);
  }

  try {
    var main = document.getElementById("main");
    if (main && main.querySelector(".wall-data")) home(main);
    var set = main && main.querySelector(".set");
    if (set) series(main, set);
  } catch (e) {
    root.classList.remove("walled");
    if (window.console) console.error(e);
  }
})();
