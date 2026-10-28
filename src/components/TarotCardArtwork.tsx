import React from 'react';
import { TarotCardData } from '../data/tarotDeck';

interface TarotCardArtworkProps {
  card: TarotCardData;
  isReversed?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SUIT_PALETTE = {
  Major: {
    ink: '#1C1917',
    accent: '#78350F',
    foil: '#B45309',
    paper: '#FBF9F5',
    tint: '#F5EFE6'
  },
  Wands: {
    ink: '#291D18',
    accent: '#9A3412',
    foil: '#C2410C',
    paper: '#FDFBF7',
    tint: '#F9EFEA'
  },
  Cups: {
    ink: '#17253B',
    accent: '#1E3A8A',
    foil: '#1D4ED8',
    paper: '#F9FBFC',
    tint: '#ECF2F9'
  },
  Swords: {
    ink: '#1E293B',
    accent: '#334155',
    foil: '#475569',
    paper: '#FAFAFA',
    tint: '#F1F5F9'
  },
  Pentacles: {
    ink: '#1A2E22',
    accent: '#14532D',
    foil: '#854D0E',
    paper: '#FBFBF8',
    tint: '#EFF5F0'
  }
};

function renderSuitEmblem(suit: TarotCardData['suit'], x: number, y: number, scale = 1, color = '#78350F') {
  const transform = `translate(${x}, ${y}) scale(${scale})`;
  if (suit === 'Wands') {
    return (
      <g transform={transform} stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round">
        <line x1="0" y1="22" x2="0" y2="-22" />
        <path d="M0 -8 C6 -12, 10 -8, 5 -3" fill={color} fillOpacity="0.2" />
        <path d="M0 4 C-6 0, -10 4, -5 9" fill={color} fillOpacity="0.2" />
        <path d="M0 -18 C4 -23, 8 -20, 3 -15" fill={color} fillOpacity="0.2" />
      </g>
    );
  }
  if (suit === 'Cups') {
    return (
      <g transform={transform} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-11 -14 L11 -14 C11 -2, 6 4, 0 4 C-6 4, -11 -2, -11 -14 Z" fill={color} fillOpacity="0.14" />
        <line x1="0" y1="4" x2="0" y2="15" />
        <path d="M-8 15 L8 15" />
        <ellipse cx="0" cy="-14" rx="11" ry="2.5" />
      </g>
    );
  }
  if (suit === 'Swords') {
    return (
      <g transform={transform} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
        <line x1="0" y1="-22" x2="0" y2="16" />
        <path d="M-9 8 Q0 11 9 8" />
        <circle cx="0" cy="18" r="2.5" fill={color} />
        <path d="M0 -22 L-3 -14 L0 8 L3 -14 Z" fill={color} fillOpacity="0.12" />
      </g>
    );
  }
  // Pentacles
  return (
    <g transform={transform} stroke={color} strokeWidth="1.8" fill="none">
      <circle cx="0" cy="0" r="14" fill={color} fillOpacity="0.12" />
      <circle cx="0" cy="0" r="11.5" strokeDasharray="1.5 1.5" />
      <polygon
        points="0,-11 3.2,-3.5 11,-3.5 4.8,1.5 7.2,9.5 0,4.8 -7.2,9.5 -4.8,1.5 -11,-3.5 -3.2,-3.5"
        fill={color}
        fillOpacity="0.2"
      />
    </g>
  );
}

function getPipCoordinates(count: number): Array<[number, number, number]> {
  switch (count) {
    case 1:
      return [[100, 128, 1.85]];
    case 2:
      return [
        [100, 82, 1.2],
        [100, 174, 1.2]
      ];
    case 3:
      return [
        [100, 74, 1.1],
        [100, 128, 1.1],
        [100, 182, 1.1]
      ];
    case 4:
      return [
        [68, 86, 1.05],
        [132, 86, 1.05],
        [68, 170, 1.05],
        [132, 170, 1.05]
      ];
    case 5:
      return [
        [66, 80, 0.95],
        [134, 80, 0.95],
        [100, 128, 1.05],
        [66, 176, 0.95],
        [134, 176, 0.95]
      ];
    case 6:
      return [
        [68, 78, 0.92],
        [132, 78, 0.92],
        [68, 128, 0.92],
        [132, 128, 0.92],
        [68, 178, 0.92],
        [132, 178, 0.92]
      ];
    case 7:
      return [
        [68, 76, 0.85],
        [132, 76, 0.85],
        [100, 104, 0.9],
        [68, 134, 0.85],
        [132, 134, 0.85],
        [68, 182, 0.85],
        [132, 182, 0.85]
      ];
    case 8:
      return [
        [68, 68, 0.8],
        [132, 68, 0.8],
        [68, 108, 0.8],
        [132, 108, 0.8],
        [68, 148, 0.8],
        [132, 148, 0.8],
        [68, 188, 0.8],
        [132, 188, 0.8]
      ];
    case 9:
      return [
        [66, 66, 0.76],
        [134, 66, 0.76],
        [66, 104, 0.76],
        [134, 104, 0.76],
        [100, 128, 0.85],
        [66, 152, 0.76],
        [134, 152, 0.76],
        [66, 190, 0.76],
        [134, 190, 0.76]
      ];
    case 10:
    default:
      return [
        [100, 58, 0.72],
        [64, 82, 0.72],
        [136, 82, 0.72],
        [64, 118, 0.72],
        [136, 118, 0.72],
        [100, 100, 0.72],
        [100, 154, 0.72],
        [64, 162, 0.72],
        [136, 162, 0.72],
        [100, 196, 0.72]
      ];
  }
}

function renderMajorArcanaGlyph(number: number, ink: string, accent: string) {
  switch (number) {
    case 0: // The Fool — Sun, precipice, white rose
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <circle cx="136" cy="74" r="16" fill={accent} fillOpacity="0.18" stroke={accent} />
          <path d="M40 198 L112 198 L135 220 L40 220 Z" fill={ink} fillOpacity="0.08" />
          <circle cx="92" cy="128" r="24" stroke={accent} strokeDasharray="3 3" />
          <path d="M72 175 L100 112 L118 168" strokeWidth="2.2" />
          <line x1="62" y1="145" x2="128" y2="96" stroke={accent} strokeWidth="2" />
          <circle cx="98" cy="96" r="9" fill={accent} fillOpacity="0.2" />
        </g>
      );
    case 1: // The Magician — Lemniscate & 4 elemental emblems
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <path d="M82 74 C68 62, 68 86, 100 74 C132 62, 132 86, 118 74 C104 62, 96 86, 82 74 Z" stroke={accent} strokeWidth="2.2" />
          <line x1="100" y1="92" x2="100" y2="165" strokeWidth="2.4" />
          <line x1="52" y1="176" x2="148" y2="176" strokeWidth="2.5" />
          <circle cx="68" cy="160" r="8" stroke={accent} />
          <path d="M90 152 L100 168 L110 152 Z" stroke={accent} />
          <line x1="128" y1="146" x2="128" y2="168" stroke={accent} />
        </g>
      );
    case 2: // High Priestess — Twin Pillars B & J + Crescent Moon
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <rect x="46" y="66" width="22" height="140" fill={ink} fillOpacity="0.14" />
          <rect x="132" y="66" width="22" height="140" fill={accent} fillOpacity="0.08" />
          <text x="57" y="138" textAnchor="middle" fontSize="13" fontFamily="serif" fill={ink}>B</text>
          <text x="143" y="138" textAnchor="middle" fontSize="13" fontFamily="serif" fill={ink}>J</text>
          <path d="M84 102 A18 18 0 1 0 116 102 A14 14 0 1 1 84 102 Z" fill={accent} fillOpacity="0.25" stroke={accent} />
          <circle cx="100" cy="148" r="18" stroke={accent} />
        </g>
      );
    case 3: // The Empress — Venus Emblem & Twelve-Star Corona
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <circle cx="100" cy="112" r="24" fill={accent} fillOpacity="0.14" stroke={accent} strokeWidth="2.2" />
          <line x1="100" y1="136" x2="100" y2="182" stroke={accent} strokeWidth="2.2" />
          <line x1="82" y1="158" x2="118" y2="158" stroke={accent} strokeWidth="2.2" />
          <circle cx="100" cy="112" r="38" strokeDasharray="2 6" stroke={ink} />
        </g>
      );
    case 4: // The Emperor — Throne, Orb & Ankh Cross
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <rect x="62" y="74" width="76" height="118" strokeWidth="2" fill={ink} fillOpacity="0.05" />
          <circle cx="100" cy="108" r="16" stroke={accent} strokeWidth="2.2" fill={accent} fillOpacity="0.15" />
          <line x1="100" y1="124" x2="100" y2="172" stroke={accent} strokeWidth="2.2" />
          <line x1="82" y1="142" x2="118" y2="142" stroke={accent} strokeWidth="2.2" />
        </g>
      );
    case 5: // The Hierophant — Triple Crown & Crossed Keys
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <line x1="100" y1="68" x2="100" y2="178" strokeWidth="2.2" />
          <line x1="84" y1="84" x2="116" y2="84" strokeWidth="2" />
          <line x1="78" y1="102" x2="122" y2="102" strokeWidth="2" />
          <line x1="72" y1="120" x2="128" y2="120" strokeWidth="2" />
          <circle cx="82" cy="168" r="9" stroke={accent} strokeWidth="2" />
          <circle cx="118" cy="168" r="9" stroke={accent} strokeWidth="2" />
          <line x1="88" y1="162" x2="118" y2="136" stroke={accent} strokeWidth="2" />
          <line x1="112" y1="162" x2="82" y2="136" stroke={accent} strokeWidth="2" />
        </g>
      );
    case 6: // The Lovers — Radiant Sun, Mountain & Twin Chalices
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <circle cx="100" cy="82" r="18" fill={accent} fillOpacity="0.2" stroke={accent} />
          <path d="M48 192 L100 122 L152 192 Z" fill={ink} fillOpacity="0.08" />
          <circle cx="72" cy="154" r="14" stroke={accent} />
          <circle cx="128" cy="154" r="14" stroke={accent} />
        </g>
      );
    case 7: // The Chariot — Canopy, Shield & Twin Sphinxes
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <polygon points="100,68 142,108 128,176 72,176 58,108" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="2" />
          <circle cx="64" cy="186" r="12" stroke={ink} strokeWidth="2.2" />
          <circle cx="136" cy="186" r="12" stroke={ink} strokeWidth="2.2" />
          <path d="M78 122 L100 138 L122 122" stroke={accent} strokeWidth="2" />
        </g>
      );
    case 8: // Strength — Solar Lion & Lemniscate
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <path d="M78 78 C64 66, 64 90, 100 78 C136 66, 136 90, 122 78 C108 66, 92 90, 78 78 Z" stroke={accent} strokeWidth="2.2" />
          <circle cx="100" cy="138" r="32" fill={accent} fillOpacity="0.14" stroke={accent} strokeWidth="2" />
          <circle cx="100" cy="138" r="20" stroke={ink} />
        </g>
      );
    case 9: // The Hermit — Six-Pointed Star Lantern & Peak
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <path d="M44 202 L100 116 L156 202" fill={ink} fillOpacity="0.07" />
          <polygon points="100,70 116,98 84,98" stroke={accent} fill={accent} fillOpacity="0.15" />
          <polygon points="100,108 116,80 84,80" stroke={accent} fill={accent} fillOpacity="0.15" />
          <circle cx="100" cy="89" r="24" stroke={ink} strokeDasharray="3 3" />
        </g>
      );
    case 10: // Wheel of Fortune — Eight-Spoked Cosmic Wheel
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <circle cx="100" cy="128" r="46" stroke={accent} strokeWidth="2.4" fill={accent} fillOpacity="0.08" />
          <circle cx="100" cy="128" r="34" stroke={ink} />
          <circle cx="100" cy="128" r="10" fill={accent} fillOpacity="0.25" />
          <line x1="100" y1="82" x2="100" y2="174" />
          <line x1="54" y1="128" x2="146" y2="128" />
          <line x1="67" y1="95" x2="133" y2="161" />
          <line x1="133" y1="95" x2="67" y2="161" />
        </g>
      );
    case 11: // Justice — Upright Sword & Balanced Scales
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <line x1="100" y1="64" x2="100" y2="192" stroke={ink} strokeWidth="2.4" />
          <line x1="58" y1="108" x2="142" y2="108" stroke={accent} strokeWidth="2.2" />
          <path d="M58 108 L46 142 L70 142 Z" fill={accent} fillOpacity="0.16" stroke={accent} />
          <path d="M142 108 L130 142 L154 142 Z" fill={accent} fillOpacity="0.16" stroke={accent} />
        </g>
      );
    case 12: // The Hanged Man — Living Tau Cross & Inverted Nimbus
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <line x1="52" y1="74" x2="148" y2="74" strokeWidth="3" />
          <line x1="100" y1="74" x2="100" y2="152" strokeWidth="2" />
          <circle cx="100" cy="168" r="18" fill={accent} fillOpacity="0.2" stroke={accent} strokeWidth="2" />
          <circle cx="100" cy="168" r="26" stroke={accent} strokeDasharray="2 4" />
        </g>
      );
    case 13: // Death — Mystic Five-Petal Rose & Rising Sun Between Towers
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <rect x="50" y="124" width="22" height="68" fill={ink} fillOpacity="0.12" />
          <rect x="128" y="124" width="22" height="68" fill={ink} fillOpacity="0.12" />
          <circle cx="100" cy="164" r="20" fill={accent} fillOpacity="0.22" stroke={accent} />
          <circle cx="100" cy="96" r="22" stroke={ink} strokeWidth="2" />
          <circle cx="100" cy="96" r="8" fill={accent} fillOpacity="0.3" />
        </g>
      );
    case 14: // Temperance — Alchemy Triangles & Flowing Stream
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <polygon points="100,72 136,132 64,132" stroke={accent} strokeWidth="2" fill={accent} fillOpacity="0.1" />
          <polygon points="100,184 136,124 64,124" stroke={ink} strokeWidth="2" fill={ink} fillOpacity="0.06" />
          <path d="M82 94 C100 118, 100 138, 118 162" stroke={accent} strokeWidth="2.4" />
        </g>
      );
    case 15: // The Devil — Inverted Pentagram & Unlocked Links
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <circle cx="100" cy="116" r="36" stroke={accent} strokeWidth="2" />
          <polygon
            points="100,148 80,88 130,124 70,124 120,88"
            stroke={ink}
            strokeWidth="1.8"
            fill={accent}
            fillOpacity="0.12"
          />
          <circle cx="78" cy="176" r="10" strokeDasharray="4 3" />
          <circle cx="122" cy="176" r="10" strokeDasharray="4 3" />
        </g>
      );
    case 16: // The Tower — Lightning Bolt & Falling Crown
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <path d="M74 196 L80 96 L120 96 L126 196 Z" fill={ink} fillOpacity="0.12" strokeWidth="2" />
          <path d="M138 62 L96 102 L114 106 L72 148" stroke={accent} strokeWidth="2.8" />
          <polygon points="76,86 88,72 100,84 112,72 124,86" stroke={accent} fill={accent} fillOpacity="0.2" />
        </g>
      );
    case 17: // The Star — Eight-Pointed Guiding Star & Water Pools
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <line x1="100" y1="64" x2="100" y2="136" stroke={accent} strokeWidth="2.2" />
          <line x1="64" y1="100" x2="136" y2="100" stroke={accent} strokeWidth="2.2" />
          <line x1="76" y1="76" x2="124" y2="124" stroke={accent} strokeWidth="1.8" />
          <line x1="124" y1="76" x2="76" y2="124" stroke={accent} strokeWidth="1.8" />
          <circle cx="100" cy="100" r="12" fill={accent} fillOpacity="0.22" />
          <path d="M52 172 Q100 162 148 172" stroke={ink} />
          <path d="M62 186 Q100 176 138 186" stroke={accent} />
        </g>
      );
    case 18: // The Moon — Crescent Moon, Twin Towers & Winding Path
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <circle cx="100" cy="92" r="24" fill={accent} fillOpacity="0.16" stroke={accent} strokeWidth="2" />
          <path d="M94 70 A20 20 0 0 0 94 114 A16 16 0 0 1 94 70 Z" fill={ink} fillOpacity="0.2" />
          <rect x="48" y="118" width="16" height="62" fill={ink} fillOpacity="0.1" />
          <rect x="136" y="118" width="16" height="62" fill={ink} fillOpacity="0.1" />
          <path d="M100 198 C82 176, 118 156, 100 132" stroke={accent} strokeWidth="2" />
        </g>
      );
    case 19: // The Sun — Radiant Solar Disk & Rays
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <circle cx="100" cy="118" r="28" fill={accent} fillOpacity="0.24" stroke={accent} strokeWidth="2.4" />
          <circle cx="100" cy="118" r="44" stroke={accent} strokeDasharray="3 5" />
          <line x1="100" y1="58" x2="100" y2="76" stroke={accent} strokeWidth="2.2" />
          <line x1="100" y1="160" x2="100" y2="178" stroke={accent} strokeWidth="2.2" />
          <line x1="40" y1="118" x2="58" y2="118" stroke={accent} strokeWidth="2.2" />
          <line x1="142" y1="118" x2="160" y2="118" stroke={accent} strokeWidth="2.2" />
          <line x1="58" y1="76" x2="72" y2="90" stroke={accent} strokeWidth="2" />
          <line x1="142" y1="76" x2="128" y2="90" stroke={accent} strokeWidth="2" />
          <line x1="58" y1="160" x2="72" y2="146" stroke={accent} strokeWidth="2" />
          <line x1="142" y1="160" x2="128" y2="146" stroke={accent} strokeWidth="2" />
        </g>
      );
    case 20: // Judgement — Herald Trumpet & Rising Waves
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <polygon points="100,66 86,126 114,126" fill={accent} fillOpacity="0.16" stroke={accent} strokeWidth="2" />
          <rect x="86" y="128" width="28" height="24" stroke={ink} />
          <line x1="100" y1="128" x2="100" y2="152" stroke={accent} />
          <line x1="86" y1="140" x2="114" y2="140" stroke={accent} />
          <path d="M46 184 Q100 168 154 184" strokeWidth="2" />
        </g>
      );
    case 21: // The World — Oval Laurel Wreath & Four Corner Guardians
    default:
      return (
        <g stroke={ink} strokeWidth="1.8" fill="none">
          <ellipse cx="100" cy="128" rx="34" ry="52" stroke={accent} strokeWidth="2.6" fill={accent} fillOpacity="0.1" />
          <ellipse cx="100" cy="128" rx="28" ry="44" strokeDasharray="3 3" />
          <circle cx="52" cy="72" r="6" fill={ink} fillOpacity="0.2" />
          <circle cx="148" cy="72" r="6" fill={ink} fillOpacity="0.2" />
          <circle cx="52" cy="184" r="6" fill={ink} fillOpacity="0.2" />
          <circle cx="148" cy="184" r="6" fill={ink} fillOpacity="0.2" />
          <circle cx="100" cy="128" r="10" fill={accent} fillOpacity="0.28" />
        </g>
      );
  }
}

