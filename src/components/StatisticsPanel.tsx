import { Statistics } from '@/types/radiation';
import { Activity, AlertCircle, CheckCircle2, TrendingUp, Shield, Target, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface StatisticsPanelProps {
  stats: Statistics;
}

export const StatisticsPanel = ({ stats }: StatisticsPanelProps) => {
  const getStatusIcon = (coverage: number) => {
    if (coverage >= 95) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (coverage >= 80) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <AlertCircle className="w-5 h-5 text-destructive" />;
  };

  const getStatusMessage = () => {
    if (stats.tumorCoverage >= 95 && stats.healthyTissueMeanDose < 20) {
      return { text: "Piano ottimale: buona copertura con bassa tossicità", color: "text-green-600" };
    } else if (stats.tumorCoverage >= 80) {
      if (stats.healthyTissueMeanDose > 30) {
        return { text: "Attenzione: dose ai tessuti sani troppo elevata", color: "text-yellow-600" };
      }
      return { text: "Copertura accettabile, ottimizzazione consigliata", color: "text-yellow-600" };
    } else {
      return { text: "Copertura insufficiente: il tumore non è adeguatamente irradiato", color: "text-destructive" };
    }
  };

  const status = getStatusMessage();
  
  const conformityIndex = stats.tumorCoverage > 0 
    ? (stats.tumorMeanDose / (stats.healthyTissueMeanDose + 0.1)) 
    : 0;
  const homogeneityIndex = stats.tumorMeanDose > 0
    ? ((stats.maxHealthyTissueDose - stats.tumorMeanDose) / stats.tumorMeanDose) * 100
    : 0;
  const sparingRatio = stats.tumorMeanDose > 0
    ? ((stats.tumorMeanDose - stats.healthyTissueMeanDose) / stats.tumorMeanDose) * 100
    : 0;

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border border-border shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Statistiche del piano</h3>
        {getStatusIcon(stats.tumorCoverage)}
      </div>

      <div className={`text-sm font-medium ${status.color} -mt-2`}>
        {status.text}
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        {/* Copertura tumorale */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Copertura tumorale</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {stats.tumorCoverage.toFixed(1)}%
          </div>
          <Progress value={stats.tumorCoverage} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground">% di tumore che riceve ≥95% della dose prescritta</p>
        </div>

        {/* Dose media al tumore */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-secondary" />
            <span className="text-xs font-medium text-muted-foreground">Dose media al tumore</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {stats.tumorMeanDose.toFixed(1)} 
            <span className="text-sm font-normal text-muted-foreground ml-1">Gy</span>
          </div>
          <Progress value={Math.min((stats.tumorMeanDose / 50) * 100, 100)} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground">Obiettivo: 50 Gy</p>
        </div>

        {/* Dose media ai tessuti sani */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-medium text-muted-foreground">Dose media tessuti sani</span>
          </div>
          <div className={`text-2xl font-bold ${
            stats.healthyTissueMeanDose > 30 ? 'text-destructive' : 'text-green-600'
          }`}>
            {stats.healthyTissueMeanDose.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">Gy</span>
          </div>
          <Progress value={Math.min((stats.healthyTissueMeanDose / 50) * 100, 100)} className="h-1.5" />
          <p className="text-[10px] text-muted-foreground">Più bassa è, meglio è (ideale &lt;20 Gy)</p>
        </div>

        {/* Dose massima ai tessuti sani */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs font-medium text-muted-foreground">Dose max tessuti sani</span>
          </div>
          <div className="text-2xl font-bold text-destructive">
            {stats.maxHealthyTissueDose.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">Gy</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Punto caldo (hot spot) fuori dal tumore</p>
        </div>
      </div>

      <Separator />

      {/* Indici avanzati */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Indici avanzati</h4>
        
        <div className="grid gap-2">
          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium">Indice di conformità</span>
              </div>
              <span className="text-[10px] text-muted-foreground ml-5.5">Rapporto dose tumore / dose tessuti sani</span>
            </div>
            <span className={`text-sm font-bold ${
              conformityIndex > 2 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {conformityIndex.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs font-medium">Risparmio dei tessuti</span>
              </div>
              <span className="text-[10px] text-muted-foreground ml-5.5">Quanto la dose è concentrata sul tumore</span>
            </div>
            <span className={`text-sm font-bold ${
              sparingRatio > 50 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {sparingRatio.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-medium">Omogeneità della dose</span>
              </div>
              <span className="text-[10px] text-muted-foreground ml-5.5">Uniformità della distribuzione (più basso = migliore)</span>
            </div>
            <span className={`text-sm font-bold ${
              Math.abs(homogeneityIndex) < 20 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {Math.abs(homogeneityIndex).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
