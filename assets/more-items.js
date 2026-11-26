/* The wrong-winner finding as something to click: on the 15 close LMArena pairs, how often does
   a simulated eval name a winner people don't back? Numbers are from the study's
   results/phase2/analysis/summary.csv (2,000 simulated evals per pair and setting). */
(function () {
  "use strict";
  var JUDGES = ["Qwen3 8B", "Gemma 4 31B", "Nemotron 3 Ultra", "Mistral Large 4"];
  var STEPS = {
    n25: { judges: [0.2598, 0.216, 0.2416, 0.1782], people: 0.0775,
      note: "25 items, judge alone." },
    n50: { judges: [0.3799, 0.3284, 0.374, 0.2817], people: 0.1033,
      note: "50 items, judge alone. More items, more invented winners." },
    n80: { judges: [0.4637, 0.415, 0.4334, 0.3834], people: 0.1421,
      note: "80 items, judge alone. The interval shrinks, the judge’s lean doesn’t, and the lean starts to look like a real win." },
    k10: { judges: [0.0655, 0.069, 0.0658, 0.0683], people: null,
      note: "80 items plus 10 human labels on the same comparison, combined with PPI++." },
    k25: { judges: [0.0798, 0.0824, 0.0797, 0.0825], people: null,
      note: "80 items plus 25 human labels on the same comparison, combined with PPI++. This is what I’d do." }
  };
  var SCALE = 0.5; // bars run from 0 to 50%

  function ready(fn) {
    if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var fig = document.getElementById("more");
    if (!fig) return;
    var buttons = fig.querySelectorAll("[data-step]");
    var big = fig.querySelector(".more-num"), note = fig.querySelector(".more-note"), bars = fig.querySelector(".bars");

    function row(label, value, extra) {
      var li = document.createElement("li");
      li.className = "bar" + (extra ? " " + extra : "");
      var name = document.createElement("span");
      name.className = "bar-name";
      name.textContent = label;
      var track = document.createElement("span");
      track.className = "bar-track";
      var fill = document.createElement("span");
      fill.className = "bar-fill";
      fill.style.width = Math.min(100, value / SCALE * 100) + "%";
      track.appendChild(fill);
      var val = document.createElement("span");
      val.className = "bar-val";
      val.textContent = Math.round(value * 100) + "%";
      li.appendChild(name); li.appendChild(track); li.appendChild(val);
      return li;
    }

    function show(key) {
      var s = STEPS[key];
      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute("aria-checked", b.getAttribute("data-step") === key ? "true" : "false");
      });
      var avg = s.judges.reduce(function (a, b) { return a + b; }, 0) / s.judges.length;
      big.textContent = Math.round(avg * 100);
      note.textContent = s.note;
      bars.textContent = "";
      s.judges.forEach(function (v, i) { bars.appendChild(row(JUDGES[i], v)); });
      if (s.people !== null) bars.appendChild(row("People’s votes, same items", s.people, "people"));
    }

    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener("click", function () { show(b.getAttribute("data-step")); });
    });
    fig.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var list = Array.prototype.slice.call(buttons);
      var i = list.findIndex(function (b) { return b.getAttribute("aria-checked") === "true"; });
      i = (i + (e.key === "ArrowRight" ? 1 : list.length - 1)) % list.length;
      list[i].focus();
      show(list[i].getAttribute("data-step"));
      e.preventDefault();
    });
    show("n80");
  });
})();
