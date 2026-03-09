export type BeamType = 'photon' | 'proton';

export interface CollimatorLeaf {
  position: number;
  depth: number;
  width: number;
  falloff: number;
}

export interface BeamConfig {
  id: string;
  type: BeamType;
  energy: number;
  angle: number;
  intensity: number;
  width: number;
  enabled: boolean;
  collimatorLeaves: CollimatorLeaf[];
}

export type OrganShape = 'circle' | 'ellipse' | 'irregular' | 'polygon';

export interface OrganPoint {
  x: number;
  y: number;
}

export interface Organ {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  shape: OrganShape;
  rotation?: number;
  isTumor: boolean;
  name: string;
  color?: string; // fill color for rendering
  points?: OrganPoint[]; // custom polygon points (relative to x,y center)
}

export interface AnatomyModel {
  organs: Organ[];
  healthyTissue: {
    width: number;
    height: number;
  };
  bodyOutline?: OrganPoint[]; // outline of the body cross-section
  name: string;
  description: string;
}

export interface DosePoint {
  x: number;
  y: number;
  dose: number;
  isTumor: boolean;
}

export interface Statistics {
  tumorCoverage: number;
  tumorMeanDose: number;
  healthyTissueMeanDose: number;
  maxHealthyTissueDose: number;
}
