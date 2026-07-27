// Marka işareti — raflı bir depo duvarı: üç raf, iki yerleşmiş koli.
// Panelin, login ve tanıtım sayfasının ortak logosu. Rengi `currentColor`
// üzerinden alır, böylece koyu ve açık zeminde aynı bileşen kullanılır.

export function QuoraMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2.6" y="3.2" width="18.8" height="17.6" rx="2.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.6 9.4h18.8M2.6 14.9h18.8" stroke="currentColor" strokeWidth="1.1" opacity="0.45" />
      <rect x="13.4" y="10.6" width="6" height="3.1" rx="0.7" fill="currentColor" opacity="0.5" />
      <rect x="4.6" y="16.1" width="5.2" height="3.1" rx="0.7" fill="currentColor" />
    </svg>
  );
}
