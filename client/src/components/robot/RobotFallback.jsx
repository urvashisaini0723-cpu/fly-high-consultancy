/**
 * Lightweight SVG robot used when WebGL is unavailable or the 3D canvas
 * fails to initialise. Matches the colour language of the real 3D mascot.
 */
const RobotFallback = ({ className = "" }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    role="img"
    aria-label="FlyBot robot assistant"
  >
    <defs>
      <linearGradient id="fbShell" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="55%" stopColor="#f2f3fb" />
        <stop offset="100%" stopColor="#dcdff2" />
      </linearGradient>
      <linearGradient id="fbScreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0b1430" />
        <stop offset="100%" stopColor="#050915" />
      </linearGradient>
      <linearGradient id="fbPurple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
      <radialGradient id="fbEyeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="45%" stopColor="#7ff3ff" />
        <stop offset="100%" stopColor="#22d3ee" />
      </radialGradient>
      <filter id="fbSoft" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.4" />
      </filter>
    </defs>

    {/* ambient glow */}
    <ellipse cx="60" cy="104" rx="34" ry="7" fill="#a855f7" opacity="0.22" filter="url(#fbSoft)" />

    {/* ears */}
    <rect x="14" y="44" width="12" height="22" rx="6" fill="url(#fbPurple)" />
    <rect x="94" y="44" width="12" height="22" rx="6" fill="url(#fbPurple)" />
    <circle cx="20" cy="55" r="3" fill="#e9d5ff" opacity="0.9" />
    <circle cx="100" cy="55" r="3" fill="#e9d5ff" opacity="0.9" />

    {/* antenna */}
    <rect x="57.5" y="10" width="5" height="16" rx="2.5" fill="#c4b5fd" />
    <circle cx="60" cy="9" r="5.5" fill="#a855f7" />
    <circle cx="60" cy="9" r="9" fill="#a855f7" opacity="0.3" filter="url(#fbSoft)" />

    {/* helmet */}
    <rect x="18" y="24" width="84" height="62" rx="28" fill="url(#fbShell)" />
    <rect x="18" y="24" width="84" height="30" rx="22" fill="#ffffff" opacity="0.55" />

    {/* visor */}
    <rect x="27" y="38" width="66" height="42" rx="19" fill="url(#fbScreen)" />
    <rect x="27" y="38" width="66" height="14" rx="12" fill="#ffffff" opacity="0.08" />

    {/* eyes */}
    <ellipse cx="47" cy="56" rx="9.5" ry="10.5" fill="url(#fbEyeGlow)" />
    <ellipse cx="73" cy="56" rx="9.5" ry="10.5" fill="url(#fbEyeGlow)" />
    <circle cx="44" cy="52" r="3" fill="#ffffff" />
    <circle cx="70" cy="52" r="3" fill="#ffffff" />

    {/* smile */}
    <path
      d="M52 68 Q60 75 68 68"
      stroke="#c084fc"
      strokeWidth="3.2"
      strokeLinecap="round"
      fill="none"
    />

    {/* cheeks */}
    <circle cx="34" cy="66" r="3.4" fill="#f472b6" opacity="0.45" />
    <circle cx="86" cy="66" r="3.4" fill="#f472b6" opacity="0.45" />

    {/* body */}
    <rect x="34" y="86" width="52" height="26" rx="13" fill="url(#fbShell)" />
    <circle cx="60" cy="97" r="6.5" fill="url(#fbPurple)" />
    <circle cx="60" cy="97" r="3" fill="#a5f3fc" />
  </svg>
);

export default RobotFallback;
