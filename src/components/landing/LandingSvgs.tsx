import React from "react";

export const HeroBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 800"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <radialGradient id="heroGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
        <stop offset="100%" stopColor="rgba(30, 58, 138, 0)" />
      </radialGradient>
      <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
        <stop offset="100%" stopColor="rgba(30, 58, 138, 0)" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#heroGradient)" />
    <g opacity="0.4">
      <circle cx="10%" cy="20%" r="50" fill="url(#glowGradient)" />
      <circle cx="80%" cy="60%" r="100" fill="url(#glowGradient)" />
      <circle cx="40%" cy="80%" r="70" fill="url(#glowGradient)" />
      <circle cx="90%" cy="10%" r="120" fill="url(#glowGradient)" />
    </g>
    <g opacity="0.1">
      <path d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="rgba(59, 130, 246, 0.1)" />
    </g>
  </svg>
);

export const FeatureIcon1 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-10 h-10"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

export const FeatureIcon2 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-10 h-10"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
    <path d="M2 17l10 5 10-5"></path>
    <path d="M2 12l10 5 10-5"></path>
  </svg>
);

export const FeatureIcon3 = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-10 h-10"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

export const DashboardSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 400 200"
    className="w-full h-auto"
  >
    <rect width="400" height="200" rx="8" fill="#0f0a1e" />
    <rect x="20" y="20" width="120" height="70" rx="4" fill="#1a1a2e" />
    <rect x="20" y="100" width="120" height="70" rx="4" fill="#1a1a2e" />
    <rect x="150" y="20" width="230" height="150" rx="4" fill="#1a1a2e" />
    <rect x="170" y="40" width="190" height="10" rx="2" fill="#3b82f6" />
    <rect x="170" y="60" width="150" height="10" rx="2" fill="#3b82f6" />
    <rect x="170" y="80" width="170" height="10" rx="2" fill="#3b82f6" />
    <rect x="170" y="100" width="130" height="10" rx="2" fill="#3b82f6" />
    <rect x="170" y="120" width="160" height="10" rx="2" fill="#3b82f6" />
    <rect x="40" y="40" width="80" height="10" rx="2" fill="#3b82f6" />
    <rect x="40" y="60" width="60" height="10" rx="2" fill="#3b82f6" />
    <rect x="40" y="120" width="80" height="10" rx="2" fill="#3b82f6" />
    <rect x="40" y="140" width="60" height="10" rx="2" fill="#3b82f6" />
  </svg>
);

export const WaveDivider = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1440 100"
    className="w-full h-auto"
    preserveAspectRatio="none"
  >
    <path
      fill="currentColor"
      fillOpacity="1"
      d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,74.7C1248,75,1344,53,1392,42.7L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
    ></path>
  </svg>
);

