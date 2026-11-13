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

  // 2b. Item IDs: permalink + share button on every news item
  var ITEMS = document.body.getAttribute("data-items") || "/i/";
  var live = document.createElement("span");
  live.className = "sr-only"; live.setAttribute("aria-live", "polite");
  document.body.appendChild(live);

  var flash = function (btn, msg) {
    live.textContent = msg;
    btn.textContent = msg; btn.classList.add("done");
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.textContent = "Share"; btn.classList.remove("done"); live.textContent = ""; }, 2000);
  };
  var copy = function (url, btn) {
    var legacy = function () {
      var ta = document.createElement("textarea");
      ta.value = url; ta.setAttribute("readonly", ""); ta.className = "sr-only";
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      ta.remove();
      if (ok) flash(btn, "Link copied"); else window.prompt("Copy this link:", url);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () { flash(btn, "Link copied"); }, legacy);
    } else legacy();
  };
  var share = function (li, btn) {
    var url = new URL(ITEMS + li.id + "/", location.href).href;
    var head = li.querySelector("strong");
    var title = head ? head.textContent.trim() : document.title;
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function (e) {
        if (!e || e.name !== "AbortError") copy(url, btn);
      });
    } else copy(url, btn);
  };

  document.querySelectorAll("[data-brief] li[id]").forEach(function (li) {
    if (li.parentElement.closest("li") || li.closest(".sources-list")) return;
    var root = li.closest("[data-url]");
    var post = root ? root.getAttribute("data-url") : location.pathname;
    var bar = document.createElement("span");
    bar.className = "item-actions";
    var a = document.createElement("a");
    a.className = "item-id"; a.href = post + "#" + li.id; a.textContent = li.id;
    a.title = "Permalink to this item";
    var b = document.createElement("button");
    b.type = "button"; b.className = "item-share"; b.textContent = "Share";
    b.setAttribute("aria-label", "Share: " + (li.querySelector("strong") || li).textContent.trim().slice(0, 80));
    b.addEventListener("click", function () { share(li, b); });
    bar.appendChild(a); bar.appendChild(b);
    li.appendChild(bar);
  });

  // Bring a linked item into view: clear a filter that hides it, scroll once its panel is visible.
  var input = document.querySelector("[data-filter]");
  var revealTarget = function () {
    var id = decodeURIComponent(location.hash.slice(1));
    var el = id && document.getElementById(id);
    document.querySelectorAll("[data-brief] li.is-target").forEach(function (x) { x.classList.remove("is-target", "pulse"); });
    if (!el || el.tagName !== "LI") return;
    if (input && el.classList.contains("hidden")) { input.value = ""; input.dispatchEvent(new Event("input")); }
    // Set the highlight ourselves: :target is not applied reliably after a scripted redirect
    // in every browser (e.g. some in-app browsers), and it doesn't update on history navigation.
    el.classList.add("is-target");
    void el.offsetWidth; // restart the pulse animation
    el.classList.add("pulse");
    requestAnimationFrame(function () { el.scrollIntoView({ block: "start" }); });
  };

  // 3. External links open in a new tab
  document.querySelectorAll("a[href^='http']").forEach(function (a) {
    if (a.host !== location.host) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
  });

  // 4. Category tabs (hash-driven)
  var tabs = document.querySelector("[data-tabs]");
  if (tabs) {
    var show = function () {
      var id = decodeURIComponent(location.hash.slice(1));
      var first = tabs.querySelector("[data-tab]");
      if (!tabs.querySelector('[data-tab="' + CSS.escape(id) + '"]')) {
        // A link to a single item: open the tab that holds it.
        var el = id && document.getElementById(id), panel = el && el.closest("[data-panel]");
        id = panel ? panel.dataset.panel : first ? first.dataset.tab : id;
      }
      tabs.querySelectorAll("[data-tab]").forEach(function (t) { t.classList.toggle("active", t.dataset.tab === id); });
      document.querySelectorAll("[data-panel]").forEach(function (p) { p.classList.toggle("active", p.dataset.panel === id); });
    };
    window.addEventListener("hashchange", show); show();
  }
  revealTarget();
  window.addEventListener("hashchange", revealTarget);
  if (document.querySelector(".cat-security-now.day") && !tabs) document.body.classList.add("security-now-page");

  // 5. Live filter
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
