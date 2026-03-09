import { AnatomyModel } from '@/types/radiation';

export const anatomyPresets: Record<string, AnatomyModel> = {
  generic: {
    name: 'Fantoccio Generico',
    description: 'Tumore centrale in tessuto omogeneo',
    bodyOutline: generateEllipsePoints(15, 15, 14, 14, 48),
    organs: [
      {
        x: 15, y: 15, radiusX: 3, radiusY: 3,
        shape: 'irregular', isTumor: true, name: 'Tumore',
        color: 'rgba(220, 50, 50, 0.5)',
      },
    ],
    healthyTissue: { width: 30, height: 30 },
  },

  breast: {
    name: 'Mammella',
    description: 'Tumore mammario con tessuto ghiandolare',
    bodyOutline: generateBreastBodyOutline(),
    organs: [
      {
        x: 11, y: 15, radiusX: 7, radiusY: 5.5,
        shape: 'polygon', isTumor: false, name: 'Tessuto mammario',
        color: 'rgba(255, 200, 170, 0.35)',
        points: generateBreastShape(),
      },
      {
        x: 10, y: 14, radiusX: 2, radiusY: 2.5,
        shape: 'irregular', isTumor: true, name: 'Carcinoma mammario',
        color: 'rgba(220, 50, 50, 0.5)',
      },
      {
        x: 8, y: 10, radiusX: 0.8, radiusY: 1,
        shape: 'ellipse', isTumor: false, name: 'Linfonodo ascellare',
        color: 'rgba(180, 220, 140, 0.4)',
      },
      {
        x: 20, y: 15, radiusX: 1.5, radiusY: 7,
        shape: 'polygon', isTumor: false, name: 'Parete toracica',
        color: 'rgba(230, 220, 200, 0.5)',
        points: generateRibShape(),
      },
      {
        x: 23, y: 15, radiusX: 4, radiusY: 6,
        shape: 'ellipse', isTumor: false, name: 'Polmone',
        color: 'rgba(180, 200, 230, 0.3)',
      },
    ],
    healthyTissue: { width: 30, height: 30 },
  },

  bladder: {
    name: 'Vescica',
    description: 'Carcinoma vescicale con organi pelvici',
    bodyOutline: generatePelvisBodyOutline(),
    organs: [
      {
        x: 15, y: 17, radiusX: 4.5, radiusY: 3.5,
        shape: 'polygon', isTumor: false, name: 'Vescica',
        color: 'rgba(255, 230, 150, 0.35)',
        points: generateBladderShape(),
      },
      {
        x: 14, y: 18.5, radiusX: 1.8, radiusY: 1.5,
        shape: 'irregular', isTumor: true, name: 'Carcinoma vescicale',
        color: 'rgba(220, 50, 50, 0.5)',
      },
      {
        x: 15, y: 23, radiusX: 1.8, radiusY: 2.5,
        shape: 'polygon', isTumor: false, name: 'Retto',
        color: 'rgba(200, 150, 130, 0.4)',
        points: generateRectumShape(),
      },
      {
        x: 7, y: 18, radiusX: 2.5, radiusY: 5,
        shape: 'polygon', isTumor: false, name: 'Osso pelvico sx',
        color: 'rgba(240, 230, 210, 0.6)',
        points: generatePelvicBoneShape(true),
      },
      {
        x: 23, y: 18, radiusX: 2.5, radiusY: 5,
        shape: 'polygon', isTumor: false, name: 'Osso pelvico dx',
        color: 'rgba(240, 230, 210, 0.6)',
        points: generatePelvicBoneShape(false),
      },
      {
        x: 15, y: 11, radiusX: 4, radiusY: 2.5,
        shape: 'polygon', isTumor: false, name: 'Anse intestinali',
        color: 'rgba(220, 180, 170, 0.3)',
        points: generateIntestineShape(),
      },
    ],
    healthyTissue: { width: 30, height: 30 },
  },

  head: {
    name: 'Testa e Collo',
    description: 'Tumore cerebrale con strutture critiche',
    bodyOutline: generateSkullOutline(),
    organs: [
      {
        x: 15, y: 14, radiusX: 7, radiusY: 8,
        shape: 'polygon', isTumor: false, name: 'Encefalo',
        color: 'rgba(240, 210, 200, 0.3)',
        points: generateBrainShape(),
      },
      {
        x: 12, y: 12, radiusX: 2.5, radiusY: 2,
        shape: 'irregular', isTumor: true, name: 'Glioblastoma',
        color: 'rgba(220, 50, 50, 0.5)',
      },
      {
        x: 15, y: 21, radiusX: 1.5, radiusY: 2.5,
        shape: 'polygon', isTumor: false, name: 'Tronco encefalico',
        color: 'rgba(200, 180, 200, 0.45)',
        points: generateBrainstemShape(),
      },
      {
        x: 11, y: 9, radiusX: 1.3, radiusY: 1.3,
        shape: 'circle', isTumor: false, name: 'Occhio sx',
        color: 'rgba(200, 220, 240, 0.4)',
      },
      {
        x: 19, y: 9, radiusX: 1.3, radiusY: 1.3,
        shape: 'circle', isTumor: false, name: 'Occhio dx',
        color: 'rgba(200, 220, 240, 0.4)',
      },
      {
        x: 12.5, y: 11, radiusX: 0.4, radiusY: 1.5,
        shape: 'ellipse', rotation: 50, isTumor: false, name: 'Nervo ottico sx',
        color: 'rgba(255, 230, 150, 0.5)',
      },
      {
        x: 17.5, y: 11, radiusX: 0.4, radiusY: 1.5,
        shape: 'ellipse', rotation: -50, isTumor: false, name: 'Nervo ottico dx',
        color: 'rgba(255, 230, 150, 0.5)',
      },
      {
        x: 15, y: 7, radiusX: 8, radiusY: 9,
        shape: 'polygon', isTumor: false, name: 'Cranio',
        color: 'rgba(240, 230, 210, 0.5)',
        points: generateSkullBoneRing(),
      },
    ],
    healthyTissue: { width: 30, height: 30 },
  },
};

