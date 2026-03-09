import { useEffect, useRef, useCallback, useState } from 'react';
import { BeamConfig, DosePoint, AnatomyModel, Organ } from '@/types/radiation';
import { getDoseColor } from '@/utils/doseCalculation';

interface DoseVisualizationProps {
  dosePoints: DosePoint[];
  anatomy: AnatomyModel;
  beams: BeamConfig[];
  showIsodoseLines?: boolean;
  patientOffset?: { x: number; y: number };
  onPatientOffsetChange?: (offset: { x: number; y: number }) => void;
}

export const DoseVisualization = ({ 
  dosePoints, 
  anatomy, 
  beams,
  showIsodoseLines = true,
  patientOffset = { x: 0, y: 0 },
  onPatientOffsetChange,
}: DoseVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number }>({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const [cursorStyle, setCursorStyle] = useState<string>('grab');

  // Drag handlers
  const getCanvasScale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { sx: 1, sy: 1 };
    const rect = canvas.getBoundingClientRect();
    return {
      sx: anatomy.healthyTissue.width / rect.width,
      sy: anatomy.healthyTissue.height / rect.height,
    };
  }, [anatomy]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    const scale = getCanvasScale();
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: patientOffset.x,
      offsetY: patientOffset.y,
    };
    setCursorStyle('grabbing');
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [patientOffset, getCanvasScale]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !onPatientOffsetChange) return;
    const scale = getCanvasScale();
    const dx = (e.clientX - dragStart.current.x) * scale.sx;
    const dy = (e.clientY - dragStart.current.y) * scale.sy;
    onPatientOffsetChange({
      x: dragStart.current.offsetX + dx,
      y: dragStart.current.offsetY + dy,
    });
  }, [onPatientOffsetChange, getCanvasScale]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    setCursorStyle('grab');
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dosePoints.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const ox = patientOffset.x;
    const oy = patientOffset.y;
    
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw crosshair at isocentre (center of beams)
    const isoCX = width / 2;
    const isoCY = height / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(isoCX, 0); ctx.lineTo(isoCX, height);
    ctx.moveTo(0, isoCY); ctx.lineTo(width, isoCY);
    ctx.stroke();
    ctx.setLineDash([]);
    // Small circle at isocentre
    ctx.beginPath();
    ctx.arc(isoCX, isoCY, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    const scaleX = width / anatomy.healthyTissue.width;
    const scaleY = height / anatomy.healthyTissue.height;
    
    // Draw body outline (shifted by offset)
    if (anatomy.bodyOutline && anatomy.bodyOutline.length > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo((anatomy.bodyOutline[0].x + ox) * scaleX, (anatomy.bodyOutline[0].y + oy) * scaleY);
      anatomy.bodyOutline.forEach(p => ctx.lineTo((p.x + ox) * scaleX, (p.y + oy) * scaleY));
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 220, 200, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 220, 200, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Draw filled organs (non-tumor, behind dose) — offset applied
    anatomy.organs.filter(o => !o.isTumor).forEach(organ => {
      drawFilledOrgan(ctx, organ, scaleX, scaleY, ox, oy);
    });
    
    // Draw dose distribution
    const maxDose = Math.max(...dosePoints.map(p => p.dose));
    const gridSize = Math.sqrt(dosePoints.length);
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    
    dosePoints.forEach(point => {
      const screenX = point.x * scaleX;
      const screenY = point.y * scaleY;
      if (point.dose > 0.1) {
        ctx.fillStyle = getDoseColor(point.dose, maxDose);
        ctx.globalAlpha = 0.5;
        ctx.fillRect(screenX - cellWidth / 2, screenY - cellHeight / 2, cellWidth, cellHeight);
      }
    });
    ctx.globalAlpha = 1.0;
    
    // Isodose lines
    if (showIsodoseLines && maxDose > 0) {
      const isodoseLevels = [0.2, 0.4, 0.6, 0.8, 0.95];
      isodoseLevels.forEach(level => {
        ctx.strokeStyle = getDoseColor(level * maxDose, maxDose);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        for (let i = 0; i < gridSize - 1; i++) {
          for (let j = 0; j < gridSize - 1; j++) {
            const idx = i * gridSize + j;
            const point = dosePoints[idx];
            if (point && point.dose >= level * maxDose * 0.95 && point.dose <= level * maxDose * 1.05) {
              ctx.beginPath();
              ctx.arc(point.x * scaleX, point.y * scaleY, 1.5, 0, 2 * Math.PI);
              ctx.stroke();
            }
          }
        }
      });
      ctx.setLineDash([]);
    }
    
    // Organ outlines on top (with offset)
    anatomy.organs.filter(o => !o.isTumor).forEach(organ => {
      drawOrganOutline(ctx, organ, scaleX, scaleY, organ.color || 'rgba(100, 200, 255, 0.5)', 1.5, ox, oy);
    });
    
    // Tumors on top (with offset)
    anatomy.organs.filter(o => o.isTumor).forEach(organ => {
      drawFilledOrgan(ctx, organ, scaleX, scaleY, ox, oy);
      drawOrganOutline(ctx, organ, scaleX, scaleY, '#ef4444', 2.5, ox, oy);
      const labelX = (organ.x + ox) * scaleX + organ.radiusX * scaleX + 8;
      const labelY = (organ.y + oy) * scaleY;
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText(organ.name, labelX, labelY);
    });
    
    // Beam arrows (fixed at isocentre)
    const arrowLength = Math.min(width, height) * 0.25;
    beams.filter(beam => beam.enabled).forEach(beam => {
      const angleRad = (beam.angle * Math.PI) / 180;
      const startX = isoCX - Math.cos(angleRad) * arrowLength * 1.5;
      const startY = isoCY - Math.sin(angleRad) * arrowLength * 1.5;
      const endX = isoCX + Math.cos(angleRad) * arrowLength * 0.4;
      const endY = isoCY + Math.sin(angleRad) * arrowLength * 0.4;
      
      const color = beam.type === 'photon' ? '#3b82f6' : '#8b5cf6';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      const headLength = 12;
      const headAngle = Math.PI / 6;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLength * Math.cos(angleRad - headAngle), endY - headLength * Math.sin(angleRad - headAngle));
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headLength * Math.cos(angleRad + headAngle), endY - headLength * Math.sin(angleRad + headAngle));
      ctx.stroke();
    });
    ctx.globalAlpha = 1.0;
    
  }, [dosePoints, anatomy, beams, showIsodoseLines, patientOffset]);

  return (
    <div className="relative w-full h-full bg-card rounded-lg border border-border overflow-hidden shadow-lg">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
        style={{ cursor: cursorStyle }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      
      <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm p-3 rounded-lg border border-border shadow-md">
        <div className="text-xs font-semibold mb-2 text-foreground">Mappa della dose</div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-4 rounded" style={{
            background: 'linear-gradient(to right, hsl(221, 83%, 53%), hsl(187, 85%, 43%), hsl(142, 76%, 36%), hsl(43, 96%, 56%), hsl(0, 84%, 60%))'
          }} />
          <div className="flex flex-col text-xs text-muted-foreground">
            <span>Alta</span>
            <span>Bassa</span>
          </div>
        </div>
      </div>

      <div className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm px-2.5 py-1.5 rounded border border-border text-xs text-muted-foreground">
        ✥ Isocentro
      </div>
    </div>
  );
};

