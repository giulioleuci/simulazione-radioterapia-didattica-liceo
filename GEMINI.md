# Radiotherapy Simulation Didactic Toy App

This project is an interactive, web-based simulator designed for educational purposes in the field of radiotherapy. It allows users to visualize and plan radiation treatments using simplified physical models for photon and proton beams on various anatomical presets.

## Project Overview

- **Purpose:** Educational tool for radiotherapy treatment planning simulation.
- **Domain:** Medical Physics / Radiotherapy.
- **Key Functionality:**
  - Multi-beam configuration (Photons/Protons).
  - Real-time dose distribution calculation and visualization.
  - Interactive anatomical models (Breast, Bladder, Head & Neck, Generic Phantom).
  - Treatment plan statistics (Tumor coverage, healthy tissue dose).
  - Dynamic patient positioning and beam collimation.

## Technical Stack

- **Framework:** [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/).
- **Build Tool:** [Vite](https://vitejs.dev/).
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) (based on Radix UI).
- **Icons:** [Lucide React](https://lucide.dev/).
- **State & Logic:** React Hooks, custom dose calculation engine in TypeScript.
- **Deployment:** Optimized for [Lovable](https://lovable.dev/).

## Project Structure

- `src/types/radiation.ts`: Core domain models (Beams, Anatomy, Organs, Dose Points).
- `src/utils/doseCalculation.ts`: Implementation of simplified radiation physics (attenuation, Bragg peak, collimation).
- `src/data/anatomyPresets.ts`: Predefined anatomical models with geometric organ definitions.
- `src/components/`:
  - `DoseVisualization.tsx`: Custom canvas or SVG-based rendering of the dose distribution.
  - `MultiBeamControls.tsx`: Interface for managing multiple radiation beams.
  - `StatisticsPanel.tsx`: Display of dosimetric indices (DVH-like metrics).
- `src/pages/Index.tsx`: Main application entry point and layout.

## Building and Running

### Development
```sh
npm install
npm run dev
```

### Production Build
```sh
npm run build
npm run preview
```

### Linting
```sh
npm run lint
```

## Development Conventions

- **Component Library:** Strictly use `shadcn/ui` components located in `src/components/ui/`.
- **Styling:** Prefer Tailwind utility classes. Maintain the "medical/professional" aesthetic (blue/slate/white palette).
- **Math/Physics:** Dose calculations are performed on a grid (default 150x150). Performance is critical for real-time feedback; utilize `useMemo` for heavy calculations.
- **Types:** Always define and export types in `src/types/` to maintain domain consistency.
- **Localization:** The UI currently uses Italian labels (e.g., "Laboratorio virtuale di radioterapia"). Maintain this or implement i18n if requested.

## Key Files

- `src/utils/doseCalculation.ts`: The "brain" of the app. Contains the logic for photon attenuation and proton Bragg peak simulation.
- `src/types/radiation.ts`: Defines the schema for the entire simulation state.
- `src/data/anatomyPresets.ts`: Contains complex geometric generators for organs (polygons, ellipses, irregular shapes).