// Shape generators

function generateEllipsePoints(cx: number, cy: number, rx: number, ry: number, n: number) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
  }
  return pts;
}

function generateBreastBodyOutline() {
  // Torso cross-section from the side
  const pts = [];
  // Right side (chest wall)
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    pts.push({ x: 26, y: 3 + t * 24 });
  }
  // Bottom
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pts.push({ x: 26 - t * 24, y: 27 });
  }
  // Left side (breast profile)
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const y = 27 - t * 24;
    const bulge = Math.sin(t * Math.PI) * 6;
    pts.push({ x: 2 + (t < 0.3 || t > 0.7 ? 2 : -bulge + 4), y });
  }
  return pts;
}

function generateBreastShape() {
  const pts = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const r = 1 + 0.15 * Math.sin(a * 3) + 0.1 * Math.cos(a * 2);
    pts.push({ x: Math.cos(a) * r * 7, y: Math.sin(a) * r * 5.5 });
  }
  return pts;
}

function generateRibShape() {
  const pts = [];
  // Vertical rib-like strip with slight curvature
  for (let i = 0; i <= 20; i++) {
    const t = (i / 20) * 2 - 1;
    pts.push({ x: -1.2 + Math.sin(t * Math.PI * 0.3) * 0.3, y: t * 7 });
  }
  for (let i = 20; i >= 0; i--) {
    const t = (i / 20) * 2 - 1;
    pts.push({ x: 1.2 + Math.sin(t * Math.PI * 0.3) * 0.3, y: t * 7 });
  }
  return pts;
}

function generatePelvisBodyOutline() {
  const pts = [];
  const n = 48;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rx = 13 + Math.cos(a * 2) * 1.5;
    const ry = 13;
    pts.push({ x: 15 + Math.cos(a) * rx, y: 15 + Math.sin(a) * ry });
  }
  return pts;
}

function generateBladderShape() {
  const pts = [];
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const r = 1 + 0.08 * Math.sin(a * 4) + (a > Math.PI ? 0.15 : -0.05);
    pts.push({ x: Math.cos(a) * r * 4.5, y: Math.sin(a) * r * 3.5 });
  }
  return pts;
}

function generateRectumShape() {
  const pts = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r = 1 + 0.12 * Math.sin(a * 3);
    pts.push({ x: Math.cos(a) * r * 1.8, y: Math.sin(a) * r * 2.5 });
  }
  return pts;
}

function generatePelvicBoneShape(isLeft: boolean) {
  const pts = [];
  const mirror = isLeft ? 1 : -1;
  // Wing-like iliac bone shape
  for (let i = 0; i < 24; i++) {
    const t = i / 24;
    const a = t * Math.PI * 2;
    let rx = 2.5 + Math.sin(a) * 0.8;
    let ry = 5 + Math.cos(a * 2) * 1;
    pts.push({ x: Math.cos(a) * rx * mirror, y: Math.sin(a) * ry });
  }
  return pts;
}

function generateIntestineShape() {
  const pts = [];
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const r = 1 + 0.2 * Math.sin(a * 6) + 0.1 * Math.cos(a * 3);
    pts.push({ x: Math.cos(a) * r * 4, y: Math.sin(a) * r * 2.5 });
  }
  return pts;
}

function generateSkullOutline() {
  const pts = [];
  const n = 48;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    // Skull is wider at top, narrower at jaw
    let rx = 9;
    let ry = 10;
    if (a > Math.PI * 0.6 && a < Math.PI * 1.4) {
      // Jaw area - narrower
      const jawT = (a - Math.PI * 0.6) / (Math.PI * 0.8);
      rx -= Math.sin(jawT * Math.PI) * 3;
    }
    pts.push({ x: 15 + Math.cos(a) * rx, y: 14 + Math.sin(a) * ry });
  }
  return pts;
}

function generateBrainShape() {
  const pts = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    // Brain has folds/sulci
    const fold = 0.06 * Math.sin(a * 8) + 0.04 * Math.cos(a * 12);
    const r = 1 + fold;
    pts.push({ x: Math.cos(a) * r * 7, y: Math.sin(a) * r * 7.5 });
  }
  return pts;
}

function generateBrainstemShape() {
  const pts = [];
  // Tapered cylinder shape
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const taper = 1 + (Math.sin(a) > 0 ? 0.2 : -0.1);
    pts.push({ x: Math.cos(a) * 1.5 * taper, y: Math.sin(a) * 2.5 });
  }
  return pts;
}

function generateSkullBoneRing() {
  // Ring shape: outer skull minus inner (approximated as thick outline)
  const pts = [];
  const n = 40;
  // Outer
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    let rx = 8;
    let ry = 9;
    if (a > Math.PI * 0.6 && a < Math.PI * 1.4) {
      const jawT = (a - Math.PI * 0.6) / (Math.PI * 0.8);
      rx -= Math.sin(jawT * Math.PI) * 2.5;
    }
    pts.push({ x: Math.cos(a) * rx, y: Math.sin(a) * ry });
  }
  return pts;
}

export const getAnatomyPresetNames = () => Object.keys(anatomyPresets);
