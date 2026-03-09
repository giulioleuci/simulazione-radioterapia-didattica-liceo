import { useState, useMemo, useCallback } from 'react';
import { BeamConfig, AnatomyModel } from '@/types/radiation';
import { DoseVisualization } from '@/components/DoseVisualization';
import { MultiBeamControls } from '@/components/MultiBeamControls';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { AnatomySelector } from '@/components/AnatomySelector';
import { calculateDoseDistribution, calculateStatistics } from '@/utils/doseCalculation';
import { anatomyPresets } from '@/data/anatomyPresets';
import { Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [selectedAnatomyKey, setSelectedAnatomyKey] = useState<string>('generic');
  const [anatomy, setAnatomy] = useState<AnatomyModel>(anatomyPresets.generic);
  const [patientOffset, setPatientOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  const [beams, setBeams] = useState<BeamConfig[]>([
    {
      id: 'beam-1',
      type: 'photon',
      energy: 6,
      angle: 0,
      intensity: 80,
      width: 6,
      enabled: true,
      collimatorLeaves: [],
    },
  ]);

  const handleAnatomyChange = (newAnatomy: AnatomyModel, key: string) => {
    setAnatomy(newAnatomy);
    setSelectedAnatomyKey(key);
    setPatientOffset({ x: 0, y: 0 });
  };

  const handleOffsetChange = useCallback((offset: { x: number; y: number }) => {
    setPatientOffset(offset);
  }, []);

  const resetOffset = useCallback(() => {
    setPatientOffset({ x: 0, y: 0 });
  }, []);

  const dosePoints = useMemo(() => {
    return calculateDoseDistribution(beams, anatomy, 150, patientOffset);
  }, [beams, anatomy, patientOffset]);

  const statistics = useMemo(() => {
    return calculateStatistics(dosePoints);
  }, [dosePoints]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header con selettore anatomico */}
      <header className="border-b border-border bg-gradient-medical shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Laboratorio virtuale di radioterapia
                </h1>
                <p className="text-xs text-white/70">
                  Simulatore interattivo di pianificazione di trattamenti
                </p>
              </div>
            </div>
            <AnatomySelector 
              selectedAnatomy={selectedAnatomyKey}
              onAnatomyChange={handleAnatomyChange}
              variant="header"
            />
          </div>
        </div>
      </header>

      {/* Main: immagine (70%) + controlli fasci (30%) */}
      <main className="container mx-auto px-6 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Visualizzazione dose — 70% */}
          <div className="lg:col-span-7">
            <div className="bg-card rounded-lg border border-border shadow-md overflow-hidden h-full flex flex-col">
              <div className="px-4 py-3 border-b border-border bg-panel-bg flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Distribuzione della dose
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Trascina per posizionare il paziente · Offset: ({patientOffset.x.toFixed(1)}, {patientOffset.y.toFixed(1)}) cm
                  </p>
                </div>
                {(patientOffset.x !== 0 || patientOffset.y !== 0) && (
                  <Button variant="outline" size="sm" onClick={resetOffset} className="gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </Button>
                )}
              </div>
              <div className="p-4 flex-1">
                <div className="aspect-[4/3] w-full">
                  <DoseVisualization
                    dosePoints={dosePoints}
                    anatomy={anatomy}
                    beams={beams}
                    showIsodoseLines={true}
                    patientOffset={patientOffset}
                    onPatientOffsetChange={handleOffsetChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configurazione fasci — 30% */}
          <div className="lg:col-span-3 space-y-4">
            {/* Statistiche principali sempre visibili */}
            <div className="p-4 bg-card rounded-lg border border-border shadow-md">
              <h4 className="text-sm font-semibold text-foreground mb-3">Riepilogo del piano</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Copertura tumorale</p>
                  <p className={`text-lg font-bold ${statistics.tumorCoverage >= 95 ? 'text-green-600' : statistics.tumorCoverage >= 80 ? 'text-yellow-600' : 'text-destructive'}`}>
                    {statistics.tumorCoverage.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Dose media tumore</p>
                  <p className="text-lg font-bold text-foreground">
                    {statistics.tumorMeanDose.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Gy</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Dose media tessuti sani</p>
                  <p className={`text-lg font-bold ${statistics.healthyTissueMeanDose > 30 ? 'text-destructive' : 'text-green-600'}`}>
                    {statistics.healthyTissueMeanDose.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Gy</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Dose max tessuti sani</p>
                  <p className="text-lg font-bold text-destructive">
                    {statistics.maxHealthyTissueDose.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">Gy</span>
                  </p>
                </div>
              </div>
            </div>
            <MultiBeamControls beams={beams} onBeamsChange={setBeams} />
          </div>
        </div>

        {/* Statistiche del piano — sotto tutto */}
        <div className="mt-6">
          <StatisticsPanel stats={statistics} />
        </div>
      </main>

      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 py-3">
          <p className="text-xs text-center text-muted-foreground">
            Simulatore educativo · Modelli semplificati a scopo didattico
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
