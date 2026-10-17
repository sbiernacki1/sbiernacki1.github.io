/* hand.js
   Stephen Hand keeps between one and ten drawings of each character: the default plus stylistic
   sets ss01–ss09. VERSIONS lists the distinct drawings per character (generated from the font file,
   Stephen Hand 0.940), so every drawing he kept is equally likely and a character never
   repeats the drawing it used last. Every page load writes the page out fresh.
   The digit 1 is left out on purpose: only its default drawing has a flag, and the others read as an l.
   Nothing is stored and nothing is sent: the randomness never leaves the browser.
   Screen readers and copy/paste get the plain text; the drawn letters are aria-hidden.
   The last two words of each paragraph are kept on one line, so no paragraph ends on a word alone. */
(function () {
  var VERSIONS = {"!":"012","#":"012","$":"01","%":"012","(":"012",")":"012","*":"012","+":"012",",":"0123456","-":"012345",".":"0123456","/":"01","0":"0123","2":"0123","3":"01234","4":"01234","5":"01234","6":"0123","7":"012","8":"0123","9":"012",":":"012",";":"012",">":"01","?":"01","@":"01","A":"012345","B":"0123","C":"01234","D":"012345","E":"01234","F":"01234","G":"01234","H":"01234","I":"0123","J":"01234","K":"012345","L":"01234","M":"01234","N":"0123","O":"012345","P":"01234","Q":"01234","R":"012345","S":"0123","T":"0123","U":"01234","V":"01234","W":"012345","X":"01234","Y":"012345","Z":"0123","[":"01","\\":"01","]":"01","^":"01","_":"01","`":"01234","a":"0123456789","b":"0123456789","c":"0123456789","d":"01234567","e":"01234567","f":"012345678","g":"012345678","h":"0123456","i":"0123456789","j":"012345678","k":"01234567","l":"0123456789","m":"01234567","n":"0123456789","o":"012345678","p":"012345678","q":"0123456","r":"01234567","s":"0123456","t":"0123456","u":"012345678","v":"0123456","w":"012345678","x":"01234567","y":"012345678","z":"01234567","{":"01","|":"01","}":"01","~":"01","\u00a2":"01","\u00a3":"01","\u00a5":"01","\u00a8":"012","\u00a9":"01","\u00af":"012","\u00b0":"01","\u00b1":"01","\u00b4":"012","\u00b8":"012","\u00c0":"012345","\u00c1":"012345","\u00c2":"012345","\u00c3":"012345","\u00c4":"012345","\u00c5":"012345","\u00c7":"01234","\u00c8":"01234","\u00c9":"01234","\u00ca":"01234","\u00cb":"01234","\u00cc":"0123","\u00cd":"0123","\u00ce":"0123","\u00cf":"0123","\u00d0":"01","\u00d1":"0123","\u00d2":"012345","\u00d3":"012345","\u00d4":"012345","\u00d5":"012345","\u00d6":"012345","\u00d7":"01","\u00d9":"01234","\u00da":"01234","\u00db":"01234","\u00dc":"01234","\u00dd":"012345","\u00de":"01","\u00e0":"0123456789","\u00e1":"0123456789","\u00e2":"0123456789","\u00e3":"0123456789","\u00e4":"0123456789","\u00e5":"0123456789","\u00e6":"01","\u00e7":"0123456789","\u00e8":"01234567","\u00e9":"01234567","\u00ea":"01234567","\u00eb":"01234567","\u00ec":"012","\u00ed":"012","\u00ee":"012","\u00ef":"012","\u00f1":"0123456789","\u00f2":"012345678","\u00f3":"012345678","\u00f4":"012345678","\u00f5":"012345678","\u00f6":"012345678","\u00f7":"01","\u00f8":"01","\u00f9":"012345678","\u00fa":"012345678","\u00fb":"012345678","\u00fc":"012345678","\u00fd":"012345678","\u00fe":"01","\u00ff":"012345678","\u0131":"012","\u0142":"01","\u0153":"012","\u02c6":"012","\u02c7":"012","\u02d8":"012","\u02d9":"01","\u02da":"012","\u02db":"012","\u02dc":"012","\u02dd":"012","\u2013":"012","\u2014":"012","\u2018":"012","\u2019":"012345","\u201d":"012","\u2022":"01","\u2026":"012","\u2122":"01","\u2260":"01"};
  var last = Object.create(null);

  function pick(ch) {
    var opts = VERSIONS[ch], k;
    if (!opts) return 0;
    do { k = +opts.charAt(Math.floor(Math.random() * opts.length)); } while (k === last[ch]);
    last[ch] = k;
    return k;
  }

  function skipped(node, root) {
    for (var el = node.parentNode; el && el !== root; el = el.parentNode) {
      if (el.nodeType === 1 && (el.classList.contains("mono") || el.classList.contains("vh") ||
          el.classList.contains("hw") || el.classList.contains("ph") || el.hasAttribute("data-plain"))) return true;
    }
    return false;
  }

  function ink(text, tie) {
    var out = document.createElement("span");
    out.className = "hw-ink";
    out.setAttribute("aria-hidden", "true");
    var chars = Array.from(text.replace(/\s+/g, " ")), from = chars.length, into = out;
    if (tie) {
      var end = chars.length;
      while (end > 0 && chars[end - 1] === " ") end--;
      var gap = chars.lastIndexOf(" ", end - 1);
      if (gap > 0) from = chars.lastIndexOf(" ", gap - 1) + 1;
    }
    for (var i = 0; i < chars.length; i++) {
      if (i === from) {
        into = document.createElement("span");
        into.className = "hw-keep";
        out.appendChild(into);
      }
      var s = document.createElement("span"), k = pick(chars[i]);
      if (k) s.className = "v" + k;
      s.textContent = chars[i];
      into.appendChild(s);
    }
    return out;
  }

  function paragraph(node) {
    return node.parentNode && node.parentNode.closest ? node.parentNode.closest("p") : null;
  }

  function write(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walker.nextNode())) {
      if (/\S/.test(n.nodeValue) && !skipped(n, root)) nodes.push(n);
    }
    var closing = new Map();
    for (var i = 0; i < nodes.length; i++) {
      var p = paragraph(nodes[i]);
      if (p) closing.set(p, nodes[i]);
    }
    for (var i = 0; i < nodes.length; i++) {
      var t = nodes[i], wrap = document.createElement("span"), plain = document.createElement("span");
      var tie = closing.get(paragraph(t)) === t;
      wrap.className = "hw";
      plain.className = "hw-sr";
      plain.textContent = t.nodeValue;
      wrap.appendChild(plain);
      wrap.appendChild(ink(t.nodeValue, tie));
      t.parentNode.replaceChild(wrap, t);
    }
    root.classList.add("is-written");
    var inner = root.querySelectorAll(".hand");
    for (var j = 0; j < inner.length; j++) inner[j].classList.add("is-written");
  }

  window.writeHand = function (scope) {
    var roots = (scope || document).querySelectorAll(".hand:not(.is-written)");
    for (var i = 0; i < roots.length; i++) {
      var r = roots[i];
      if (r.classList.contains("is-written")) continue;
      if (r.parentElement && r.parentElement.closest(".hand")) continue;
      write(r);
    }
  };

  if (!window.__HAND_MANUAL__) window.writeHand();
})();
