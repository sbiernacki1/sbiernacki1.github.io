/* copy.js
   A Copy button copies the words it sits with. In Attestations, each work's check: the instruction
   and the line together, as the attestation says to paste them into an AI that can run code. Where
   the browser won't copy, the words are selected instead, ready to copy by hand. Without JavaScript
   there is no button, and the words can be selected as usual. Nothing is stored and nothing is sent. */
(function () {
  var buttons = document.querySelectorAll(".copy");
  for (var i = 0; i < buttons.length; i++) setup(buttons[i]);

  function setup(b) {
    var parts = b.parentNode.querySelectorAll(".paste-prompt, pre");
    if (!parts.length) return;
    var timer = 0;
    b.hidden = false;

    function say(t) {
      b.textContent = t;
      clearTimeout(timer);
      timer = setTimeout(function () { b.textContent = "Copy"; }, 2400);
    }

    function select() {
      var r = document.createRange();
      r.setStartBefore(parts[0]);
      r.setEndAfter(parts[parts.length - 1]);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      say("Selected, ready to copy");
    }

    b.addEventListener("click", function () {
      var text = [].map.call(parts, function (p) { return p.textContent; }).join("\n\n");
      try { navigator.clipboard.writeText(text).then(function () { say("Copied"); }, select); }
      catch (e) { select(); }
    });
  }
})();
