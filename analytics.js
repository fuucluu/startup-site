(function (root) {
  "use strict";

  var config = root.QUANTA_ANALYTICS || {};
  var dataLayer = root.dataLayer = root.dataLayer || [];
  var storageKey = "quantadev_attribution";

  function clean(value) {
    return String(value || "").slice(0, 120);
  }

  function captureAttribution() {
    var params = new URLSearchParams(root.location.search);
    var attribution = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (key) {
      if (params.get(key)) attribution[key] = clean(params.get(key));
    });
    if (!Object.keys(attribution).length) return;
    try { root.sessionStorage.setItem(storageKey, JSON.stringify(attribution)); } catch (error) {}
  }

  function attribution() {
    try { return JSON.parse(root.sessionStorage.getItem(storageKey) || "{}"); } catch (error) { return {}; }
  }

  function trackEvent(name, details) {
    var payload = Object.assign({
      event: clean(name),
      page_path: root.location.pathname,
      page_title: document.title
    }, attribution(), details || {});
    if (typeof root.gtag === "function") root.gtag("event", name, payload);
    else dataLayer.push(payload);
    return payload;
  }

  function loadGA4() {
    if (!config.ga4Id || !/^G-[A-Z0-9]+$/i.test(config.ga4Id)) return;
    root.gtag = root.gtag || function () { dataLayer.push(arguments); };
    root.gtag("js", new Date());
    root.gtag("config", config.ga4Id, { anonymize_ip: true });
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(config.ga4Id);
    document.head.appendChild(script);
  }

  captureAttribution();
  loadGA4();
  root.quantaTrack = trackEvent;

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[data-track]");
    if (!link) return;
    trackEvent(link.dataset.track, {
      link_url: link.href,
      link_text: clean(link.textContent),
      placement: clean(link.dataset.placement)
    });
  });
}(window));
