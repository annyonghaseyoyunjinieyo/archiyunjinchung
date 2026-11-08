/* ==========================================================
   Isometric construction site — Yunjin Chung portfolio
   World units → screen: x goes down-right, y goes down-left, z up.
   ========================================================== */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const K = 8.2, C = Math.cos(Math.PI / 6), S = 0.5, OX = 930, OY = 404;
  const LINE = '#2b2b2b';

  const P = (x, y, z = 0) => [OX + (x - y) * C * K, OY + (x + y) * S * K - z * K];
  const D = (x, y, z = 0) => [(x - y) * C * K, (x + y) * S * K - z * K];

  const svg = document.getElementById('scene');

  function E(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const pts = (arr) => arr.map((q) => { const s = P(q[0], q[1], q[2] || 0); return s[0].toFixed(1) + ',' + s[1].toFixed(1); }).join(' ');
  const poly = (p, c, fill, o = {}) =>
    E('polygon', Object.assign({ points: pts(c), fill, stroke: LINE, 'stroke-width': 0.8, 'stroke-linejoin': 'round' }, o), p);
  const line = (p, a, b, o = {}) => {
    const A = P(...a), B = P(...b);
    return E('line', Object.assign({ x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: LINE, 'stroke-width': 0.8 }, o), p);
  };

  const faceR = (x0, y0, z0, x1, y1, z1) => [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]];
  const faceL = (x0, y0, z0, x1, y1, z1) => [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
  const faceT = (x0, y0, z0, x1, y1, z1) => [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];

  /** Draw an axis-aligned box (visible faces: +x "R", +y "L", top "T"). */
  function box(p, a, b, o = {}) {
    const q = [a[0], a[1], a[2], b[0], b[1], b[2]];
    const st = { 'stroke-width': o.sw ?? 0.8 };
    if (o.noStroke) st.stroke = 'none';
    const r = {};
    r.R = poly(p, faceR(...q), o.R || '#d3d3cf', st);
    if (o.hatch) poly(p, faceR(...q), 'url(#hatchV)', { stroke: 'none' });
    r.L = poly(p, faceL(...q), o.L || '#e9e9e6', st);
    if (o.hatch) poly(p, faceL(...q), 'url(#hatchV2)', { stroke: 'none' });
    if (!o.noTop) r.T = poly(p, faceT(...q), o.T || '#f8f8f6', st);
    return r;
  }
  function setBox(r, a, b) {
    const q = [a[0], a[1], a[2], b[0], b[1], b[2]];
    r.R.setAttribute('points', pts(faceR(...q)));
    r.L.setAttribute('points', pts(faceL(...q)));
    r.T.setAttribute('points', pts(faceT(...q)));
  }

  /** Text lying on a +y face (runs along x) or +x face (runs along -y). */
  function faceText(p, str, x, y, z, face, o = {}) {
    const [sx, sy] = P(x, y, z);
    const m = face === 'L' ? `matrix(${C},${S},0,1,${sx},${sy})` : `matrix(${C},${-S},0,1,${sx},${sy})`;
    const t = E('text', Object.assign({ transform: m, 'font-size': 8.5, 'font-weight': 700, fill: LINE, 'letter-spacing': 1 }, o), p);
    t.textContent = str;
    return t;
  }

  /* ---------- layers ---------- */
  const gGround = E('g', {}, svg);
  const gObj = E('g', {}, svg);
  const gTop = E('g', {}, svg);

  /* ---------- sortable objects ---------- */
  const objs = [];
  const addObj = (g, b, layer = 0) => { const o = { g, b, layer }; objs.push(o); return o; };

  /* ==========================================================
     GROUND
     ========================================================== */
  const R0 = -320, R1 = 320;
  poly(gGround, [[R0, R0], [R1, R0], [R1, R1], [R0, R1]], '#f3f2ee', { stroke: 'none' });
  poly(gGround, [[R0, R0], [R1, R0], [R1, R1], [R0, R1]], 'url(#hatchG)', { stroke: 'none' });

  // plaza behind the site
  poly(gGround, [[-96, -86], [40, -86], [40, -8], [-96, -8]], '#efcfe0', { 'stroke-width': 0.8 });
  poly(gGround, [[-96, -86], [40, -86], [40, -8], [-96, -8]], 'url(#dots)', { stroke: 'none' });

  // construction site ground
  poly(gGround, [[0, 0], [40, 0], [40, 40], [0, 40]], '#e6e0d3');
  for (let i = 0; i < 26; i++) { // dirt specks
    const x = 2 + ((i * 37) % 36), y = 2 + ((i * 53) % 36);
    const [sx, sy] = P(x, y);
    E('ellipse', { cx: sx, cy: sy, rx: 3, ry: 1.4, fill: '#cfc6b3' }, gGround);
  }

  // roads
  const ROAD = '#d9a5c2';
  const roadA = [[R0, 46], [R1, 46], [R1, 58], [R0, 58]];
  const roadB = [[46, R0], [58, R0], [58, R1], [46, R1]];
  [roadA, roadB].forEach((r) => {
    poly(gGround, r, ROAD, { stroke: 'none' });
    poly(gGround, r, 'url(#dots)', { stroke: 'none' });
  });
  // curbs
  const curb = { stroke: '#8c5a74', 'stroke-width': 1 };
  [46, 58].forEach((v) => {
    line(gGround, [R0, v], [46, v], curb); line(gGround, [58, v], [R1, v], curb);
    line(gGround, [v, R0], [v, 46], curb); line(gGround, [v, 58], [v, R1], curb);
  });
  // lane dashes
  for (let s = R0; s < R1; s += 5) {
    if (s > 38 && s < 64) continue;
    poly(gGround, [[s, 51.85], [s + 2.4, 51.85], [s + 2.4, 52.15], [s, 52.15]], '#fff', { stroke: 'none' });
    poly(gGround, [[51.85, s], [52.15, s], [52.15, s + 2.4], [51.85, s + 2.4]], '#fff', { stroke: 'none' });
  }
  // crosswalks
  const zebra = { stroke: 'none' };
  for (let i = 0; i < 9; i++) {
    const t = 46.7 + i * 1.25;
    [[39.5, 44.5], [59.5, 64.5]].forEach(([a, b]) => {
      poly(gGround, [[a, t], [b, t], [b, t + 0.6], [a, t + 0.6]], '#fff', zebra);
      poly(gGround, [[t, a], [t + 0.6, a], [t + 0.6, b], [t, b]], '#fff', zebra);
    });
  }

  /* ==========================================================
     SURROUNDING BLOCKS (white massing models)
     ========================================================== */
  const WALL = { hatch: true, R: '#d6d6d2', L: '#ececea', T: '#fbfbfa' };

  function flatBlock(x0, y0, x1, y1, h) {
    const g = E('g', {}, gObj);
    box(g, [x0, y0, 0], [x1, y1, h], WALL);
    // parapet line
    poly(g, faceT(x0 + 0.8, y0 + 0.8, h, x1 - 0.8, y1 - 0.8, h), 'none', { 'stroke-width': 0.5, 'stroke-opacity': 0.5 });
    addObj(g, [x0, y0, 0, x1, y1, h]);
  }
  function gableBlock(x0, y0, x1, y1, h, rh) {
    const g = E('g', {}, gObj);
    const ym = (y0 + y1) / 2, zr = h + rh;
    poly(g, [[x0, y0, h], [x1, y0, h], [x1, ym, zr], [x0, ym, zr]], '#fdfdfc');
    const gable = [[x1, y0, 0], [x1, y1, 0], [x1, y1, h], [x1, ym, zr], [x1, y0, h]];
    poly(g, gable, '#d6d6d2'); poly(g, gable, 'url(#hatchV)', { stroke: 'none' });
    poly(g, faceL(x0, y0, 0, x1, y1, h), '#ececea'); poly(g, faceL(x0, y0, 0, x1, y1, h), 'url(#hatchV2)', { stroke: 'none' });
    poly(g, [[x0, ym, zr], [x1, ym, zr], [x1, y1, h], [x0, y1, h]], '#f5f5f3');
    addObj(g, [x0, y0, 0, x1, y1, zr]);
  }

  gableBlock(-64, 66, -10, 104, 13, 6);
  flatBlock(-4, 66, 38, 100, 17);
  gableBlock(66, 66, 118, 104, 11, 5);
  flatBlock(66, -8, 106, 40, 21);
  gableBlock(66, -60, 104, -16, 15, 6);
  flatBlock(-66, 4, -18, 40, 19);

  /* ==========================================================
     TREES, LAMPS, TRAFFIC LIGHTS
     ========================================================== */
  function tree(x, y, sc = 1) {
    const g = E('g', {}, gObj);
    const [bx, by] = P(x, y, 0);
    const [cx, cy] = P(x, y, 3.6 * sc);
    E('ellipse', { cx: bx + 4, cy: by + 1, rx: 7 * sc, ry: 2.6 * sc, fill: '#000', 'fill-opacity': 0.08 }, g);
    E('line', { x1: bx, y1: by, x2: bx, y2: cy + 10 * sc, stroke: '#5b5048', 'stroke-width': 1.4 }, g);
    const rx = 8.5 * sc, ry = 22 * sc;
    E('ellipse', { cx, cy, rx, ry, fill: '#6fae9d', stroke: '#2f5a50', 'stroke-width': 0.8 }, g);
    E('path', { d: `M${cx},${cy - ry} A${rx},${ry} 0 0 0 ${cx},${cy + ry} Z`, fill: '#4f8b7b' }, g);
    for (let i = -2; i <= 2; i++) E('line', { x1: cx - 3, y1: cy + i * 6, x2: cx + 3, y2: cy + i * 6 - 3, stroke: '#2f5a50', 'stroke-width': 0.6, 'stroke-opacity': 0.5 }, g);
    addObj(g, [x - 0.8, y - 0.8, 0, x + 0.8, y + 0.8, 7 * sc]);
  }
  for (let x = -84; x <= 30; x += 12) for (let y = -76; y <= -16; y += 12) tree(x + ((y / 12) % 2 ? 4 : 0), y, 1.05);
  for (let x = -110; x <= 36; x += 11) tree(x, 62.6, 0.85);
  for (let y = -110; y <= 36; y += 11) tree(62.6, y, 0.85);
  for (let x = -60; x <= -20; x += 10) tree(x, 44.6, 0.8);
  for (let y = -60; y <= -14; y += 10) tree(44.6, y, 0.8);

  function lamp(x, y) {
    const g = E('g', {}, gObj);
    line(g, [x, y, 0], [x, y, 5.6], { 'stroke-width': 1.1 });
    line(g, [x, y, 5.6], [x + 0.9, y - 0.9, 5.8], { 'stroke-width': 1.1 });
    const [sx, sy] = P(x + 0.9, y - 0.9, 5.8);
    E('rect', { x: sx - 2.5, y: sy - 1, width: 5, height: 2.4, fill: '#2b2b2b' }, g);
    addObj(g, [x - 0.2, y - 0.2, 0, x + 0.2, y + 0.2, 6]);
  }
  [[-30, 45.4], [0, 45.4], [-80, 59], [-20, 59], [20, 59], [45.4, -30], [45.4, 0], [59, -40], [59, 10], [80, 59], [59, 80]]
    .forEach(([x, y]) => lamp(x, y));

  const signals = [];
  function signal(x, y, road) {
    const g = E('g', {}, gObj);
    line(g, [x, y, 0], [x, y, 4.4], { 'stroke-width': 1.2 });
    const [sx, sy] = P(x, y, 4.4);
    E('rect', { x: sx - 3, y: sy - 11, width: 6, height: 12, rx: 1, fill: '#f2c230', stroke: LINE, 'stroke-width': 0.8 }, g);
    const lamp = E('circle', { cx: sx, cy: sy - 5, r: 1.9, fill: '#3ec46d' }, g);
    signals.push({ lamp, road });
    addObj(g, [x - 0.3, y - 0.3, 0, x + 0.3, y + 0.3, 5.5]);
  }
  signal(45, 45, 'A'); signal(59, 59, 'A'); signal(59, 45, 'B'); signal(45, 59, 'B');

  /* ==========================================================
     PEOPLE (silhouettes)
     ========================================================== */
  function personShape(g, sx, sy, o = {}) {
    const s = o.s || 1, hat = o.hat || '#ffffff', body = o.body || '#1c1c1c';
    E('path', { d: `M${sx - 2.4 * s},${sy - 13 * s} h${4.8 * s} l${0.6 * s},${7 * s} h${-6 * s} z`, fill: body }, g);
    const legs = E('path', { d: `M${sx - 1.6 * s},${sy - 6 * s} l${-0.6 * s},${6 * s} M${sx + 1.6 * s},${sy - 6 * s} l${0.6 * s},${6 * s}`, stroke: '#1c1c1c', 'stroke-width': 1.6 * s, 'stroke-linecap': 'round' }, g);
    E('circle', { cx: sx, cy: sy - 15.6 * s, r: 2.4 * s, fill: '#1c1c1c' }, g);
    if (o.helmet) E('path', { d: `M${sx - 2.8 * s},${sy - 16 * s} a${2.8 * s},${2.8 * s} 0 0 1 ${5.6 * s},0 z`, fill: hat, stroke: '#1c1c1c', 'stroke-width': 0.4 }, g);
    return legs;
  }

  /* ==========================================================
     CONSTRUCTION FENCE + SITE PROPS
     ========================================================== */
  const FENCE = { R: '#e4e4e0', L: '#fafaf8', T: '#ffffff', sw: 0.7 };
  function fence(x0, y0, x1, y1, txt) {
    const g = E('g', {}, gObj);
    const r = box(g, [x0, y0, 0], [x1, y1, 2.4], FENCE);
    // pink stripe
    poly(g, faceL(x0, y0, 0.25, x1, y1, 0.55), '#d98ab3', { stroke: 'none' });
    poly(g, faceR(x0, y0, 0.25, x1, y1, 0.55), '#c47099', { stroke: 'none' });
    if (txt) faceText(g, txt, x0 + 0.8, y1, 1.0, 'L', { 'font-size': 7.5, 'letter-spacing': 1.4 });
    addObj(g, [x0, y0, 0, x1, y1, 2.4]);
    return r;
  }
  fence(0, 0, 40, 0.3);
  fence(0, 0.3, 0.3, 40);
  fence(39.7, 0.3, 40, 17);
  fence(39.7, 23, 40, 39.7);
  fence(0.3, 39.7, 16, 40, 'Y.C ARCHITECTURE');
  fence(24, 39.7, 39.7, 40, 'PORTFOLIO 2026');

  // site office container
  (() => {
    const g = E('g', {}, gObj);
    box(g, [36.6, 1.4, 0], [39.3, 9.5, 2.8], { R: '#a9c0bb', L: '#c8d9d5', T: '#e8efed' });
    poly(g, faceR(36.6, 3, 0.9, 39.3, 4.6, 2.1), '#e7f0f2');
    poly(g, faceR(36.6, 6, 0.9, 39.3, 7.6, 2.1), '#e7f0f2');
    addObj(g, [36.6, 1.4, 0, 39.3, 9.5, 2.8]);
  })();
  // material stack near gate
  (() => {
    const g = E('g', {}, gObj);
    box(g, [4, 34.5, 0], [14, 37.5, 0.5], { R: '#9aa3a8', L: '#b9c0c4', T: '#d9dde0' });
    box(g, [4.5, 35, 0.5], [13.5, 37, 1.0], { R: '#9aa3a8', L: '#b9c0c4', T: '#e6e9eb' });
    addObj(g, [4, 34.5, 0, 14, 37.5, 1]);
  })();
  // site worker at the gate
  (() => {
    const g = E('g', {}, gObj);
    const [sx, sy] = P(20, 38.5, 0);
    personShape(g, sx, sy, { helmet: true, hat: '#f2b134' });
    E('line', { x1: sx + 2, y1: sy - 11, x2: sx + 7, y2: sy - 16, stroke: '#1c1c1c', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
    addObj(g, [19.7, 38.2, 0, 20.3, 38.8, 2]);
  })();

  /* ==========================================================
     MAIN BUILDING (Yunjin's portfolio, under construction)
     ========================================================== */
  const gB = E('g', {}, gObj);
  addObj(gB, [2, 3, 0, 36.2, 33, 30]);

  // pilotis columns behind lobby
  const col = (x, y, z0, z1) => box(gB, [x, y, z0], [x + 0.8, y + 0.8, z1], { R: '#d8d8d4', L: '#f2f2f0', T: '#fff' });
  col(4, 4, 0, 6);
  // glass lobby
  box(gB, [7, 7, 0], [32, 28, 6], { R: '#c4d6dc', L: '#d9e7eb', T: '#f0f0ee' });
  for (let x = 9.5; x < 32; x += 2.5) line(gB, [x, 28, 0], [x, 28, 6], { 'stroke-width': 0.6 });
  for (let y = 9.5; y < 28; y += 2.5) line(gB, [32, y, 0], [32, y, 6], { 'stroke-width': 0.6 });
  line(gB, [7, 28, 4.6], [32, 28, 4.6], { 'stroke-width': 0.6 });
  line(gB, [32, 7, 4.6], [32, 28, 4.6], { 'stroke-width': 0.6 });
  poly(gB, faceL(15, 0, 0, 19, 28, 3.6), '#a9bfc6');
  box(gB, [13.5, 28, 3.9], [20.5, 31, 4.3], { R: '#cfcfcb', L: '#e9e9e6', T: '#fff' });
  col(33.2, 4, 0, 6);
  col(4, 29.2, 0, 6);
  col(33.2, 29.2, 0, 6);
  // lobby people
  personShape(gB, ...P(24, 25, 0), { s: 0.9 });
  personShape(gB, ...P(11, 31, 0), { s: 0.9 });

  const FLOORS = [
    { id: 'skills', num: '01', label: '01F', name: 'SKILLS', href: 'skills.html', a: [4, 4, 6], b: [34, 30, 12], style: 'fins',
      title: 'Skills & Certificates', text: 'Revit・AutoCAD・SketchUp などのソフトと、TOEIC・JLPT の成績。' },
    { id: 'about', num: '02', label: '02F', name: 'ABOUT', href: 'about.html', a: [2, 7, 12], b: [32, 33, 18], style: 'ribbon',
      title: 'About me', text: '学歴・インターン経験・フェンシング部・3か国語。' },
    { id: 'projects', num: '03', label: '03F', name: 'PROJECTS', href: 'projects.html', a: [6, 3, 18], b: [36, 29, 24], style: 'grid',
      title: 'Projects', text: 'Inside Out・Secret. など、設計課題から1年次の作品まで5つのプロジェクト。' },
  ];

  function drawFloor(f) {
    const g = E('g', { class: 'floor', 'data-floor': f.id }, gB);
    const [x0, y0, z0] = f.a, [x1, y1, z1] = f.b;
    box(g, f.a, f.b, { hatch: true, R: '#d2d2ce', L: '#ececea', T: '#f8f8f6', sw: 1 });
    const wb = z0 + 1.5, wt = z1 - 0.9;
    poly(g, faceL(x0 + 0.8, 0, wb, x1 - 0.8, y1, wt), '#d3e1e6', { 'stroke-width': 0.7 });
    poly(g, faceR(0, y0 + 0.8, wb, x1, y1 - 0.8, wt), '#bccfd5', { 'stroke-width': 0.7 });
    const m = { 'stroke-width': 0.55 };
    if (f.style === 'fins') {
      for (let x = x0 + 1.6; x < x1 - 0.8; x += 1.5) box(g, [x, y1, wb - 0.3], [x + 0.25, y1 + 0.7, wt + 0.3], { R: '#e0e0dc', L: '#fff', T: '#fff', sw: 0.5 });
      for (let y = y0 + 2.2; y < y1 - 0.8; y += 1.5) line(g, [x1, y, wb], [x1, y, wt], m);
    } else if (f.style === 'ribbon') {
      for (let x = x0 + 3.8; x < x1 - 0.8; x += 3) line(g, [x, y1, wb], [x, y1, wt], m);
      for (let y = y0 + 3.8; y < y1 - 0.8; y += 3) line(g, [x1, y, wb], [x1, y, wt], m);
    } else {
      const zm = (wb + wt) / 2;
      line(g, [x0 + 0.8, y1, zm], [x1 - 0.8, y1, zm], m);
      line(g, [x1, y0 + 0.8, zm], [x1, y1 - 0.8, zm], m);
      for (let x = x0 + 2.8; x < x1 - 0.8; x += 2) line(g, [x, y1, wb], [x, y1, wt], m);
      for (let y = y0 + 2.8; y < y1 - 0.8; y += 2) line(g, [x1, y, wb], [x1, y, wt], m);
    }
    faceText(g, `${f.label}  ${f.name}`, x0 + 1, y1, z0 + 0.38, 'L', { 'font-size': 8 });
    f.hl = [
      poly(g, faceL(...f.a, ...f.b), '#e58fb8', { stroke: 'none', opacity: 0, class: 'hl' }),
      poly(g, faceR(...f.a, ...f.b), '#c9558c', { stroke: 'none', opacity: 0, class: 'hl' }),
    ];
    f.g = g;
  }
  FLOORS.forEach(drawFloor);

  // steel frame on top — the floor under construction
  (() => {
    const z0 = 24, z1 = 30;
    const beam = (a, b) => box(gB, a, b, { R: '#c9c9c4', L: '#ffffff', T: '#ffffff', sw: 0.8 });
    const steel = (x, y) => box(gB, [x, y, z0], [x + 0.8, y + 0.8, z1], { R: '#cfcfcb', L: '#ffffff', T: '#ffffff', sw: 0.8 });
    beam([6, 3, 29.3], [36, 3.8, 30]);
    beam([6, 3.8, 29.3], [6.8, 29, 30]);
    [[6, 3], [16, 3], [26, 3], [35.2, 3], [6, 15.6], [6, 28.2]].forEach(([x, y]) => steel(x, y));
    // material stack on the deck
    box(gB, [10, 18, z0], [17, 20.5, z0 + 0.5], { R: '#9aa3a8', L: '#b9c0c4', T: '#dfe3e5' });
    box(gB, [10.5, 18.4, z0 + 0.5], [16.5, 20, z0 + 1], { R: '#9aa3a8', L: '#b9c0c4', T: '#eceeef' });
    // workers
    personShape(gB, ...P(14, 9, z0), { helmet: true });
    const [wx, wy] = P(22, 22, z0);
    personShape(gB, wx, wy, { helmet: true });
    const arm = E('line', { x1: wx + 2, y1: wy - 11, x2: wx + 7, y2: wy - 17, stroke: '#1c1c1c', 'stroke-width': 1.6, 'stroke-linecap': 'round', class: 'wave' }, gB);
    arm.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-35deg)' }], { duration: 600, iterations: Infinity, direction: 'alternate' });
    arm.style.transformOrigin = `${wx + 2}px ${wy - 11}px`;
    const [px, py] = P(30, 14, z0);
    personShape(gB, px, py, { helmet: true, hat: '#f2b134' });
    E('rect', { x: px - 9, y: py - 13, width: 6, height: 8, fill: '#8fc3dd', stroke: LINE, 'stroke-width': 0.6, transform: `rotate(-14 ${px - 6} ${py - 9})` }, gB);
    [[16, 15.6], [26, 15.6], [35.2, 15.6], [16, 28.2], [26, 28.2], [35.2, 28.2]].forEach(([x, y]) => steel(x, y));
    beam([6, 28.2, 29.3], [36, 29, 30]);
    beam([35.2, 3.8, 29.3], [36, 28.2, 30]);
    // safety net hint on the +y face
    for (let x = 7; x < 35; x += 1.2) line(gB, [x, 29, z0], [x, 29, 29.3], { stroke: '#5f9e8f', 'stroke-width': 0.35, 'stroke-opacity': 0.6 });
  })();

  /* ==========================================================
     HOVER CUBE
     ========================================================== */
  const CS = 6.8;
  const gCube = E('g', { class: 'cube', opacity: 0 }, gObj);
  box(gCube, [0, 0, 0], [CS, CS, CS], { T: '#f8dfeb', L: '#eaa6c7', R: '#c9558c', sw: 1.2 });
  const cubeLabel = faceText(gCube, '', 0.6, CS, 3.4, 'L', { 'font-size': 10.5, 'font-weight': 900, fill: '#2b2b2b', 'letter-spacing': 0.6 });
  faceText(gCube, 'ENTER →', 0.6, CS, 1.5, 'L', { 'font-size': 7.5, 'font-weight': 600, fill: '#2b2b2b', 'letter-spacing': 1.2 });
  const cubeObj = addObj(gCube, [0, 0, 0, CS, CS, CS], 5);
  cubeObj.hidden = true;

  /* ==========================================================
     TOWER CRANE
     ========================================================== */
  const MX = -6, MY = 18, MZ = 40;
  (() => {
    const g = E('g', {}, gObj);
    box(g, [MX - 2, MY - 2, 0], [MX + 2, MY + 2, 1.2], { R: '#b5b5b0', L: '#d0d0cc', T: '#e2e2de' });
    const q = [MX - 1, MY - 1, 1.2, MX + 1, MY + 1, MZ];
    poly(g, faceR(...q), 'url(#lat)', { 'stroke-width': 1.3 });
    poly(g, faceL(...q), 'url(#lat)', { 'stroke-width': 1.3 });
    box(g, [MX + 1, MY - 1, MZ - 3.2], [MX + 3.2, MY + 1.3, MZ - 0.4], { R: '#e5a52a', L: '#f2c14e', T: '#f7d27a' });
    poly(g, faceL(MX + 1.6, 0, MZ - 2.4, MX + 3, MY + 1.3, MZ - 1), '#fff6dc', { 'stroke-width': 0.6 });
    addObj(g, [MX - 2, MY - 2, 0, MX + 3.2, MY + 2, MZ]);
  })();

  const jib = E('path', { fill: 'none', stroke: LINE, 'stroke-width': 1.1, 'stroke-linejoin': 'round' }, gTop);
  const pend = E('path', { fill: 'none', stroke: LINE, 'stroke-width': 0.8 }, gTop);
  const cwt = box(gTop, [0, 0, 0], [1, 1, 1], { R: '#8f8a82', L: '#aaa59d', T: '#c4bfb7' });
  const cable = E('line', { stroke: LINE, 'stroke-width': 1 }, gTop);
  const trolley = E('rect', { width: 7, height: 3.5, fill: LINE }, gTop);
  const slings = E('path', { fill: 'none', stroke: LINE, 'stroke-width': 0.7 }, gTop);
  const beamTop = box(gTop, [0, 0, 0], [1, 1, 1], { R: '#9aa3a8', L: '#ffffff', T: '#ffffff', sw: 0.9 });
  const hook = E('circle', { r: 2.4, fill: LINE }, gTop);

  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const clamp01 = (t) => Math.max(0, Math.min(1, t));

  function updateCrane(t) {
    const T = 22, u = t % T;
    const thA = -0.62, thB = -0.07;     // slewing angles (rad)
    const rA = 14, rB = 27.5;           // trolley radius
    const zHi = 37, zLo = 31.4;         // load height
    let th, r, zl;
    if (u < 7)       { const e = ease(u / 7);          th = thA + (thB - thA) * e; r = rA + (rB - rA) * e; zl = zHi; }
    else if (u < 10) { th = thB; r = rB; zl = zHi + (zLo - zHi) * ease((u - 7) / 3); }
    else if (u < 12) { th = thB; r = rB; zl = zLo; }
    else if (u < 15) { th = thB; r = rB; zl = zLo + (zHi - zLo) * ease((u - 12) / 3); }
    else             { const e = ease((u - 15) / 7);   th = thB + (thA - thB) * e; r = rB + (rA - rB) * e; zl = zHi; }

    const dx = Math.cos(th), dy = Math.sin(th), nx = -dy * 0.9, ny = dx * 0.9;
    const at = (rr, z, o = 0) => P(MX + dx * rr + nx * o, MY + dy * rr + ny * o, z);
    const f = (p) => p[0].toFixed(1) + ',' + p[1].toFixed(1);
    const r0 = -13, r1 = 44, zt = MZ + 2.6;
    let d = `M${f(at(r0, MZ, -1))}L${f(at(r1, MZ, -1))}M${f(at(r0, MZ, 1))}L${f(at(r1, MZ, 1))}M${f(at(r0, zt))}L${f(at(r1, zt))}`;
    d += `M${f(at(r0, MZ, -1))}L${f(at(r0, MZ, 1))}L${f(at(r0, zt))}Z M${f(at(r1, MZ, -1))}L${f(at(r1, MZ, 1))}L${f(at(r1, zt))}Z`;
    let up = true;
    for (let rr = r0; rr <= r1; rr += 2.4) {
      d += `${rr === r0 ? 'M' : 'L'}${f(at(rr, up ? zt : MZ, up ? 0 : (Math.round(rr) % 2 ? 1 : -1)))}`;
      up = !up;
    }
    jib.setAttribute('d', d);

    const top = P(MX, MY, MZ + 9);
    pend.setAttribute('d', `M${f(P(MX, MY, MZ))}L${f(top)}L${f(at(r1 - 6, zt))}M${f(top)}L${f(at(r0 + 1, zt))}M${f(P(MX - 0.6, MY - 0.6, MZ))}L${f(top)}`);

    const cx = MX - dx * 10.5, cy = MY - dy * 10.5;
    setBox(cwt, [cx - 1.6, cy - 1.6, MZ - 3.2], [cx + 1.6, cy + 1.6, MZ]);

    const lx = MX + dx * r, ly = MY + dy * r;
    const tp = P(lx, ly, MZ);
    trolley.setAttribute('x', tp[0] - 3.5); trolley.setAttribute('y', tp[1] - 1);
    const hp = P(lx, ly, zl + 3.6);
    cable.setAttribute('x1', tp[0]); cable.setAttribute('y1', tp[1]);
    cable.setAttribute('x2', hp[0]); cable.setAttribute('y2', hp[1]);
    hook.setAttribute('cx', hp[0]); hook.setAttribute('cy', hp[1]);
    const bx0 = lx - 6, bx1 = lx + 6, by0 = ly - 0.45, by1 = ly + 0.45;
    setBox(beamTop, [bx0, by0, zl], [bx1, by1, zl + 0.9]);
    slings.setAttribute('d', [[bx0 + 0.5, by0], [bx1 - 0.5, by0], [bx0 + 0.5, by1], [bx1 - 0.5, by1]]
      .map(([x, y]) => `M${f(hp)}L${f(P(x, y, zl + 0.9))}`).join(''));
  }

  /* ==========================================================
     TRAFFIC
     ========================================================== */
  const PAL = {
    teal:    { T: '#a9dccb', L: '#7cc3ae', R: '#5aa58f' },
    magenta: { T: '#eb94bf', L: '#c64f8a', R: '#a23a6f' },
    white:   { T: '#ffffff', L: '#f0f0ee', R: '#d4d4d1' },
    red:     { T: '#ef8a83', L: '#d4473d', R: '#b03a31' },
    grey:    { T: '#dfe3e6', L: '#bcc3c8', R: '#9ba3a9' },
  };
  const GLASS = { T: '#e7eff2', L: '#cfdfe5', R: '#b3c7cf' };

  function makeVehicle(kind, color, axis, dir) {
    const g = E('g', {}, gObj);
    const half = kind === 'truck' ? 3.2 : 2.2, w = 0.95;
    const A = (a0, b0, z0, a1, b1, z1) => (axis === 'x' ? [[a0, b0, z0], [a1, b1, z1]] : [[b0, a0, z0], [b1, a1, z1]]);
    const sh = axis === 'x' ? [[-half, -w], [half, -w], [half + 0.8, w + 0.4], [-half + 0.8, w + 0.4]] : [[-w, -half], [w + 0.4, -half + 0.8], [w + 0.4, half + 0.8], [-w, half]];
    poly(g, sh, '#000', { stroke: 'none', 'fill-opacity': 0.12 });
    const pal = PAL[color];
    if (kind === 'truck') {
      const f = dir; // front side sign
      const [c0, c1] = f > 0 ? [half - 1.6, half] : [-half, -half + 1.6];
      const [b0, b1] = f > 0 ? [-half, half - 1.8] : [-half + 1.8, half];
      box(g, ...A(c0, -w, 0.35, c1, w, 2.1), pal);
      box(g, ...A(b0, -w, 0.35, b1, w, 1.3), PAL.grey);
      box(g, ...A(b0, -w, 1.3, b1, w, 1.75), { T: '#c9b89a', L: '#b5a283', R: '#9c8a6b' });
    } else {
      box(g, ...A(-half, -w, 0.35, half, w, 1.2), pal);
      box(g, ...A(-1.1, -w + 0.1, 1.2, 1.0, w - 0.1, 1.95), GLASS);
      box(g, ...A(-1.0, -w + 0.15, 1.95, 0.9, w - 0.15, 2.0), pal, { sw: 0.5 });
    }
    return { g, half, w };
  }

  // phases: A green 0–9, A yellow 9–11, all red 11–12, B green 12–21, B yellow 21–23, all red 23–24
  const lightState = (t, road) => {
    const u = t % 24;
    if (road === 'A') return u < 9 ? 'g' : u < 11 ? 'y' : 'r';
    return u >= 12 && u < 21 ? 'g' : u >= 21 && u < 23 ? 'y' : 'r';
  };

  const lanes = [
    { axis: 'x', dir: 1,  fixed: 55, road: 'A', stop: 40.6 },
    { axis: 'x', dir: -1, fixed: 49, road: 'A', stop: -63.4 },
    { axis: 'y', dir: 1,  fixed: 49, road: 'B', stop: 40.6 },
    { axis: 'y', dir: -1, fixed: 55, road: 'B', stop: -63.4 },
  ];
  const SMIN = -190, SMAX = 190;
  const fleet = [
    ['car', 'teal'], ['truck', 'white'], ['car', 'magenta'], ['car', 'white'], ['car', 'red'],
    ['car', 'grey'], ['car', 'teal'], ['truck', 'white'], ['car', 'magenta'], ['car', 'white'],
    ['car', 'red'], ['car', 'teal'], ['car', 'white'], ['truck', 'white'], ['car', 'magenta'], ['car', 'grey'],
  ];
  lanes.forEach((lane, li) => {
    lane.cars = [];
    for (let i = 0; i < 4; i++) {
      const [kind, color] = fleet[(li * 4 + i) % fleet.length];
      const v = makeVehicle(kind, color, lane.axis, lane.dir);
      const car = Object.assign(v, { s: SMAX - 20 - i * (95 + li * 7), vmax: 10 + ((i + li) % 3) * 1.6 });
      car.obj = addObj(v.g, [0, 0, 0, 0, 0, 0]);
      lane.cars.push(car);
    }
  });

  function updateTraffic(t, dt) {
    signals.forEach((s) => {
      const st = lightState(t, s.road);
      s.lamp.setAttribute('fill', st === 'g' ? '#3ec46d' : st === 'y' ? '#ffb020' : '#e5483c');
    });
    lanes.forEach((lane) => {
      const go = lightState(t, lane.road) === 'g';
      const cars = lane.cars;
      for (let i = 0; i < cars.length; i++) {
        const c = cars[i];
        let lim = Infinity;
        if (i > 0) lim = cars[i - 1].s - (cars[i - 1].half + c.half + 2);
        if (!go && c.s <= lane.stop + 0.05) lim = Math.min(lim, lane.stop);
        const speed = Math.min(c.vmax, Math.max(0, (lim - c.s) * 1.4));
        c.s += speed * dt;
      }
      // wrap the leading car to the back of the queue
      if (cars[0].s > SMAX) {
        const c = cars.shift();
        c.s = Math.min(SMIN, cars[cars.length - 1].s - 30);
        cars.push(c);
      }
      cars.forEach((c) => {
        const along = lane.dir * c.s;
        const x = lane.axis === 'x' ? along : lane.fixed;
        const y = lane.axis === 'x' ? lane.fixed : along;
        const [tx, ty] = D(x, y);
        c.g.setAttribute('transform', `translate(${tx.toFixed(1)},${ty.toFixed(1)})`);
        const hx = lane.axis === 'x' ? c.half : c.w, hy = lane.axis === 'x' ? c.w : c.half;
        c.obj.b = [x - hx, y - hy, 0, x + hx, y + hy, 2.1];
      });
    });
  }

  /* ---------- pedestrians ---------- */
  const walkers = [];
  [
    ['x', 43, 1.2, -60], ['x', 43, -1.0, 10], ['x', 60.6, 1.3, -30], ['x', 60.6, -1.1, 30],
    ['y', 43, 1.1, -50], ['y', 60.6, -1.2, 0], ['y', 60.6, 1.0, -70], ['x', 43, 1.4, -110],
  ].forEach(([axis, fixed, v, s]) => {
    const g = E('g', {}, gObj);
    const [sx, sy] = P(0, 0, 0);
    const legs = personShape(g, sx, sy, { body: Math.random() > 0.7 ? '#b8487f' : '#1c1c1c' });
    walkers.push({ g, axis, fixed, v, s, legs, obj: addObj(g, [0, 0, 0, 0, 0, 0]) });
  });
  function updateWalkers(t, dt) {
    walkers.forEach((w, i) => {
      w.s += w.v * dt;
      if (w.s > 120) w.s = -130; if (w.s < -130) w.s = 120;
      const x = w.axis === 'x' ? w.s : w.fixed, y = w.axis === 'x' ? w.fixed : w.s;
      const [tx, ty] = D(x, y);
      const bob = Math.abs(Math.sin(t * 6 + i)) * -0.8;
      w.g.setAttribute('transform', `translate(${tx.toFixed(1)},${(ty + bob).toFixed(1)})`);
      w.obj.b = [x - 0.3, y - 0.3, 0, x + 0.3, y + 0.3, 1.8];
    });
  }

  /* ==========================================================
     DEPTH SORTING (painter's algorithm for iso boxes)
     ========================================================== */
  function screenBox(b) {
    return [(b[0] - b[4]) * C * K, (b[3] - b[1]) * C * K, (b[0] + b[1]) * S * K - b[5] * K, (b[3] + b[4]) * S * K - b[2] * K];
  }
  function behind(a, b) {
    const A = a.b, B = b.b;
    if (A[3] <= B[0]) return true;  if (B[3] <= A[0]) return false;
    if (A[4] <= B[1]) return true;  if (B[4] <= A[1]) return false;
    if (A[5] <= B[2]) return true;  if (B[5] <= A[2]) return false;
    return a.layer < b.layer;
  }
  let lastOrder = [];
  function sortScene() {
    const list = objs.filter((o) => !o.hidden);
    const n = list.length;
    const sb = list.map((o) => screenBox(o.b));
    const state = new Uint8Array(n);
    const out = [];
    const visit = (i) => {
      if (state[i]) return;
      state[i] = 1;
      const si = sb[i];
      for (let j = 0; j < n; j++) {
        if (j === i || state[j]) continue;
        const sj = sb[j];
        if (sj[0] >= si[1] || si[0] >= sj[1] || sj[2] >= si[3] || si[2] >= sj[3]) continue;
        if (behind(list[j], list[i])) visit(j);
      }
      out.push(list[i]);
    };
    for (let i = 0; i < n; i++) visit(i);
    let changed = out.length !== lastOrder.length;
    if (!changed) for (let i = 0; i < out.length; i++) if (out[i] !== lastOrder[i]) { changed = true; break; }
    if (changed) { out.forEach((o) => gObj.appendChild(o.g)); lastOrder = out; }
  }

  /* ==========================================================
     INTERACTION
     ========================================================== */
  const caption = document.getElementById('caption');
  const capNum = document.getElementById('capNum');
  const capTitle = document.getElementById('capTitle');
  const capText = document.getElementById('capText');
  const capGo = document.getElementById('capGo');
  const listItems = [...document.querySelectorAll('.floor-index li')];
  const byId = Object.fromEntries(FLOORS.map((f) => [f.id, f]));

  let active = null, hideTimer = null, prog = 0;
  caption.classList.add('idle');
  const noHover = matchMedia('(hover: none)');

  /* Phones: frame the scene around the building (portrait), and keep the caption above the bottom sheet. */
  const intro = document.querySelector('.intro');
  function fitView() {
    if (innerWidth <= 760) {
      const w = 560, h = Math.max(w * innerHeight / innerWidth, 900);
      svg.setAttribute('viewBox', `${940 - w / 2} -40 ${w} ${h.toFixed(0)}`);
      svg.setAttribute('preserveAspectRatio', 'xMidYMin slice');
      document.documentElement.style.setProperty('--sheet-h', intro.offsetHeight + 22 + 'px');
    } else {
      svg.setAttribute('viewBox', '0 0 1600 900');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    }
  }
  fitView();
  addEventListener('resize', fitView);
  addEventListener('load', fitView);
  if (document.fonts) document.fonts.ready.then(fitView);

  function setActive(f) {
    clearTimeout(hideTimer);
    if (active === f) return;
    if (active) active.hl.forEach((h) => h.setAttribute('opacity', 0));
    active = f;
    prog = 0;
    listItems.forEach((li) => li.classList.toggle('on', !!f && li.dataset.floor === f.id));
    if (f) {
      f.hl.forEach((h) => h.setAttribute('opacity', 0.38));
      cubeLabel.textContent = f.name;
      capNum.textContent = f.num;
      capTitle.textContent = f.title;
      capText.textContent = f.text;
      capGo.textContent = noHover.matches ? 'TAP THE CUBE →' : 'CLICK THE CUBE →';
      caption.classList.remove('idle');
    } else {
      capNum.textContent = '—';
      capTitle.textContent = 'Select a floor';
      capText.textContent = '建物の各フロアがページになっています。';
      capGo.textContent = '';
      caption.classList.add('idle');
    }
  }
  const scheduleHide = () => { clearTimeout(hideTimer); hideTimer = setTimeout(() => setActive(null), 380); };

  function go(href) {
    document.getElementById('wipe').classList.add('on');
    setTimeout(() => { location.href = href; }, 460);
  }

  // Touch screens have no hover: first tap on a floor pops its cube, a second tap (or tapping the cube) enters.
  let lastPointer = 'mouse', downActive = null;
  window.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; downActive = active; }, true);
  const isTouch = () => lastPointer !== 'mouse';

  FLOORS.forEach((f) => {
    f.g.addEventListener('mouseenter', () => setActive(f));
    f.g.addEventListener('mouseleave', scheduleHide);
    f.g.addEventListener('click', () => {
      if (isTouch() && downActive !== f) { setActive(f); return; }
      go(f.href);
    });
  });
  svg.addEventListener('click', (e) => {
    if (isTouch() && !e.target.closest('.floor, .cube')) setActive(null);
  });
  gCube.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  gCube.addEventListener('mouseleave', scheduleHide);
  gCube.addEventListener('click', () => active && go(active.href));
  listItems.forEach((li) => {
    li.addEventListener('mouseenter', () => setActive(byId[li.dataset.floor]));
    li.addEventListener('mouseleave', scheduleHide);
    li.addEventListener('click', () => go(byId[li.dataset.floor].href));
  });

  function updateCube(dt) {
    const target = active ? 1 : 0;
    prog += (target - prog) * Math.min(1, dt * 7);
    if (Math.abs(target - prog) < 0.002) prog = target;
    if (!active && prog < 0.01) {
      cubeObj.hidden = true;
      gCube.setAttribute('opacity', 0);
      gCube.style.pointerEvents = 'none';
      if (gCube.parentNode !== gObj) gObj.appendChild(gCube);
      return;
    }
    const f = active || cubeObj.last;
    if (!f) return;
    cubeObj.last = f;
    cubeObj.hidden = false;
    gCube.style.pointerEvents = active ? 'auto' : 'none';
    const x1 = Math.max(...FLOORS.filter((g) => g.a[2] >= f.a[2]).map((g) => g.b[0])), yc = (f.a[1] + f.b[1]) / 2;
    const x = x1 - CS + (CS + 2.6) * prog;
    const y = yc - CS / 2, z = f.a[2] - 0.4;
    const [tx, ty] = D(x, y, z);
    gCube.setAttribute('transform', `translate(${tx.toFixed(1)},${ty.toFixed(1)})`);
    gCube.setAttribute('opacity', Math.min(1, prog * 2.5).toFixed(2));
    cubeObj.b = [x, y, z, x + CS, y + CS, z + CS];
  }

  /* ==========================================================
     LOOP
     ========================================================== */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    updateCrane(t);
    updateTraffic(t, dt);
    updateWalkers(t, dt);
    updateCube(dt);
    sortScene();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // reset wipe when returning via back button (bfcache)
  window.addEventListener('pageshow', () => document.getElementById('wipe').classList.remove('on'));
})();
