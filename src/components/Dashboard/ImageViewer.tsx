import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Move, Crosshair, Sun, Contrast, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImageViewerProps {
  imageUrl: string;
  eye: 'OS' | 'OD' | 'OU';
  patientName: string;
}

const eyeLabels = {
  'OS': 'OS (Left Eye)',
  'OD': 'OD (Right Eye)',
  'OU': 'OU (Both Eyes)',
};

const eyeColors = {
  'OS': 'bg-blue-500',
  'OD': 'bg-green-500',
  'OU': 'bg-purple-500',
};

export function ImageViewer({ imageUrl, eye, patientName }: ImageViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  
  const handleReset = () => {
    setZoom(100);
    setBrightness(100);
    setContrast(100);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  }, [isPanning, panPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !isPanning) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, isPanning, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom(prev => Math.min(Math.max(prev + delta, 25), 400));
  }, []);

  const imageStyle = {
    transform: `scale(${zoom / 100}) rotate(${rotation}deg) translate(${panPosition.x / (zoom / 100)}px, ${panPosition.y / (zoom / 100)}px)`,
    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
  };

  const ImageContent = ({ inDialog = false }: { inDialog?: boolean }) => (
    <div className={cn("flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden", inDialog && "border-0")}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", eyeColors[eye])} />
          <span className="text-sm font-medium text-foreground">{eyeLabels[eye]}</span>
          <span className="text-xs text-muted-foreground">• {patientName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsPanning(!isPanning)}
            title="Pan Mode"
          >
            <Move className={cn("w-4 h-4", isPanning && "text-accent")} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleReset}
            title="Reset View"
          >
            <Crosshair className="w-4 h-4" />
          </Button>
          {!inDialog && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsFullscreen(true)}
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
          {inDialog && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsFullscreen(false)}
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Image Area */}
      <div 
        ref={imageContainerRef}
        className={cn("flex-1 relative overflow-hidden bg-foreground/5", inDialog && "min-h-[60vh]")}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <img
            src={imageUrl}
            alt={`${eyeLabels[eye]} fundus`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg transition-transform duration-100"
            style={imageStyle}
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
            min={25}
            max={400}
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

  return (
    <>
      <ImageContent />
      
      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <DialogTitle className="sr-only">{eyeLabels[eye]} Image Viewer</DialogTitle>
          <ImageContent inDialog />
        </DialogContent>
      </Dialog>
    </>
  );
}
