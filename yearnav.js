/* Year navigator — scrollspy + sheet dismissal.
 *
 * The rail, the pill and the jump sheet are all server-rendered links and all
 * work without this file; the page just marks the newest year it holds as the
 * active one and leaves it there. This tracks which year the reader is actually
 * over and moves the highlight (and the mobile pill's label) to match, then
 * closes the sheet once a year has been picked.
 */
(function () {
  "use strict";

  var links = Array.prototype.slice.call(
    document.querySelectorAll("[data-year-link]")
  );
  // Month-group headings, in document order — newest year first.
  var groups = Array.prototype.slice.call(
    document.querySelectorAll("[data-year]")
  );
  if (!links.length || !groups.length) return;

  var labels = Array.prototype.slice.call(
    document.querySelectorAll("[data-year-current]")
  );

  // How far down the viewport counts as "being read". Anything above this line
  // has been scrolled past. Set clear of the mobile sticky bar (~46px) so the
  // year under the bar isn't the one reported as current.
  var READ_LINE = 140;

  var active = null;

  function yearInView() {
    var year = groups[0].getAttribute("data-year");
    for (var i = 0; i < groups.length; i++) {
      if (groups[i].getBoundingClientRect().top > READ_LINE) break;
      year = groups[i].getAttribute("data-year");
    }
    return year;
  }

  function sync() {
    var year = yearInView();
    if (year === active) return;
    active = year;
    for (var i = 0; i < links.length; i++) {
      var isActive = links[i].getAttribute("data-year-link") === year;
      links[i].classList.toggle("is-active", isActive);
      if (isActive) links[i].setAttribute("aria-current", "location");
      else links[i].removeAttribute("aria-current");
    }
    for (var j = 0; j < labels.length; j++) {
      labels[j].textContent = year;
    }
  }

  var pending = null;
  function syncSoon() {
    if (pending) return;
    pending = requestAnimationFrame(function () {
      pending = null;
      sync();
    });
  }

  function closeSheets() {
    var open = document.querySelectorAll(".year-sheet[open]");
    for (var i = 0; i < open.length; i++) open[i].open = false;
  }

  // Picking a year is the end of the sheet's job — get it out of the way before
  // the scroll (or page load) it triggers.
  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("[data-year-link]");
    if (link) closeSheets();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSheets();
  });

  sync();
  window.addEventListener("scroll", syncSoon, { passive: true });
  window.addEventListener("resize", syncSoon);
})();
