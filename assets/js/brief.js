(function () {
  var CATS = window.CATS || [];
  var byId = {}, byTag = {};
  CATS.forEach(function (c) { byId[c.id] = c; byTag[c.tag] = c; });

  var SEV = ["critical", "high", "medium", "low", "exploited", "zero-day", "kev", "poc", "patch", "update"];

  // 1. Turn `CRITICAL`, `EXPLOITED`, `#vuln` … code spans into badges
  document.querySelectorAll("[data-brief] code").forEach(function (el) {
    var t = el.textContent.trim(), k = t.toLowerCase();
    if (SEV.indexOf(k) !== -1) {
      el.className = "badge b-" + k;
    } else if (/^#[\w-]+$/.test(t)) {
      var cat = byTag[k.slice(1)];
      el.className = "badge b-tag" + (cat ? " cat-" + cat.id : "");
      if (cat) el.style.setProperty("--tagc", "var(--c-" + cat.id + ")");
    }
  });

  // 2. Colour sections, build the chip bar with item counts
  document.querySelectorAll("[data-brief]").forEach(function (root) {
    var chips = root.parentElement.querySelector("[data-chips]");
    root.querySelectorAll("h2[id]").forEach(function (h) {
      var c = byId[h.id];
      if (!c) return;
      h.classList.add("cat-" + c.id, "sec-" + c.id);
      var list = h.nextElementSibling;
      while (list && list.tagName !== "H2") {
        if (list.tagName === "UL") list.classList.add("cat-" + c.id);
        if (c.id === "sources" && list.tagName === "UL") list.classList.add("sources-list");
        list = list.nextElementSibling;
      }
      if (chips && c.id !== "sources") {
        var n = 0, s = h.nextElementSibling;
        while (s && s.tagName !== "H2") { if (s.tagName === "UL") n += s.children.length; s = s.nextElementSibling; }
        var a = document.createElement("a");
        a.href = "#" + c.id; a.className = "chip cat-" + c.id;
        a.innerHTML = "<b>" + n + "</b> " + c.name;
        chips.appendChild(a);
      }
    });
  });

  // 3. External links open in a new tab
  document.querySelectorAll("a[href^='http']").forEach(function (a) {
    if (a.host !== location.host) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
  });

  // 4. Category tabs (hash-driven)
  var tabs = document.querySelector("[data-tabs]");
  if (tabs) {
    var show = function () {
      var id = location.hash.slice(1);
      var first = tabs.querySelector("[data-tab]");
      if (!tabs.querySelector('[data-tab="' + id + '"]') && first) id = first.dataset.tab;
      tabs.querySelectorAll("[data-tab]").forEach(function (t) { t.classList.toggle("active", t.dataset.tab === id); });
      document.querySelectorAll("[data-panel]").forEach(function (p) { p.classList.toggle("active", p.dataset.panel === id); });
    };
    window.addEventListener("hashchange", show); show();
  }
  if (document.querySelector(".cat-security-now.day") && !tabs) document.body.classList.add("security-now-page");

  // 5. Live filter
  var input = document.querySelector("[data-filter]");
  if (input) {
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      document.querySelectorAll("[data-brief] li").forEach(function (li) {
        if (li.parentElement.closest("li")) return; // nested
        li.classList.toggle("hidden", q && li.textContent.toLowerCase().indexOf(q) === -1);
      });
      document.querySelectorAll("[data-brief] h2[id], [data-brief] .day").forEach(function (sec) {
        if (sec.classList.contains("day")) {
          sec.classList.toggle("sec-hidden", q && !sec.querySelector("li:not(.hidden)"));
        }
      });
    });
  }
})();
