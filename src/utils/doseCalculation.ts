import { BeamConfig, AnatomyModel, DosePoint, Organ } from '@/types/radiation';

function isPointInOrgan(x: number, y: number, organ: Organ): boolean {
  const dx = x - organ.x;
  const dy = y - organ.y;

  // Handle rotation
  let lx = dx, ly = dy;
  if (organ.rotation) {
    const angle = (organ.rotation * Math.PI) / 180;
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    lx = dx * cos - dy * sin;
    ly = dx * sin + dy * cos;
  }

  if (organ.shape === 'polygon' && organ.points && organ.points.length > 2) {
    return isPointInPolygon(lx, ly, organ.points);
  }

  if (organ.shape === 'irregular') {
    const dist = Math.sqrt((lx / organ.radiusX) ** 2 + (ly / organ.radiusY) ** 2);
    const irregularity = 0.15 * Math.sin(Math.atan2(ly, lx) * 5) + 0.08 * Math.cos(Math.atan2(ly, lx) * 7);
    return dist <= 1 + irregularity;
  }

  return (lx / organ.radiusX) ** 2 + (ly / organ.radiusY) ** 2 <= 1;
}

function isPointInPolygon(px: number, py: number, points: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x, yi = points[i].y;
    const xj = points[j].x, yj = points[j].y;
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function calculateDoseDistribution(
  beams: BeamConfig[],
  anatomy: AnatomyModel,
  gridSize: number = 100,
  patientOffset: { x: number; y: number } = { x: 0, y: 0 }
): DosePoint[] {
  const { organs = [], healthyTissue } = anatomy;
  if (!Array.isArray(organs)) return [];
  const ox = patientOffset.x;
  const oy = patientOffset.y;

  const stepX = healthyTissue.width / gridSize;
  const stepY = healthyTissue.height / gridSize;

  const doseGrid: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
  const isTumorGrid: boolean[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(false));

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = i * stepX;
      const y = j * stepY;
      for (const organ of organs) {
        if (organ.isTumor && isPointInOrgan(x - ox, y - oy, organ)) {
          isTumorGrid[i][j] = true;
          break;
        }
      }
    }
  }

  beams.filter(beam => beam.enabled).forEach(beam => {
    const angleRad = (beam.angle * Math.PI) / 180;
    const beamDirX = Math.cos(angleRad);
    const beamDirY = Math.sin(angleRad);
    const centerX = healthyTissue.width / 2;
    const centerY = healthyTissue.height / 2;
    const maxDist = Math.max(healthyTissue.width, healthyTissue.height);
    const beamOriginX = centerX - beamDirX * maxDist;
    const beamOriginY = centerY - beamDirY * maxDist;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = i * stepX;
        const y = j * stepY;
        const pointDx = x - beamOriginX;
        const pointDy = y - beamOriginY;
        const distanceAlongBeam = pointDx * beamDirX + pointDy * beamDirY;
        const perpDist = Math.abs(pointDx * beamDirY - pointDy * beamDirX);

        if (perpDist <= beam.width / 2 && distanceAlongBeam >= 0) {
          let dose = 0;

          if (beam.type === 'photon') {
            const attenuationCoeff = 0.03 / (beam.energy / 6);
            dose = beam.intensity * Math.exp(-attenuationCoeff * distanceAlongBeam);
          } else {
            const range = beam.energy * 0.3;
            const sigma = range * 0.1;
            const distanceFromPeak = distanceAlongBeam - range;
            dose = beam.intensity * Math.exp(-(distanceFromPeak ** 2) / (2 * sigma ** 2));
            if (distanceAlongBeam < range) {
              dose += beam.intensity * 0.3 * (1 - distanceAlongBeam / range);
            }
          }

          let widthFalloff = Math.exp(-(perpDist ** 2) / (beam.width ** 2));

          if (beam.collimatorLeaves.length > 0) {
            let blockingFactor = 1.0;
            beam.collimatorLeaves.forEach(leaf => {
              const distanceFromLeaf = Math.abs(perpDist - leaf.position);
              const effectiveWidth = leaf.width || 0.5;
              if (distanceFromLeaf < effectiveWidth) {
                const edgeFalloff = leaf.falloff || 0.1;
                const transitionWidth = effectiveWidth * edgeFalloff;
                if (distanceFromLeaf < effectiveWidth - transitionWidth) {
                  blockingFactor *= (1 - leaf.depth);
                } else {
                  const edgeT = (distanceFromLeaf - (effectiveWidth - transitionWidth)) / transitionWidth;
                  const smoothEdge = 0.5 - 0.5 * Math.cos(edgeT * Math.PI);
                  blockingFactor *= (1 - leaf.depth * (1 - smoothEdge));
                }
              }
            });
            widthFalloff *= blockingFactor;
          }

          dose *= widthFalloff;
          doseGrid[i][j] += dose;
        }
      }
    }
  });

  const points: DosePoint[] = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      points.push({ x: i * stepX, y: j * stepY, dose: doseGrid[i][j], isTumor: isTumorGrid[i][j] });
    }
  }
  return points;
}

export function calculateStatistics(dosePoints: DosePoint[]) {
  const tumorPoints = dosePoints.filter(p => p.isTumor);
  const healthyPoints = dosePoints.filter(p => !p.isTumor);

  if (tumorPoints.length === 0) {
    return { tumorCoverage: 0, tumorMeanDose: 0, healthyTissueMeanDose: 0, maxHealthyTissueDose: 0 };
  }

  const tumorMeanDose = tumorPoints.reduce((sum, p) => sum + p.dose, 0) / tumorPoints.length;
  const prescriptionDose = 50;
  const adequatelyDosedTumor = tumorPoints.filter(p => p.dose >= prescriptionDose * 0.95).length;
  const tumorCoverage = (adequatelyDosedTumor / tumorPoints.length) * 100;

  const healthyTissueMeanDose = healthyPoints.length > 0
    ? healthyPoints.reduce((sum, p) => sum + p.dose, 0) / healthyPoints.length : 0;
  const maxHealthyTissueDose = healthyPoints.length > 0
    ? Math.max(...healthyPoints.map(p => p.dose)) : 0;

  return { tumorCoverage, tumorMeanDose, healthyTissueMeanDose, maxHealthyTissueDose };
}

export function getDoseColor(dose: number, maxDose: number): string {
  const normalized = Math.min(dose / maxDose, 1);
  if (normalized < 0.2) return `hsl(221, 83%, ${53 + normalized * 100}%)`;
  if (normalized < 0.4) {
    const t = (normalized - 0.2) / 0.2;
    return `hsl(${221 - t * 34}, ${83 - t * 8}%, ${53 - t * 17}%)`;
  }
  if (normalized < 0.6) {
    const t = (normalized - 0.4) / 0.2;
    return `hsl(${187 - t * 99}, ${75 + t * 21}%, ${43 - t * 7}%)`;
  }
  if (normalized < 0.8) {
    const t = (normalized - 0.6) / 0.2;
    return `hsl(${43 - t * 10}, 96%, ${56 - t * 6}%)`;
  }
  const t = (normalized - 0.8) / 0.2;
  return `hsl(${33 - t * 33}, ${96 - t * 12}%, ${50 + t * 10}%)`;
}
