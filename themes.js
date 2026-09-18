// Rolls — shared film-stock theme palettes + resolver
const hx = (c) => { const n = c.replace('#',''); return [parseInt(n.slice(0,2),16), parseInt(n.slice(2,4),16), parseInt(n.slice(4,6),16)]; };
const hex = (r,g,b) => '#' + [r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return hex(A[0]+(B[0]-A[0])*t, A[1]+(B[1]-A[1])*t, A[2]+(B[2]-A[2])*t); };
const bright = (c) => { const [r,g,b] = hx(c); return (0.299*r + 0.587*g + 0.114*b) / 255; };
const btnTextFor = (btn) => bright(btn) > 0.52 ? '#241F15' : '#EFE9DB';

function lightVars(paper, ink, btn) {
  return {
    paper, paperDeep: mix(paper,'#000000',0.035), paper2: mix(paper,'#000000',0.012),
    rail: mix(paper,'#ffffff',0.10), cardAlt: mix(paper,'#ffffff',0.14), chip: mix(paper,'#ffffff',0.17),
    card: mix(paper,'#ffffff',0.28), panel: mix(paper,'#ffffff',0.31), card2: mix(paper,'#ffffff',0.38),
    field: mix(paper,'#ffffff',0.62),
    ink, ink2: mix(ink,paper,0.18), muted: mix(ink,paper,0.55), muted2: mix(ink,paper,0.48),
    muted3: mix(ink,paper,0.42), muted4: mix(ink,paper,0.38),
    btn, brgb: hx(ink).join(','),
    btnText: btnTextFor(btn), btnTextRgb: hx(btnTextFor(btn)).join(','),
  };
}
function darkVars(paper, ink, btn) {
  return {
    paper, paperDeep: mix(paper,'#000000',0.25), paper2: mix(paper,'#ffffff',0.02),
    rail: mix(paper,'#ffffff',0.045), cardAlt: mix(paper,'#ffffff',0.06), chip: mix(paper,'#ffffff',0.085),
    card: mix(paper,'#ffffff',0.07), panel: mix(paper,'#ffffff',0.095), card2: mix(paper,'#ffffff',0.11),
    field: mix(paper,'#ffffff',0.13),
    ink, ink2: mix(ink,paper,0.15), muted: mix(ink,paper,0.40), muted2: mix(ink,paper,0.34),
    muted3: mix(ink,paper,0.28), muted4: mix(ink,paper,0.25),
    btn, brgb: hx(ink).join(','),
    btnText: btnTextFor(btn), btnTextRgb: hx(btnTextFor(btn)).join(','),
  };
}

const seeds = [
  ['Portra 400',     '#E8E1D3','#2A2823','#26241F',  '#17130E','#EFE9DB','#8A6134',  'Warm paper · ledger brown'],
  ['Tri-X 400',      '#E4E2DD','#1C1B19','#1C1B19',  '#151413','#F2F1EE','#3A3936',  'Pure grayscale · high contrast'],
  ['CineStill 800T', '#E3E7F2','#1B2236','#2A3A63',  '#141928','#E8EDF8','#33477A',  'Cool night blue · halation red'],
  ['Velvia 50',      '#E6EDDF','#1F2A1C','#1F5A2E',  '#101810','#E8F2E2','#27633A',  'Saturated greens · vivid'],
  ['Gold 200',       '#F0E0BF','#3A2C14','#C07F17',  '#1D1408','#F7EFDC','#B5851F',  'Sun-faded amber warmth'],
  ['Darkroom',       '#F4E4DC','#3A1611','#C8402E',  '#1A0908','#F8C9BD','#A5301F',  'Red safelight glow'],
];

export const THEME_ORDER = seeds.map(s => s[0]);
export const THEMES = {};
seeds.forEach(([name, pL, iL, bL, pD, iD, bD, desc]) => {
  THEMES[name] = {
    desc,
    light: lightVars(pL, iL, bL),
    dark: darkVars(pD, iD, bD),
    swatches: [pL, bL, pD, iD],
  };
});

export function resolveTheme(name, appearance, prefersDark) {
  const t = THEMES[name] || THEMES['Portra 400'];
  const dark = appearance === 'dark' || (appearance !== 'light' && prefersDark);
  return t[dark ? 'dark' : 'light'];
}
