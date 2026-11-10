// Decorative calendar + megaphone illustration for the home hero (purely visual)
const HeroIllustration = () => (
  <svg viewBox="0 0 320 240" className="hero-art" role="presentation" aria-hidden="true" focusable="false">
    <ellipse cx="170" cy="190" rx="140" ry="40" fill="#E4E0FB" />
    <g transform="rotate(-6 150 100)">
      <rect x="60" y="50" width="190" height="150" rx="18" fill="#fff" stroke="#D5CFF7" strokeWidth="2" />
      <path d="M60 68a18 18 0 0 1 18-18h154a18 18 0 0 1 18 18v28H60z" fill="#B8AEF2" />
      <rect x="100" y="34" width="12" height="32" rx="6" fill="#8B7CE8" />
      <rect x="198" y="34" width="12" height="32" rx="6" fill="#8B7CE8" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={78 + c * 38}
            y={110 + r * 21}
            width="26"
            height="13"
            rx="4"
            fill={r === 1 && c === 2 ? "#5B4BDB" : "#E9E6FA"}
          />
        ))
      )}
    </g>
    <circle cx="238" cy="150" r="42" fill="#5B4BDB" />
    <path d="M222 150l26-14v28z" fill="#fff" />
    <rect x="214" y="145" width="12" height="10" rx="2" fill="#fff" />
    <path d="M252 128l8-8M258 140l12-3M256 154l10 4" stroke="#8B7CE8" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default HeroIllustration;
