/* theme.js
   Light or dark. The site follows the device's own setting until a visitor chooses with the
   Dark/Light word in the header. The choice is kept in this browser only, so it holds from page to
   page and visit to visit; nothing is sent. The stylesheet does the rest: which word shows, and
   every color. A small script in each page's head applies a saved choice before anything is drawn,
   so a page never flashes the wrong way. */
(function () {
  var root = document.documentElement;
  var button = document.querySelector(".theme-toggle");
  var night = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var paper = { light: "#FAFAF8", dark: "#1C1B18" };

  function current() {
    var chosen = root.getAttribute("data-theme");
    if (chosen === "dark" || chosen === "light") return chosen;
    return night && night.matches ? "dark" : "light";
  }

  /* the phone's own bar matches the page */
  function tint() {
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) metas[i].setAttribute("content", paper[current()]);
  }

  if (button) {
    button.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      tint();
    });
  }
  if (night) {
    if (night.addEventListener) night.addEventListener("change", tint);
    else if (night.addListener) night.addListener(tint);
  }
  tint();
})();