function drawOrganPath(ctx: CanvasRenderingContext2D, organ: Organ, scaleX: number, scaleY: number, ox: number, oy: number) {
  const cx = (organ.x + ox) * scaleX;
  const cy = (organ.y + oy) * scaleY;

  ctx.save();
  ctx.translate(cx, cy);
  if (organ.rotation) ctx.rotate((organ.rotation * Math.PI) / 180);

  ctx.beginPath();

  if (organ.shape === 'polygon' && organ.points && organ.points.length > 2) {
    ctx.moveTo(organ.points[0].x * scaleX, organ.points[0].y * scaleY);
    organ.points.forEach(p => ctx.lineTo(p.x * scaleX, p.y * scaleY));
    ctx.closePath();
  } else if (organ.shape === 'circle') {
    ctx.arc(0, 0, organ.radiusX * scaleX, 0, Math.PI * 2);
  } else if (organ.shape === 'irregular') {
    const points = 64;
    for (let i = 0; i <= points; i++) {
      const a = (i / points) * Math.PI * 2;
      const irregularity = 0.15 * Math.sin(a * 5) + 0.08 * Math.cos(a * 7);
      const r = 1 + irregularity;
      const x = Math.cos(a) * organ.radiusX * scaleX * r;
      const y = Math.sin(a) * organ.radiusY * scaleY * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else {
    ctx.ellipse(0, 0, organ.radiusX * scaleX, organ.radiusY * scaleY, 0, 0, Math.PI * 2);
  }

  ctx.restore();
}

function drawFilledOrgan(ctx: CanvasRenderingContext2D, organ: Organ, scaleX: number, scaleY: number, ox: number = 0, oy: number = 0) {
  ctx.save();
  drawOrganPath(ctx, organ, scaleX, scaleY, ox, oy);
  ctx.fillStyle = organ.color || (organ.isTumor ? 'rgba(220,50,50,0.35)' : 'rgba(100,200,255,0.15)');
  ctx.fill();
  ctx.restore();
}

function drawOrganOutline(ctx: CanvasRenderingContext2D, organ: Organ, scaleX: number, scaleY: number, color: string, lineWidth: number, ox: number = 0, oy: number = 0) {
  ctx.save();
  drawOrganPath(ctx, organ, scaleX, scaleY, ox, oy);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}
