import { AnatomyModel } from '@/types/radiation';
import { anatomyPresets, getAnatomyPresetNames } from '@/data/anatomyPresets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnatomySelectorProps {
  selectedAnatomy: string;
  onAnatomyChange: (anatomy: AnatomyModel, key: string) => void;
  variant?: 'default' | 'header';
}

export const AnatomySelector = ({ selectedAnatomy, onAnatomyChange, variant = 'default' }: AnatomySelectorProps) => {
  const presetNames = getAnatomyPresetNames();
  const currentPreset = anatomyPresets[selectedAnatomy];

  if (variant === 'header') {
    return (
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-sm text-white/70 hidden sm:inline shrink-0">Modello:</span>
        <Select value={selectedAnatomy} onValueChange={(key) => onAnatomyChange(anatomyPresets[key], key)}>
          <SelectTrigger className="min-w-[180px] max-w-[240px] bg-white/10 border-white/20 text-white hover:bg-white/20 [&>span]:truncate">
            <SelectValue placeholder="Seleziona modello" />
          </SelectTrigger>
          <SelectContent>
            {presetNames.map((key) => {
              const preset = anatomyPresets[key];
              return (
                <SelectItem key={key} value={key}>
                  <span className="font-medium">{preset.name}</span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-6 bg-card rounded-lg border border-border shadow-md">
      <h3 className="text-lg font-semibold text-foreground">Modello anatomico</h3>
      
      <Select value={selectedAnatomy} onValueChange={(key) => onAnatomyChange(anatomyPresets[key], key)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presetNames.map((key) => {
            const preset = anatomyPresets[key];
            return (
              <SelectItem key={key} value={key}>
                <div className="flex flex-col">
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-xs text-muted-foreground">{preset.description}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <div className="text-xs text-muted-foreground pt-2">
        {currentPreset.organs.filter(o => o.isTumor).length} tumore(i) · {currentPreset.organs.filter(o => !o.isTumor).length} strutture sane
      </div>
    </div>
  );
};
