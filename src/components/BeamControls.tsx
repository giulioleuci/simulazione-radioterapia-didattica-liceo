import { BeamConfig } from '@/types/radiation';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BeamControlsProps {
  beam: BeamConfig;
  onBeamChange: (beam: BeamConfig) => void;
}

export const BeamControls = ({ beam, onBeamChange }: BeamControlsProps) => {
  const updateBeam = (updates: Partial<BeamConfig>) => {
    onBeamChange({ ...beam, ...updates });
  };

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border border-border shadow-md">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-foreground">Configurazione Fascio</h3>
      </div>

      {/* Beam Type */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Tipo di Fascio</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  <strong>Fotoni:</strong> Penetrano in profondità con attenuazione graduale.
                  <br />
                  <strong>Protoni:</strong> Rilasciano la maggior parte dell'energia nel picco di Bragg, risparmiando i tessuti oltre il tumore.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <RadioGroup
          value={beam.type}
          onValueChange={(value) => updateBeam({ type: value as 'photon' | 'proton' })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="photon" id="photon" />
            <Label htmlFor="photon" className="font-normal cursor-pointer">
              Fotoni (Raggi X)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="proton" id="proton" />
            <Label htmlFor="proton" className="font-normal cursor-pointer">
              Protoni
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Energy */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Energia</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    L'energia determina la profondità di penetrazione del fascio. Energie maggiori raggiungono tumori più profondi.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm font-mono text-primary">{beam.energy} MeV</span>
        </div>
        <Slider
          value={[beam.energy]}
          onValueChange={([value]) => updateBeam({ energy: value })}
          min={beam.type === 'photon' ? 6 : 50}
          max={beam.type === 'photon' ? 18 : 250}
          step={beam.type === 'photon' ? 1 : 10}
          className="w-full"
        />
      </div>

      {/* Angle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Angolo di Incidenza</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    L'angolo da cui il fascio entra nel corpo. Modificando l'angolo si può proteggere meglio i tessuti sani.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm font-mono text-primary">{beam.angle}°</span>
        </div>
        <Slider
          value={[beam.angle]}
          onValueChange={([value]) => updateBeam({ angle: value })}
          min={0}
          max={360}
          step={5}
          className="w-full"
        />
      </div>

      {/* Intensity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Intensità</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    L'intensità del fascio determina la quantità di dose erogata. Valori troppo alti possono danneggiare i tessuti sani.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm font-mono text-primary">{beam.intensity}%</span>
        </div>
        <Slider
          value={[beam.intensity]}
          onValueChange={([value]) => updateBeam({ intensity: value })}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {/* Width */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Larghezza Fascio</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    La larghezza del fascio di radiazione. Fasci più stretti concentrano la dose sul tumore ma richiedono maggiore precisione.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-sm font-mono text-primary">{beam.width.toFixed(1)} cm</span>
        </div>
        <Slider
          value={[beam.width]}
          onValueChange={([value]) => updateBeam({ width: value })}
          min={1}
          max={10}
          step={0.5}
          className="w-full"
        />
      </div>
    </div>
  );
};
