import type { ComponentType, SVGProps } from 'react';
import {
  Heart, Flower2, Star, Cake, Gift, Sun, Moon, Cloud,
  TreePine, Sparkles, Music, Layers,
} from 'lucide-react';
import type { ElementTheme, ElementVariant } from '../../app/types';

type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>;

// ─── SVG data-URI helpers ─────────────────────────────────────────────────────

function svgUri(body: string, viewBox = '0 0 100 100'): string {
  const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="512" height="512">${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(full)}`;
}

// Heart variants
const HEART_PATH = 'M50 85 C25 68, 5 55, 5 35 C5 18, 17 8, 30 8 C38 8, 45 12, 50 18 C55 12, 62 8, 70 8 C83 8, 95 18, 95 35 C95 55, 75 68, 50 85 Z';

// Star variants (5-pointed)
const STAR_PATH = 'M50 8 L61 37 L92 37 L68 56 L77 85 L50 67 L23 85 L32 56 L8 37 L39 37 Z';

// Cake shape
const CAKE_PATH = 'M20 95 L20 55 Q20 45 30 45 L70 45 Q80 45 80 55 L80 95 Z M35 45 L35 35 Q35 20 50 20 Q65 20 65 35 L65 45';
const CANDLE_PATH = 'M48 20 L48 8 M50 20 L50 8 M52 20 L52 8';

// Gift box
const GIFT_BOX = 'M15 45 L15 90 L85 90 L85 45 Z M10 30 L90 30 L90 45 L10 45 Z M50 30 L50 90 M50 30 C50 30 35 15 40 10 C45 5 50 15 50 30 C50 30 65 15 60 10 C55 5 50 15 50 30';

// Sun shape
const SUN_PATH = 'M50 25 A25 25 0 1 1 50 75 A25 25 0 1 1 50 25';
const SUN_RAYS = 'M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50 M18 18 L25 25 M75 75 L82 82 M82 18 L75 25 M25 75 L18 82';

// Moon shape
const MOON_PATH = 'M35 15 A35 35 0 1 0 75 72 A25 25 0 1 1 35 15 Z';

// Cloud shape
const CLOUD_PATH = 'M25 70 Q10 70 10 55 Q10 42 22 40 Q22 25 35 25 Q42 15 55 20 Q65 15 72 25 Q85 25 88 38 Q95 40 95 52 Q95 70 80 70 Z';

// Tree shape
const TREE_PATH = 'M50 10 L15 45 L30 45 L20 65 L35 65 L25 82 L75 82 L65 65 L80 65 L70 45 L85 45 Z M44 82 L44 92 L56 92 L56 82';

// Sparkles
const SPARKLE_MAIN = 'M50 10 L55 42 L87 47 L55 52 L50 84 L45 52 L13 47 L45 42 Z';
const SPARKLE_SM1 = 'M80 15 L82 25 L92 27 L82 29 L80 39 L78 29 L68 27 L78 25 Z';
const SPARKLE_SM2 = 'M18 60 L20 68 L28 70 L20 72 L18 80 L16 72 L8 70 L16 68 Z';

// Music note
const MUSIC_PATH = 'M35 20 L35 70 Q35 82 25 82 Q15 82 15 72 Q15 62 25 62 Q30 62 35 65 M35 20 L75 12 L75 60 Q75 72 65 72 Q55 72 55 62 Q55 52 65 52 Q70 52 75 55 M35 20 L75 12';

function makeTheme(
  id: string,
  label: string,
  icon: LucideIcon,
  color: string,
  bgColor: string,
  variants: ElementVariant[],
): ElementTheme {
  return { id, label, icon, color, bgColor, variants };
}

// ─── Theme definitions ────────────────────────────────────────────────────────

export const ELEMENT_THEMES: ElementTheme[] = [
  makeTheme('hearts', 'Hearts', Heart as LucideIcon, 'text-red-400', 'bg-red-50', [
    { id: 'outline',   label: 'Outline',   src: svgUri(`<path d="${HEART_PATH}" fill="none" stroke="#e11d48" stroke-width="3"/>`) },
    { id: 'filled',    label: 'Filled',    src: svgUri(`<path d="${HEART_PATH}" fill="#f43f5e"/>`) },
    { id: 'soft',      label: 'Soft Pink', src: svgUri(`<path d="${HEART_PATH}" fill="#fda4af"/>`) },
    { id: 'crimson',   label: 'Crimson',   src: svgUri(`<path d="${HEART_PATH}" fill="#9f1239"/>`) },
  ]),

  makeTheme('flowers', 'Flowers', Flower2 as LucideIcon, 'text-pink-400', 'bg-pink-50', [
    { id: 'outline', label: 'Outline',  src: svgUri(`<circle cx="50" cy="50" r="14" fill="none" stroke="#db2777" stroke-width="3"/><circle cx="50" cy="26" r="10" fill="none" stroke="#db2777" stroke-width="2.5"/><circle cx="50" cy="74" r="10" fill="none" stroke="#db2777" stroke-width="2.5"/><circle cx="26" cy="50" r="10" fill="none" stroke="#db2777" stroke-width="2.5"/><circle cx="74" cy="50" r="10" fill="none" stroke="#db2777" stroke-width="2.5"/>`) },
    { id: 'filled',  label: 'Filled',   src: svgUri(`<circle cx="50" cy="50" r="14" fill="#fbbf24"/><circle cx="50" cy="26" r="10" fill="#ec4899"/><circle cx="50" cy="74" r="10" fill="#ec4899"/><circle cx="26" cy="50" r="10" fill="#ec4899"/><circle cx="74" cy="50" r="10" fill="#ec4899"/>`) },
    { id: 'daisy',   label: 'Daisy',    src: svgUri(`<ellipse cx="50" cy="22" rx="8" ry="14" fill="#fde68a" transform="rotate(0 50 50)"/><ellipse cx="50" cy="22" rx="8" ry="14" fill="#fde68a" transform="rotate(45 50 50)"/><ellipse cx="50" cy="22" rx="8" ry="14" fill="#fde68a" transform="rotate(90 50 50)"/><ellipse cx="50" cy="22" rx="8" ry="14" fill="#fde68a" transform="rotate(135 50 50)"/><circle cx="50" cy="50" r="16" fill="#f59e0b"/>`) },
    { id: 'rose',    label: 'Rose',     src: svgUri(`<path d="M50 80 C30 70 15 58 15 42 Q15 28 28 22 Q35 18 42 22 Q46 10 50 10 Q54 10 58 22 Q65 18 72 22 Q85 28 85 42 C85 58 70 70 50 80Z" fill="#f43f5e"/><circle cx="50" cy="40" r="12" fill="#fb7185"/>`) },
  ]),

  makeTheme('stars', 'Stars', Star as LucideIcon, 'text-yellow-400', 'bg-yellow-50', [
    { id: 'outline',  label: 'Outline',  src: svgUri(`<path d="${STAR_PATH}" fill="none" stroke="#ca8a04" stroke-width="3" stroke-linejoin="round"/>`) },
    { id: 'filled',   label: 'Gold',     src: svgUri(`<path d="${STAR_PATH}" fill="#fbbf24" stroke="#f59e0b" stroke-width="1"/>`) },
    { id: 'multi',    label: 'Cluster',  src: svgUri(`<path d="M50 15 L56 33 L75 33 L61 43 L67 61 L50 51 L33 61 L39 43 L25 33 L44 33 Z" fill="#fbbf24"/><path d="M20 60 L22 66 L28 66 L23 70 L25 76 L20 72 L15 76 L17 70 L12 66 L18 66 Z" fill="#fde68a"/><path d="M75 55 L77 61 L83 61 L78 65 L80 71 L75 67 L70 71 L72 65 L67 61 L73 61 Z" fill="#fde68a"/>`) },
    { id: 'sparkle',  label: 'Sparkle',  src: svgUri(`<path d="${SPARKLE_MAIN}" fill="#fbbf24"/>${SPARKLE_SM1.split('M').filter(Boolean).map(p => `<path d="M${p}" fill="#fde68a"/>`).join('')}`) },
  ]),

  makeTheme('cake', 'Birthday Cake', Cake as LucideIcon, 'text-purple-400', 'bg-purple-50', [
    { id: 'outline', label: 'Outline',   src: svgUri(`<path d="${CAKE_PATH}" fill="none" stroke="#9333ea" stroke-width="3" stroke-linejoin="round"/><path d="${CANDLE_PATH}" fill="none" stroke="#f59e0b" stroke-width="2.5"/><circle cx="48" cy="7" r="3" fill="#ef4444"/><circle cx="52" cy="7" r="3" fill="#ef4444"/>`) },
    { id: 'filled',  label: 'Layered',   src: svgUri(`<path d="M20 65 L20 90 L80 90 L80 65 Z" fill="#c084fc"/><path d="M15 50 L15 65 L85 65 L85 50 Z" fill="#e879f9"/><path d="M20 35 L20 50 L80 50 L80 35 Z" fill="#a855f7"/><path d="M10 30 L90 30 L90 35 L10 35 Z" fill="#7c3aed"/><path d="M45 8 L45 30 M50 8 L50 30 M55 8 L55 30" stroke="#f59e0b" stroke-width="3"/><circle cx="45" cy="7" r="4" fill="#ef4444"/><circle cx="50" cy="7" r="4" fill="#3b82f6"/><circle cx="55" cy="7" r="4" fill="#22c55e"/>`) },
    { id: 'simple',  label: 'Simple',    src: svgUri(`<rect x="20" y="50" width="60" height="40" rx="4" fill="#c084fc"/><rect x="10" y="38" width="80" height="14" rx="3" fill="#e879f9"/><path d="M46 10 L46 38 M50 10 L50 38 M54 10 L54 38" stroke="#fbbf24" stroke-width="3"/><ellipse cx="46" cy="9" rx="3" ry="4" fill="#ef4444"/><ellipse cx="50" cy="9" rx="3" ry="4" fill="#60a5fa"/><ellipse cx="54" cy="9" rx="3" ry="4" fill="#4ade80"/>`) },
    { id: 'festive', label: 'Festive',   src: svgUri(`<rect x="18" y="48" width="64" height="42" rx="6" fill="#a855f7"/><rect x="12" y="36" width="76" height="14" rx="4" fill="#d946ef"/><path d="M45 8 L45 36 M50 8 L50 36 M55 8 L55 36" stroke="#fbbf24" stroke-width="3.5"/><circle cx="45" cy="7" r="5" fill="#ef4444"/><circle cx="50" cy="7" r="5" fill="#facc15"/><circle cx="55" cy="7" r="5" fill="#22c55e"/><path d="M18 58 Q50 52 82 58" fill="none" stroke="white" stroke-width="2" opacity="0.4"/>`) },
  ]),

  makeTheme('gift', 'Gift Box', Gift as LucideIcon, 'text-blue-400', 'bg-blue-50', [
    { id: 'outline', label: 'Outline',   src: svgUri(`<path d="${GIFT_BOX}" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linejoin="round"/>`) },
    { id: 'filled',  label: 'Wrapped',   src: svgUri(`<rect x="12" y="42" width="76" height="52" rx="4" fill="#60a5fa"/><rect x="8" y="28" width="84" height="16" rx="4" fill="#3b82f6"/><path d="M50 28 L50 94" stroke="#ef4444" stroke-width="5"/><path d="M8 44 L92 44" stroke="#ef4444" stroke-width="5"/><path d="M50 28 C50 28 35 12 38 8 C41 4 50 14 50 28 C50 28 65 12 62 8 C59 4 50 14 50 28" fill="#ef4444"/>`) },
    { id: 'bow',     label: 'Big Bow',   src: svgUri(`<rect x="15" y="45" width="70" height="48" rx="5" fill="#93c5fd"/><rect x="10" y="33" width="80" height="14" rx="4" fill="#60a5fa"/><path d="M50 33 L50 93" stroke="#fbbf24" stroke-width="6"/><path d="M10 46 L90 46" stroke="#fbbf24" stroke-width="6"/><ellipse cx="34" cy="22" rx="18" ry="10" fill="#fbbf24" transform="rotate(-20 34 22)"/><ellipse cx="66" cy="22" rx="18" ry="10" fill="#fbbf24" transform="rotate(20 66 22)"/><circle cx="50" cy="26" r="8" fill="#f59e0b"/>`) },
    { id: 'polka',   label: 'Polka Dots', src: svgUri(`<rect x="12" y="42" width="76" height="52" rx="4" fill="#3b82f6"/><rect x="8" y="28" width="84" height="16" rx="4" fill="#1d4ed8"/><path d="M50 28 L50 94 M8 44 L92 44" stroke="#fbbf24" stroke-width="5"/><path d="M50 28 C50 28 32 10 36 6 C40 2 50 16 50 28 C50 28 68 10 64 6 C60 2 50 16 50 28" fill="#fbbf24"/><circle cx="28" cy="60" r="5" fill="white" opacity="0.4"/><circle cx="72" cy="65" r="4" fill="white" opacity="0.4"/><circle cx="35" cy="78" r="6" fill="white" opacity="0.4"/><circle cx="65" cy="80" r="5" fill="white" opacity="0.4"/>`) },
  ]),

  makeTheme('sun', 'Sun', Sun as LucideIcon, 'text-orange-400', 'bg-orange-50', [
    { id: 'outline',  label: 'Outline',   src: svgUri(`<circle cx="50" cy="50" r="22" fill="none" stroke="#f97316" stroke-width="3"/><line x1="50" y1="5" x2="50" y2="18" stroke="#f97316" stroke-width="3" stroke-linecap="round"/><line x1="50" y1="82" x2="50" y2="95" stroke="#f97316" stroke-width="3" stroke-linecap="round"/><line x1="5" y1="50" x2="18" y2="50" stroke="#f97316" stroke-width="3" stroke-linecap="round"/><line x1="82" y1="50" x2="95" y2="50" stroke="#f97316" stroke-width="3" stroke-linecap="round"/><line x1="18" y1="18" x2="27" y2="27" stroke="#f97316" stroke-width="3" stroke-linecap="round"/><line x1="73" y1="73" x2="82" y2="82" stroke="#f97316" stroke-width="3" stroke-linecap="round"/><line x1="82" y1="18" x2="73" y2="27" stroke="#f97316" stroke-width="3" stroke-linecap="round"/><line x1="27" y1="73" x2="18" y2="82" stroke="#f97316" stroke-width="3" stroke-linecap="round"/>`) },
    { id: 'filled',   label: 'Golden',    src: svgUri(`<circle cx="50" cy="50" r="22" fill="#fbbf24"/><line x1="50" y1="5" x2="50" y2="18" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/><line x1="50" y1="82" x2="50" y2="95" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/><line x1="5" y1="50" x2="18" y2="50" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/><line x1="82" y1="50" x2="95" y2="50" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/><line x1="18" y1="18" x2="27" y2="27" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/><line x1="73" y1="73" x2="82" y2="82" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/><line x1="82" y1="18" x2="73" y2="27" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/><line x1="27" y1="73" x2="18" y2="82" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>`) },
    { id: 'face',     label: 'Smiley',    src: svgUri(`<circle cx="50" cy="50" r="28" fill="#fbbf24"/><circle cx="42" cy="44" r="4" fill="#92400e"/><circle cx="58" cy="44" r="4" fill="#92400e"/><path d="M38 58 Q50 68 62 58" fill="none" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>`) },
    { id: 'burst',    label: 'Burst',     src: svgUri(`<path d="M50 10 L55 38 L80 25 L62 47 L90 50 L62 53 L80 75 L55 62 L50 90 L45 62 L20 75 L38 53 L10 50 L38 47 L20 25 L45 38 Z" fill="#fbbf24"/>`) },
  ]),

  makeTheme('moon', 'Moon', Moon as LucideIcon, 'text-indigo-400', 'bg-indigo-50', [
    { id: 'outline',  label: 'Outline',   src: svgUri(`<path d="${MOON_PATH}" fill="none" stroke="#6366f1" stroke-width="3"/>`) },
    { id: 'filled',   label: 'Indigo',    src: svgUri(`<path d="${MOON_PATH}" fill="#6366f1"/>`) },
    { id: 'starry',   label: 'Starry',    src: svgUri(`<path d="${MOON_PATH}" fill="#4338ca"/><circle cx="70" cy="20" r="3" fill="#fde68a"/><circle cx="80" cy="40" r="2" fill="#fde68a"/><circle cx="65" cy="35" r="2" fill="#fde68a"/><circle cx="82" cy="62" r="3" fill="#fde68a"/><circle cx="75" cy="75" r="2" fill="#fde68a"/>`) },
    { id: 'crescent', label: 'Crescent',  src: svgUri(`<path d="M60 15 A32 32 0 1 0 60 85 A22 22 0 1 1 60 15 Z" fill="#818cf8"/>`) },
  ]),

  makeTheme('clouds', 'Clouds', Cloud as LucideIcon, 'text-sky-400', 'bg-sky-50', [
    { id: 'outline', label: 'Outline',    src: svgUri(`<path d="${CLOUD_PATH}" fill="none" stroke="#0ea5e9" stroke-width="3"/>`) },
    { id: 'filled',  label: 'Sky Blue',   src: svgUri(`<path d="${CLOUD_PATH}" fill="#38bdf8"/>`) },
    { id: 'rain',    label: 'Rain',       src: svgUri(`<path d="${CLOUD_PATH}" fill="#7dd3fc"/><line x1="30" y1="78" x2="25" y2="95" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/><line x1="45" y1="78" x2="40" y2="95" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/><line x1="60" y1="78" x2="55" y2="95" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/><line x1="75" y1="78" x2="70" y2="95" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round"/>`) },
    { id: 'puffy',   label: 'Puffy',      src: svgUri(`<circle cx="35" cy="60" r="20" fill="#e0f2fe"/><circle cx="55" cy="50" r="26" fill="#bae6fd"/><circle cx="72" cy="58" r="18" fill="#e0f2fe"/><rect x="15" y="60" width="65" height="22" fill="#e0f2fe"/>`) },
  ]),

  makeTheme('trees', 'Trees', TreePine as LucideIcon, 'text-green-400', 'bg-green-50', [
    { id: 'outline',  label: 'Outline',   src: svgUri(`<path d="${TREE_PATH}" fill="none" stroke="#16a34a" stroke-width="3" stroke-linejoin="round"/>`) },
    { id: 'filled',   label: 'Forest',    src: svgUri(`<path d="${TREE_PATH}" fill="#22c55e"/>`) },
    { id: 'layered',  label: 'Layered',   src: svgUri(`<path d="M50 10 L22 40 L35 40 L28 58 L38 58 L30 75 L70 75 L62 58 L72 58 L65 40 L78 40 Z" fill="#4ade80"/><path d="M50 20 L28 46 L38 46 L32 62 L68 62 L62 46 L72 46 Z" fill="#22c55e"/><rect x="44" y="75" width="12" height="15" fill="#78350f"/>`) },
    { id: 'snowy',    label: 'Snowy',     src: svgUri(`<path d="${TREE_PATH}" fill="#15803d"/><path d="M50 10 L35 30 L38 30 L30 45 L35 45 L27 60 L73 60 L65 45 L70 45 L62 30 L65 30 Z" fill="white" opacity="0.4"/>`) },
  ]),

  makeTheme('sparkles', 'Sparkles', Sparkles as LucideIcon, 'text-yellow-300', 'bg-yellow-50', [
    { id: 'outline',  label: 'Outline',   src: svgUri(`<path d="${SPARKLE_MAIN}" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linejoin="round"/><path d="${SPARKLE_SM1}" fill="none" stroke="#ca8a04" stroke-width="2"/><path d="${SPARKLE_SM2}" fill="none" stroke="#ca8a04" stroke-width="2"/>`) },
    { id: 'gold',     label: 'Gold',      src: svgUri(`<path d="${SPARKLE_MAIN}" fill="#fbbf24"/><path d="${SPARKLE_SM1}" fill="#fde68a"/><path d="${SPARKLE_SM2}" fill="#fde68a"/>`) },
    { id: 'rainbow',  label: 'Rainbow',   src: svgUri(`<path d="${SPARKLE_MAIN}" fill="#f43f5e"/><path d="${SPARKLE_SM1}" fill="#3b82f6"/><path d="${SPARKLE_SM2}" fill="#22c55e"/>`) },
    { id: 'confetti', label: 'Confetti',  src: svgUri(`<path d="${SPARKLE_MAIN}" fill="#fbbf24"/><rect x="10" y="20" width="8" height="8" fill="#f43f5e" transform="rotate(20 14 24)"/><rect x="78" y="60" width="8" height="8" fill="#3b82f6" transform="rotate(-15 82 64)"/><rect x="20" y="70" width="6" height="6" fill="#22c55e" transform="rotate(30 23 73)"/><circle cx="85" cy="20" r="5" fill="#a855f7"/>`) },
  ]),

  makeTheme('music', 'Music Notes', Music as LucideIcon, 'text-violet-400', 'bg-violet-50', [
    { id: 'outline', label: 'Outline',    src: svgUri(`<path d="${MUSIC_PATH}" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="25" cy="70" r="8" fill="none" stroke="#7c3aed" stroke-width="3"/><circle cx="65" cy="60" r="8" fill="none" stroke="#7c3aed" stroke-width="3"/>`) },
    { id: 'filled',  label: 'Purple',     src: svgUri(`<path d="${MUSIC_PATH}" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="25" cy="70" r="8" fill="#a855f7"/><circle cx="65" cy="60" r="8" fill="#a855f7"/>`) },
    { id: 'notes',   label: 'Multi',      src: svgUri(`<path d="M20 20 L20 55 M20 20 L48 12 L48 47" stroke="#7c3aed" stroke-width="4" stroke-linecap="round"/><circle cx="12" cy="57" r="9" fill="#a855f7"/><circle cx="40" cy="49" r="9" fill="#c084fc"/><path d="M58 35 L58 70 M58 35 L86 27 L86 62" stroke="#6d28d9" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="72" r="9" fill="#7c3aed"/><circle cx="78" cy="64" r="9" fill="#8b5cf6"/>`) },
    { id: 'dance',   label: 'Dancing',    src: svgUri(`<path d="M25 18 L25 62 Q25 72 15 72 Q5 72 5 62 Q5 52 15 52 Q20 52 25 55 M25 18 L65 8 L65 52 Q65 62 55 62 Q45 62 45 52 Q45 42 55 42 Q60 42 65 45 M25 18 L65 8" fill="none" stroke="#7c3aed" stroke-width="3.5" stroke-linecap="round"/>`) },
  ]),

  makeTheme('hearts-stack', 'Hearts Stack', Layers as LucideIcon, 'text-rose-400', 'bg-rose-50', [
    { id: 'outline', label: 'Outline',    src: svgUri(`<path d="M50 78 C30 65, 12 52, 12 36 C12 22, 22 14, 33 14 C40 14, 46 18, 50 23 C54 18, 60 14, 67 14 C78 14, 88 22, 88 36 C88 52, 70 65, 50 78Z" fill="none" stroke="#fb7185" stroke-width="3"/><path d="M38 72 C22 60, 8 48, 8 32 C8 18, 17 10, 28 10 C35 10, 40 14, 44 18" fill="none" stroke="#fda4af" stroke-width="2.5" stroke-dasharray="5 3"/>`) },
    { id: 'filled',  label: 'Stacked',    src: svgUri(`<path d="M50 85 C25 70, 5 55, 5 38 C5 22, 17 12, 30 12 C38 12, 45 16, 50 22 C55 16, 62 12, 70 12 C83 12, 95 22, 95 38 C95 55, 75 70, 50 85Z" fill="#fda4af"/><path d="M50 75 C28 62, 12 50, 12 35 C12 21, 22 13, 33 13 C40 13, 46 17, 50 22 C54 17, 60 13, 67 13 C78 13, 88 21, 88 35 C88 50, 72 62, 50 75Z" fill="#fb7185"/><path d="M50 65 C30 54, 18 44, 18 32 C18 21, 26 15, 35 15 C41 15, 46 18, 50 23 C54 18, 59 15, 65 15 C74 15, 82 21, 82 32 C82 44, 70 54, 50 65Z" fill="#f43f5e"/>`) },
    { id: 'gradient', label: 'Gradient',  src: svgUri(`<defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fda4af"/><stop offset="100%" stop-color="#be123c"/></linearGradient></defs><path d="${HEART_PATH}" fill="url(#hg)"/>`) },
    { id: 'trio',    label: 'Trio',       src: svgUri(`<path d="M50 80 C30 67, 14 55, 14 38 C14 24, 24 16, 35 16 C42 16, 47 20, 50 25 C53 20, 58 16, 65 16 C76 16, 86 24, 86 38 C86 55, 70 67, 50 80Z" fill="#f43f5e"/><path d="M26 60 C16 50, 8 42, 8 32 C8 22, 14 17, 21 17 C25 17, 28 19, 30 22 C32 19, 35 17, 39 17 C46 17, 52 22, 52 32 C52 42, 42 50, 26 60Z" fill="#fb7185" opacity="0.7"/><path d="M74 60 C64 50, 56 42, 56 32 C56 22, 62 17, 69 17 C73 17, 76 19, 78 22 C80 19, 83 17, 87 17 C94 17, 100 22, 100 32 C100 42, 90 50, 74 60Z" fill="#fb7185" opacity="0.7"/>`) },
  ]),
];
