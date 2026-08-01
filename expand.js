/* Commit-message expanders.
 *
 * CSS clamps every message to --msg-clamp lines inside a <details>. Without JS
 * that still works, but every row would advertise a "show more" chip even when
 * the message fits. This measures each collapsed message and marks only the
 * ones actually being cut off, so the affordance appears where it means
 * something. Re-measures on resize because the clamp point moves with width.
 */
(function () {
  "use strict";

  var items = Array.prototype.slice.call(
    document.querySelectorAll(".msg-x")
  );
  if (!items.length) return;

  function sync() {
    for (var i = 0; i < items.length; i++) {
      var details = items[i];
      // Only measurable while collapsed; an open row keeps the class it had.
      if (details.open) continue;
      var text = details.querySelector(".msg-text");
      if (!text) continue;
      var clipped = text.scrollHeight - text.clientHeight > 1;
      details.classList.toggle("is-clamped", clipped);
    }
  }

  // A message that isn't cut off has nothing to reveal — swallow the toggle so
  // clicking the text doesn't silently reflow it.
  document.addEventListener("click", function (e) {
    var summary = e.target.closest && e.target.closest(".msg-x > summary");
    if (!summary) return;
    var details = summary.parentNode;
    if (!details.open && !details.classList.contains("is-clamped")) {
      e.preventDefault();
    }
  });

  var pending = null;
  function syncSoon() {
    if (pending) cancelAnimationFrame(pending);
    pending = requestAnimationFrame(function () {
      pending = null;
      sync();
    });
  }

  sync();
  window.addEventListener("resize", syncSoon);
  // Webfont swap changes line heights after first paint.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(sync);
  }
})();
