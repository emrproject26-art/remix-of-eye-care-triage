import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Move, Crosshair, Sun, Contrast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  imageUrl: string;
  eye: 'left' | 'right';
  patientName: string;
}

export function ImageViewer({ imageUrl, eye, patientName }: ImageViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isPanning, setIsPanning] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setBrightness(100);
    setContrast(100);
    setRotation(0);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            eye === 'left' ? 'bg-blue-500' : 'bg-green-500'
          )} />
          <span className="text-sm font-medium text-foreground capitalize">{eye} Eye</span>
          <span className="text-xs text-muted-foreground">• {patientName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsPanning(!isPanning)}
          >
            <Move className={cn("w-4 h-4", isPanning && "text-accent")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Crosshair className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Image Area */}
      <div className="flex-1 relative overflow-hidden bg-foreground/5">
        <div 
          className="absolute inset-0 flex items-center justify-center p-4"
          style={{ cursor: isPanning ? 'grab' : 'default' }}
        >
          <img
            src={imageUrl}
            alt={`${eye} eye fundus`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg transition-all duration-200"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
            }}
            draggable={false}
          />
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur px-2 py-1 rounded-md text-xs font-medium mono-text">
          {zoom}%
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 border-t border-border space-y-3">
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Slider
            value={[zoom]}
            min={50}
            max={300}
            step={25}
            onValueChange={(v) => setZoom(v[0])}
            className="flex-1"
          />
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRotate}>
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Brightness & Contrast */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sun className="w-3.5 h-3.5" />
              <span>Brightness: {brightness}%</span>
            </div>
            <Slider
              value={[brightness]}
              min={50}
              max={150}
              onValueChange={(v) => setBrightness(v[0])}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Contrast className="w-3.5 h-3.5" />
              <span>Contrast: {contrast}%</span>
            </div>
            <Slider
              value={[contrast]}
              min={50}
              max={150}
              onValueChange={(v) => setContrast(v[0])}
            />
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleReset} className="w-full text-xs">
          Reset View
        </Button>
      </div>
    </div>
  );
}
