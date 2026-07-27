// Panelin küçültülmüş temsili — giriş ekranı ve tanıtım sayfasında ürünün
// nasıl göründüğünü anlatan illüstrasyon. Saf SVG: görsel dosyası, dış istek
// ve istemci JS'i yok. Renkler marka paletinden.

export function PanelMockup({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 252" className={className} role="img" aria-label="Quora panel önizlemesi">
      <defs>
        <clipPath id="qr-mock-frame">
          <rect x="0.5" y="0.5" width="399" height="251" rx="13" />
        </clipPath>
        <linearGradient id="qr-mock-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#590219" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#590219" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0.5" y="0.5" width="399" height="251" rx="13" fill="#ffffff" />

      <g clipPath="url(#qr-mock-frame)">
        {/* Sol menü */}
        <rect x="0" y="0" width="66" height="252" fill="#261515" />
        <rect x="12" y="14" width="14" height="14" rx="4" fill="#BF8F36" />
        <rect x="31" y="18" width="22" height="5" rx="2.5" fill="#F4EDE3" opacity="0.55" />
        <rect x="12" y="44" width="42" height="7" rx="3.5" fill="#590219" />
        {[60, 74, 88, 102, 116, 130].map((y) => (
          <rect key={y} x="12" y={y} width={y % 3 === 0 ? 34 : 42} height="6" rx="3" fill="#F4EDE3" opacity="0.18" />
        ))}
        <rect x="12" y="152" width="26" height="5" rx="2.5" fill="#BF8F36" opacity="0.5" />
        {[166, 178, 190].map((y) => (
          <rect key={y} x="12" y={y} width="38" height="6" rx="3" fill="#F4EDE3" opacity="0.14" />
        ))}

        {/* Üst çubuk */}
        <rect x="66" y="0" width="334" height="34" fill="#ffffff" />
        <rect x="82" y="13" width="58" height="8" rx="4" fill="#261515" opacity="0.75" />
        <rect x="330" y="11" width="54" height="12" rx="6" fill="#F7F5F2" />
        <line x1="66" y1="34" x2="400" y2="34" stroke="#E8DFD8" strokeWidth="1" />
        <rect x="66" y="34" width="334" height="218" fill="#FBF9F7" />

        {/* Özet kutuları */}
        {[
          { x: 80, label: "#585925", value: 44, bar: "#585925" },
          { x: 190, label: "#8B3A2A", value: 32, bar: "#8B3A2A" },
          { x: 300, label: "#BF8F36", value: 38, bar: "#BF8F36" },
        ].map((tile) => (
          <g key={tile.x}>
            <rect x={tile.x} y="48" width="90" height="52" rx="8" fill="#ffffff" stroke="#EFE7E1" />
            <rect x={tile.x + 10} y="59" width="34" height="5" rx="2.5" fill="#8c6c7e" opacity="0.6" />
            <rect x={tile.x + 10} y="71" width={tile.value} height="9" rx="4" fill="#261515" opacity="0.82" />
            <rect x={tile.x + 10} y="86" width="22" height="4" rx="2" fill={tile.bar} opacity="0.75" />
          </g>
        ))}

        {/* Çizgi grafik */}
        <rect x="80" y="112" width="200" height="118" rx="8" fill="#ffffff" stroke="#EFE7E1" />
        <rect x="92" y="124" width="46" height="5" rx="2.5" fill="#8c6c7e" opacity="0.6" />
        <path
          d="M92 206 L120 190 L148 196 L176 168 L204 176 L232 148 L262 138 L262 218 L92 218 Z"
          fill="url(#qr-mock-area)"
        />
        <polyline
          points="92,206 120,190 148,196 176,168 204,176 232,148 262,138"
          fill="none"
          stroke="#590219"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="92,214 120,208 148,210 176,200 204,204 232,192 262,186"
          fill="none"
          stroke="#BF8F36"
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />

        {/* Halka grafik */}
        <rect x="292" y="112" width="98" height="118" rx="8" fill="#ffffff" stroke="#EFE7E1" />
        <circle cx="341" cy="162" r="26" fill="none" stroke="#F1E9E3" strokeWidth="11" />
        <circle
          cx="341"
          cy="162"
          r="26"
          fill="none"
          stroke="#590219"
          strokeWidth="11"
          strokeDasharray="92 71"
          strokeLinecap="butt"
          transform="rotate(-90 341 162)"
        />
        <circle
          cx="341"
          cy="162"
          r="26"
          fill="none"
          stroke="#BF8F36"
          strokeWidth="11"
          strokeDasharray="44 119"
          strokeDashoffset="-92"
          transform="rotate(-90 341 162)"
        />
        {[204, 214].map((y, i) => (
          <g key={y}>
            <rect x="306" y={y} width="7" height="7" rx="2" fill={i === 0 ? "#590219" : "#BF8F36"} />
            <rect x="318" y={y + 1.5} width={i === 0 ? 46 : 34} height="4" rx="2" fill="#8c6c7e" opacity="0.5" />
          </g>
        ))}
      </g>

      <rect x="0.5" y="0.5" width="399" height="251" rx="13" fill="none" stroke="#E8DFD8" />
    </svg>
  );
}
