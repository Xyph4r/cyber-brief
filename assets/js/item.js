// Item share pages (/i/<id>/) carry the preview meta for link unfurlers.
// People who open one are sent straight to the item inside its brief.
(function () {
  var s = document.currentScript, t = s && s.getAttribute("data-target");
  if (t && t.charAt(0) === "/" && t.charAt(1) !== "/") location.replace(t);
})();
