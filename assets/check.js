/* "Is v2 really better?" — the judge-only rule from wrong-winner's checker.py
   (github.com/ishaan-jain-ai/wrong-winner), ported to run in the browser.
   Each item scores from v2's side: win 1, tie 0.5, loss 0. The judge's win rate gets a
   Student's t 95% interval, and the judge alone only names a winner when it is 30+ points
   from a tie, because in the study judges reached 26 points on pairs people saw as ties. */
(function (root) {
  "use strict";

  var CLEAR_GAP = 0.30, TIE_GAP_SEEN = 26, MIN_ITEMS = 10, START_LABELS = 25;
  var Z95 = 1.959963984540054;

  function lgamma(x) {
    var c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
      1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
    x -= 1;
    var a = c[0], t = x + 7.5;
    for (var i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }

  function betaCf(a, b, x) {
    var tiny = 1e-300, c = 1, d = 1 - (a + b) * x / (a + 1);
    d = 1 / (Math.abs(d) > tiny ? d : tiny);
    var h = d;
    for (var m = 1; m < 300; m++) {
      var nums = [m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m)),
        -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1))];
      for (var j = 0; j < 2; j++) {
        d = 1 + nums[j] * d;
        d = 1 / (Math.abs(d) > tiny ? d : tiny);
        c = 1 + nums[j] / c;
        c = Math.abs(c) > tiny ? c : tiny;
        h *= c * d;
      }
      if (Math.abs(c * d - 1) < 1e-15) break;
    }
    return h;
  }

  function betaInc(a, b, x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var front = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log1p(-x));
    if (x < (a + 1) / (a + b + 2)) return front * betaCf(a, b, x) / a;
    return 1 - front * betaCf(b, a, 1 - x) / b;
  }

  function tCdf(t, df) {
    var tail = 0.5 * betaInc(df / 2, 0.5, df / (df + t * t));
    return t > 0 ? 1 - tail : tail;
  }

  var tCache = {};
  function tValue(df) {
    if (tCache[df]) return tCache[df];
    var target = 0.975, lo = 0, hi = 1;
    while (tCdf(hi, df) < target) hi *= 2;
    for (var i = 0; i < 200; i++) {
      var mid = (lo + hi) / 2;
      if (tCdf(mid, df) < target) lo = mid; else hi = mid;
      if (hi - lo < 1e-12) break;
    }
    return (tCache[df] = (lo + hi) / 2);
  }

  function wilson(successes, n) {
    var z = Z95, p = successes / n, denom = 1 + z * z / n;
    var center = (p + z * z / (2 * n)) / denom;
    var half = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denom;
    return { value: p, low: Math.max(0, center - half), high: Math.min(1, center + half) };
  }

  function judgeInterval(wins, ties, losses) {
    var n = wins + ties + losses;
    var mean = (wins + 0.5 * ties) / n;
    var ss = wins * (1 - mean) * (1 - mean) + ties * (0.5 - mean) * (0.5 - mean) + losses * mean * mean;
    var variance = n < 2 ? 0 : ss / (n - 1);
    var half = (n >= 2 ? tValue(n - 1) : Z95) * Math.sqrt(variance / n);
    var est = { value: mean, low: mean - half, high: mean + half };
    if (est.low === est.high && (mean === 0 || mean === 1)) return wilson(Math.round(mean * n), n);
    return est;
  }

  function call(est) {
    return est.low > 0.5 ? "b_better" : est.high < 0.5 ? "a_better" : "no_difference";
  }

  function check(wins, ties, losses) {
    var n = wins + ties + losses;
    if (!(n > 0)) return null;
    var judge = judgeInterval(wins, ties, losses), result;
    if (n < MIN_ITEMS) {
      result = "too_few_items";
    } else {
      var c = call(judge);
      result = (c === "no_difference" || Math.abs(judge.value - 0.5) >= CLEAR_GAP) ? c : "not_proven";
    }
    return { items: n, judge: judge, result: result };
  }

  function pct(x) { return (x * 100).toFixed(1) + "%"; }

  function describe(r) {
    var gap = Math.abs(r.judge.value - 0.5) * 100;
    var gapText = gap.toFixed(0) + " point" + (gap.toFixed(0) === "1" ? "" : "s");
    var next = "Label " + START_LABELS + " items picked at random, without looking at the judge’s verdicts, and check again.";
    var out = { kind: "unsure", stamp: "", line: "", why: [] };
    out.line = "The judge has v2 winning " + pct(r.judge.value) + " of " + r.items +
      " items (ties count half; 95% interval " + pct(Math.max(0, r.judge.low)).replace("%", "") + "–" + pct(Math.min(1, r.judge.high)) + ").";
    if (r.result === "b_better" || r.result === "a_better") {
      out.kind = "good";
      out.stamp = (r.result === "b_better" ? "v2" : "v1") + " is better";
      out.why = ["The judge is " + gapText + " from a tie. In my study, judges never went further than " +
        TIE_GAP_SEEN + " points from a tie on pairs people saw as ties, and gaps this wide came from pairs people could clearly separate.",
        START_LABELS + " random human labels would confirm it."];
    } else if (r.result === "not_proven") {
      out.kind = "warn";
      out.stamp = "Not proven";
      out.why = ["The judge favours " + (r.judge.value > 0.5 ? "v2" : "v1") + " by " + gapText +
        " and its interval excludes a tie, but that isn’t enough. In my study, on pairs people saw as ties, judges went up to " +
        TIE_GAP_SEEN + " points from a tie and named a winner on 5 to 7 of 15 pairs.",
        "More test items won’t fix this; human labels will. " + next];
    } else if (r.result === "no_difference") {
      out.kind = "flat";
      out.stamp = "No measurable difference";
      out.why = ["Even the judge can’t separate v1 and v2 on these items.", next];
    } else {
      out.kind = "flat";
      out.stamp = "Too few items";
      out.line = "";
      out.why = ["Only " + r.items + " item" + (r.items === 1 ? " has" : "s have") + " a judge verdict; at least " + MIN_ITEMS + " are needed."];
    }
    return out;
  }

  var api = { check: check, describe: describe, tValue: tValue };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.wrongWinner = api;

  // Wire up the form on the page, if there is one.
  if (typeof document === "undefined") return;
  function ready(fn) {
    if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn);
  }
  ready(function () {
    var form = document.getElementById("check");
    if (!form) return;
    var inputs = { w: form.querySelector("[name=wins]"), t: form.querySelector("[name=ties]"), l: form.querySelector("[name=losses]") };
    var stamp = form.querySelector(".stamp"), line = form.querySelector(".verdict-line"), why = form.querySelector(".verdict-why");
    var total = form.querySelector(".check-total");

    function num(el) {
      var v = parseInt(el.value, 10);
      return isNaN(v) || v < 0 ? 0 : Math.min(v, 100000);
    }
    function render() {
      var w = num(inputs.w), t = num(inputs.t), l = num(inputs.l), n = w + t + l;
      total.textContent = n === 1 ? "That’s 1 item." : "That’s " + n + " items.";
      var r = check(w, t, l);
      if (!r) {
        stamp.textContent = "Waiting for numbers";
        stamp.dataset.kind = "flat";
        line.textContent = "";
        why.textContent = "Fill in how the judge voted on your test items.";
        return;
      }
      var d = describe(r);
      stamp.textContent = d.stamp;
      stamp.dataset.kind = d.kind;
      line.textContent = d.line;
      why.textContent = d.why.join(" ");
    }
    form.addEventListener("input", render);
    form.addEventListener("submit", function (e) { e.preventDefault(); render(); });
    Array.prototype.forEach.call(form.querySelectorAll("[data-set]"), function (btn) {
      btn.addEventListener("click", function () {
        var v = btn.getAttribute("data-set").split(",");
        inputs.w.value = v[0]; inputs.t.value = v[1]; inputs.l.value = v[2];
        render();
      });
    });
    render();
  });
})(typeof window !== "undefined" ? window : globalThis);