function renderCourtCrest(card: TarotCardData, ink: string, accent: string) {
  const rank = card.number; // 11 Page, 12 Knight, 13 Queen, 14 King
  return (
    <g>
      {/* Outer Heraldic Shield / Mandorla */}
      <polygon
        points="100,62 146,88 136,166 100,192 64,166 54,88"
        fill={accent}
        fillOpacity="0.08"
        stroke={ink}
        strokeWidth="1.8"
      />
      {/* Rank Crown / Crest at Top */}
      {rank === 11 && (
        <path d="M76 88 Q100 68 124 88" stroke={accent} strokeWidth="2.2" fill="none" />
      )}
      {rank === 12 && (
        <polygon points="74,90 100,66 126,90 100,82" fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="1.8" />
      )}
      {rank === 13 && (
        <polygon points="68,90 78,70 100,82 122,70 132,90" fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="1.8" />
      )}
      {rank === 14 && (
        <polygon points="66,92 72,66 88,80 100,62 112,80 128,66 134,92" fill={accent} fillOpacity="0.28" stroke={accent} strokeWidth="2" />
      )}
      {/* Central Suit Emblem */}
      {renderSuitEmblem(card.suit, 100, 134, 1.55, accent)}
    </g>
  );
}

export const TarotCardArtwork: React.FC<TarotCardArtworkProps> = ({
  card,
  isReversed = false,
  className = ''
}) => {
  const palette = SUIT_PALETTE[card.suit];

  return (
    <div
      className={`relative select-none overflow-hidden rounded-lg border border-stone-300 bg-[#FBF9F5] shadow-sm ${className}`}
      style={{ aspectRatio: '2 / 3.3' }}
    >
      <svg
        viewBox="0 0 200 330"
        className={`h-full w-full transition-transform duration-200 ${isReversed ? 'rotate-180' : ''}`}
        role="img"
        aria-label={`${card.name}${isReversed ? ' (Reversed)' : ''}`}
      >
        {/* Aged Paper Base */}
        <rect x="0" y="0" width="200" height="330" fill={palette.paper} />
        <rect x="8" y="8" width="184" height="314" rx="4" fill={palette.tint} stroke={palette.ink} strokeWidth="1.5" />
        <rect x="13" y="13" width="174" height="304" rx="2" fill="none" stroke={palette.accent} strokeWidth="0.75" strokeOpacity="0.6" />

        {/* Corner Ornaments */}
        <circle cx="20" cy="20" r="2" fill={palette.accent} />
        <circle cx="180" cy="20" r="2" fill={palette.accent} />
        <circle cx="20" cy="310" r="2" fill={palette.accent} />
        <circle cx="180" cy="310" r="2" fill={palette.accent} />

        {/* Top Roman Numeral Cartouche */}
        <rect x="64" y="18" width="72" height="22" rx="2" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <text
          x="100"
          y="33"
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          letterSpacing="1.5"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fill={palette.ink}
        >
          {card.numeral.toUpperCase()}
        </text>

        {/* Central Illustration Frame */}
        <rect x="22" y="46" width="156" height="214" fill={palette.paper} stroke={palette.ink} strokeWidth="1.2" />

        {/* Subtle Engraved Background Rays */}
        <line x1="22" y1="46" x2="178" y2="260" stroke={palette.accent} strokeOpacity="0.06" />
        <line x1="178" y1="46" x2="22" y2="260" stroke={palette.accent} strokeOpacity="0.06" />
        <circle cx="100" cy="132" r="56" fill="none" stroke={palette.accent} strokeOpacity="0.12" strokeDasharray="2 3" />

        {/* Card Specific Woodcut Illustration */}
        {card.arcana === 'Major' ? (
          renderMajorArcanaGlyph(card.number, palette.ink, palette.accent)
        ) : card.number <= 10 ? (
          <g>
            {getPipCoordinates(card.number).map(([x, y, scale], idx) => (
              <React.Fragment key={idx}>
                {renderSuitEmblem(card.suit, x, y, scale, palette.accent)}
              </React.Fragment>
            ))}
          </g>
        ) : (
          renderCourtCrest(card, palette.ink, palette.accent)
        )}

        {/* Horizon Grounding Line inside Illustration */}
        <line x1="22" y1="234" x2="178" y2="234" stroke={palette.ink} strokeWidth="0.8" strokeOpacity="0.35" />
        <text
          x="100"
          y="250"
          textAnchor="middle"
          fontSize="8.5"
          letterSpacing="1.8"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fill={palette.accent}
        >
          {card.element.toUpperCase()} · {card.astrology.toUpperCase()}
        </text>

        {/* Bottom Title Cartouche */}
        <rect x="22" y="268" width="156" height="40" rx="2" fill={palette.paper} stroke={palette.ink} strokeWidth="1.2" />
        <text
          x="100"
          y="293"
          textAnchor="middle"
          fontSize="14.5"
          fontWeight="700"
          letterSpacing="0.8"
          fontFamily="Cormorant Garamond, Georgia, serif"
          fill={palette.ink}
        >
          {card.name.toUpperCase()}
        </text>
      </svg>
    </div>
  );
};

