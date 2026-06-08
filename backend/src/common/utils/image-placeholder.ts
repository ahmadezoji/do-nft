export const buildPlaceholderImage = (title: string, subtitle: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#102542" />
          <stop offset="100%" stop-color="#f87060" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#bg)" rx="48" />
      <circle cx="790" cy="220" r="120" fill="#f9c74f" opacity="0.35" />
      <circle cx="240" cy="770" r="150" fill="#43aa8b" opacity="0.25" />
      <text x="80" y="420" fill="#f7f7f2" font-size="72" font-family="Verdana" font-weight="700">
        ${title}
      </text>
      <text x="80" y="510" fill="#f7f7f2" font-size="34" font-family="Verdana">
        ${subtitle}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