export const GlowCircle = ({ className = "" }: { className?: string }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 ${className}`}></div>
);

export const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-blue-400"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export const SEODashboardSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 500 300"
    className="w-full h-auto"
  >
    <rect width="500" height="300" rx="8" fill="#0f0a1e" />
    <rect x="20" y="20" width="140" height="120" rx="4" fill="#1a1a2e" />
    <rect x="170" y="20" width="140" height="120" rx="4" fill="#1a1a2e" />
    <rect x="320" y="20" width="160" height="120" rx="4" fill="#1a1a2e" />
    <rect x="20" y="150" width="460" height="130" rx="4" fill="#1a1a2e" />

    {/* Chart elements */}
    <path d="M40,100 L60,80 L80,90 L100,60 L120,70 L140,50" stroke="#3b82f6" strokeWidth="2" fill="none" />
    <path d="M190,100 L210,70 L230,80 L250,50 L270,60 L290,40" stroke="#3b82f6" strokeWidth="2" fill="none" />
    <path d="M340,100 L360,80 L380,60 L400,70 L420,50 L440,60" stroke="#3b82f6" strokeWidth="2" fill="none" />

    <path d="M40,240 L80,220 L120,230 L160,200 L200,210 L240,190 L280,200 L320,180 L360,190 L400,170 L440,180"
      stroke="#3b82f6" strokeWidth="2" fill="none" />

    {/* Data points */}
    <circle cx="60" cy="80" r="3" fill="#3b82f6" />
    <circle cx="80" cy="90" r="3" fill="#3b82f6" />
    <circle cx="100" cy="60" r="3" fill="#3b82f6" />
    <circle cx="120" cy="70" r="3" fill="#3b82f6" />

    <circle cx="210" cy="70" r="3" fill="#3b82f6" />
    <circle cx="230" cy="80" r="3" fill="#3b82f6" />
    <circle cx="250" cy="50" r="3" fill="#3b82f6" />
    <circle cx="270" cy="60" r="3" fill="#3b82f6" />

    <circle cx="360" cy="80" r="3" fill="#3b82f6" />
    <circle cx="380" cy="60" r="3" fill="#3b82f6" />
    <circle cx="400" cy="70" r="3" fill="#3b82f6" />
    <circle cx="420" cy="50" r="3" fill="#3b82f6" />

    {/* Labels */}
    <rect x="40" y="40" width="60" height="6" rx="2" fill="#3b82f6" opacity="0.7" />
    <rect x="40" y="50" width="40" height="6" rx="2" fill="#3b82f6" opacity="0.5" />

    <rect x="190" y="40" width="60" height="6" rx="2" fill="#3b82f6" opacity="0.7" />
    <rect x="190" y="50" width="40" height="6" rx="2" fill="#3b82f6" opacity="0.5" />

    <rect x="340" y="40" width="60" height="6" rx="2" fill="#3b82f6" opacity="0.7" />
    <rect x="340" y="50" width="40" height="6" rx="2" fill="#3b82f6" opacity="0.5" />

    <rect x="40" y="170" width="100" height="6" rx="2" fill="#3b82f6" opacity="0.7" />
    <rect x="40" y="180" width="60" height="6" rx="2" fill="#3b82f6" opacity="0.5" />
  </svg>
);

export const FeatureCardSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 150"
    className="w-full h-auto"
  >
    <rect width="200" height="150" rx="8" fill="#1a1a2e" />
    <rect x="20" y="20" width="160" height="110" rx="4" fill="#0f0a1e" />
    <rect x="40" y="40" width="120" height="6" rx="2" fill="#3b82f6" opacity="0.7" />
    <rect x="40" y="55" width="80" height="6" rx="2" fill="#3b82f6" opacity="0.5" />
    <rect x="40" y="70" width="100" height="6" rx="2" fill="#3b82f6" opacity="0.5" />
    <rect x="40" y="85" width="90" height="6" rx="2" fill="#3b82f6" opacity="0.5" />
    <rect x="40" y="100" width="70" height="6" rx="2" fill="#3b82f6" opacity="0.5" />
  </svg>
);

export const RingGraphSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className="w-full h-auto"
  >
    <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a2e" strokeWidth="8" />
    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="200" strokeDashoffset="50" />
    <text x="50" y="55" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">75%</text>
  </svg>
);

export const ClientLogoGrid = () => (
  <div className="grid grid-cols-4 md:grid-cols-8 gap-8 items-center justify-items-center">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="h-8 w-24 bg-white/10 rounded-md"></div>
    ))}
  </div>
);

export const PricingCardSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 300 400"
    className="w-full h-auto"
  >
    <rect width="300" height="400" rx="8" fill="#1a1a2e" />
    <rect x="30" y="30" width="100" height="10" rx="2" fill="#3b82f6" opacity="0.7" />
    <rect x="30" y="50" width="60" height="8" rx="2" fill="#3b82f6" opacity="0.5" />
    <rect x="30" y="80" width="80" height="15" rx="2" fill="#3b82f6" />

    <line x1="30" y1="120" x2="270" y2="120" stroke="#3b82f6" strokeWidth="1" opacity="0.2" />

    <rect x="50" y="140" width="200" height="8" rx="2" fill="#3b82f6" opacity="0.5" />
    <rect x="50" y="170" width="200" height="8" rx="2" fill="#3b82f6" opacity="0.5" />
    <rect x="50" y="200" width="200" height="8" rx="2" fill="#3b82f6" opacity="0.5" />
    <rect x="50" y="230" width="200" height="8" rx="2" fill="#3b82f6" opacity="0.5" />
    <rect x="50" y="260" width="200" height="8" rx="2" fill="#3b82f6" opacity="0.5" />

    <rect x="30" y="320" width="240" height="40" rx="4" fill="#3b82f6" />
    <rect x="120" y="335" width="60" height="10" rx="2" fill="white" />
  </svg>
);