export const TarotCardBack: React.FC<{ className?: string; label?: string }> = ({
  className = '',
  label
}) => {
  return (
    <div
      className={`relative select-none overflow-hidden rounded-lg border border-stone-700 bg-[#131B2E] shadow-sm ${className}`}
      style={{ aspectRatio: '2 / 3.3' }}
    >
      <svg viewBox="0 0 200 330" className="h-full w-full" role="img" aria-label={label || 'Tarot Card Back'}>
        <rect x="0" y="0" width="200" height="330" fill="#131B2E" />
        <rect x="10" y="10" width="180" height="310" rx="4" fill="none" stroke="#C69C6D" strokeWidth="1.5" />
        <rect x="16" y="16" width="168" height="298" rx="2" fill="none" stroke="#C69C6D" strokeWidth="0.8" strokeDasharray="3 3" />

        {/* Corner Stars */}
        <circle cx="28" cy="28" r="3" fill="#C69C6D" />
        <circle cx="172" cy="28" r="3" fill="#C69C6D" />
        <circle cx="28" cy="302" r="3" fill="#C69C6D" />
        <circle cx="172" cy="302" r="3" fill="#C69C6D" />

        {/* Symmetrical Astrolabe / Sacred Geometry Medallion */}
        <circle cx="100" cy="165" r="64" fill="none" stroke="#C69C6D" strokeWidth="1.2" />
        <circle cx="100" cy="165" r="52" fill="none" stroke="#C69C6D" strokeWidth="0.8" strokeDasharray="2 4" />
        <polygon points="100,103 154,196 46,196" fill="none" stroke="#C69C6D" strokeWidth="1" strokeOpacity="0.7" />
        <polygon points="100,227 154,134 46,134" fill="none" stroke="#C69C6D" strokeWidth="1" strokeOpacity="0.7" />
        <circle cx="100" cy="165" r="20" fill="#1E293B" stroke="#C69C6D" strokeWidth="1.4" />
        <circle cx="100" cy="165" r="6" fill="#C69C6D" />

        {/* Top & BottomCrescents */}
        <path d="M84 62 A18 18 0 0 0 116 62 A16 16 0 0 1 84 62 Z" fill="#C69C6D" fillOpacity="0.75" />
        <path d="M84 268 A18 18 0 0 1 116 268 A16 16 0 0 0 84 268 Z" fill="#C69C6D" fillOpacity="0.75" />
      </svg>
    </div>
  );
};
