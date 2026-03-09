import { BeamConfig } from '@/types/radiation';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Plus, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface MultiBeamControlsProps {
  beams: BeamConfig[];
  onBeamsChange: (beams: BeamConfig[]) => void;
}

const DODECAGON_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);

export const MultiBeamControls = ({ beams, onBeamsChange }: MultiBeamControlsProps) => {
  const addBeam = () => {
    if (beams.length >= 12) return;
    
    const usedAngles = beams.map(b => b.angle);
    const availableAngle = DODECAGON_ANGLES.find(angle => !usedAngles.includes(angle)) || 0;
    
    const newBeam: BeamConfig = {
      id: `beam-${Date.now()}`,
      type: 'photon',
      energy: 6,
      angle: availableAngle,
      intensity: 80,
      width: 6,
      enabled: true,
      collimatorLeaves: [],
    };
    
    onBeamsChange([...beams, newBeam]);
  };

  const removeBeam = (id: string) => {
    onBeamsChange(beams.filter(b => b.id !== id));
  };

  const updateBeam = (id: string, updates: Partial<BeamConfig>) => {
    onBeamsChange(beams.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const addCollimatorLeaf = (beamId: string) => {
    const beam = beams.find(b => b.id === beamId);
    if (!beam) return;
    
    const newLeaf = { position: 0, depth: 0.5, width: 1.0, falloff: 0.2 };
    updateBeam(beamId, { 
      collimatorLeaves: [...beam.collimatorLeaves, newLeaf] 
    });
  };

  const updateCollimatorLeaf = (beamId: string, leafIndex: number, updates: { position?: number; depth?: number; width?: number; falloff?: number }) => {
    const beam = beams.find(b => b.id === beamId);
    if (!beam) return;
    
    const newLeaves = [...beam.collimatorLeaves];
    newLeaves[leafIndex] = { ...newLeaves[leafIndex], ...updates };
    updateBeam(beamId, { collimatorLeaves: newLeaves });
  };

  const removeCollimatorLeaf = (beamId: string, leafIndex: number) => {
    const beam = beams.find(b => b.id === beamId);
    if (!beam) return;
    
    updateBeam(beamId, { 
      collimatorLeaves: beam.collimatorLeaves.filter((_, i) => i !== leafIndex) 
    });
  };

  return (
    <div className="space-y-3 p-4 bg-card rounded-lg border border-border shadow-md">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Configurazione dei fasci</h3>
        <Button 
          onClick={addBeam} 
          disabled={beams.length >= 12}
          size="sm"
          variant="default"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Aggiungi fascio ({beams.length}/12)
        </Button>
      </div>

      <Accordion type="single" collapsible className="space-y-1">
        {beams.map((beam, index) => (
          <AccordionItem key={beam.id} value={beam.id} className="border border-border rounded">
            <AccordionTrigger className="px-3 py-2 hover:no-underline">
              <div className="flex items-center gap-2 w-full text-sm">
                <Switch
                  checked={beam.enabled}
                  onCheckedChange={(checked) => updateBeam(beam.id, { enabled: checked })}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-90"
                />
                <span className="font-medium text-sm">
                  Fascio {index + 1} ({beam.angle}°)
                </span>
                <span className="text-[11px] text-muted-foreground ml-auto mr-2">
                  {beam.type === 'photon' ? 'Fotoni' : 'Protoni'} · {beam.energy} MeV
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <Tabs defaultValue="beam" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="beam">Parametri fascio</TabsTrigger>
                  <TabsTrigger value="collimator">Collimatore</TabsTrigger>
                </TabsList>

                <TabsContent value="beam" className="space-y-4 mt-4">
                  {/* Tipo di fascio */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tipo di particella</Label>
                    <RadioGroup
                      value={beam.type}
                      onValueChange={(value) => updateBeam(beam.id, { type: value as 'photon' | 'proton' })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="photon" id={`${beam.id}-photon`} />
                        <Label htmlFor={`${beam.id}-photon`} className="font-normal cursor-pointer">Fotoni (raggi X)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="proton" id={`${beam.id}-proton`} />
                        <Label htmlFor={`${beam.id}-proton`} className="font-normal cursor-pointer">Protoni (adroterapia)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Energia */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Energia del fascio</Label>
                      <span className="text-sm font-mono text-primary">{beam.energy} MeV</span>
                    </div>
                    <Slider
                      value={[beam.energy]}
                      onValueChange={([value]) => updateBeam(beam.id, { energy: value })}
                      min={beam.type === 'photon' ? 6 : 50}
                      max={beam.type === 'photon' ? 18 : 250}
                      step={beam.type === 'photon' ? 1 : 10}
                    />
                    <p className="text-[10px] text-muted-foreground">Determina la profondità di penetrazione nel corpo</p>
                  </div>

                  {/* Angolo */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Angolo di incidenza</Label>
                      <span className="text-sm font-mono text-primary">{beam.angle}°</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {DODECAGON_ANGLES.map(angle => (
                        <Button
                          key={angle}
                          variant={beam.angle === angle ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateBeam(beam.id, { angle })}
                          className="text-xs"
                        >
                          {angle}°
                        </Button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Direzione da cui il fascio entra nel paziente</p>
                  </div>

                  {/* Intensità */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Intensità relativa</Label>
                      <span className="text-sm font-mono text-primary">{beam.intensity}%</span>
                    </div>
                    <Slider
                      value={[beam.intensity]}
                      onValueChange={([value]) => updateBeam(beam.id, { intensity: value })}
                      min={0}
                      max={100}
                      step={5}
                    />
                    <p className="text-[10px] text-muted-foreground">Quantità di dose erogata da questo fascio</p>
                  </div>

                  {/* Larghezza */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Larghezza del campo</Label>
                      <span className="text-sm font-mono text-primary">{beam.width.toFixed(1)} cm</span>
                    </div>
                    <Slider
                      value={[beam.width]}
                      onValueChange={([value]) => updateBeam(beam.id, { width: value })}
                      min={1}
                      max={10}
                      step={0.5}
                    />
                    <p className="text-[10px] text-muted-foreground">Dimensione trasversale del fascio di radiazione</p>
                  </div>

                  <Button
                    onClick={() => removeBeam(beam.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Rimuovi questo fascio
                  </Button>
                </TabsContent>

                <TabsContent value="collimator" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Lamelle del collimatore</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs">
                              Le lamelle sono elementi mobili che sagomano il fascio, bloccando la radiazione dove non è necessaria per proteggere i tessuti sani.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Button
                      onClick={() => addCollimatorLeaf(beam.id)}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi lamella
                    </Button>
                  </div>

                  {beam.collimatorLeaves.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nessuna lamella configurata. Il fascio non è sagomato.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {beam.collimatorLeaves.map((leaf, leafIndex) => (
                        <div key={leafIndex} className="p-3 border border-border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Lamella {leafIndex + 1}</span>
                            <Button
                              onClick={() => removeCollimatorLeaf(beam.id, leafIndex)}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Posizione lungo il campo</Label>
                              <span className="text-xs font-mono">{leaf.position.toFixed(1)} cm</span>
                            </div>
                            <Slider
                              value={[leaf.position]}
                              onValueChange={([value]) => updateCollimatorLeaf(beam.id, leafIndex, { position: value })}
                              min={-beam.width / 2}
                              max={beam.width / 2}
                              step={0.1}
                            />
                          </div>

                           <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Grado di blocco</Label>
                              <span className="text-xs font-mono">{(leaf.depth * 100).toFixed(0)}%</span>
                            </div>
                            <Slider
                              value={[leaf.depth]}
                              onValueChange={([value]) => updateCollimatorLeaf(beam.id, leafIndex, { depth: value })}
                              min={0}
                              max={1}
                              step={0.05}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Larghezza della lamella</Label>
                              <span className="text-xs font-mono">{(leaf.width || 1).toFixed(1)} cm</span>
                            </div>
                            <Slider
                              value={[leaf.width || 1]}
                              onValueChange={([value]) => updateCollimatorLeaf(beam.id, leafIndex, { width: value })}
                              min={0.2}
                              max={3}
                              step={0.1}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Sfumatura del bordo</Label>
                              <span className="text-xs font-mono">{((leaf.falloff || 0.2) * 100).toFixed(0)}%</span>
                            </div>
                            <Slider
                              value={[leaf.falloff || 0.2]}
                              onValueChange={([value]) => updateCollimatorLeaf(beam.id, leafIndex, { falloff: value })}
                              min={0}
                              max={1}
                              step={0.05}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {beams.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Nessun fascio configurato. Premi "Aggiungi fascio" per iniziare la pianificazione.
        </p>
      )}
    </div>
  );
};
