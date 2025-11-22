import React, { useRef, useEffect, useState } from 'react';
import { TextConfig, FontStyle } from '../types';

interface ThumbnailPreviewProps {
  imageUrl: string | null;
  textConfig: TextConfig;
  setTextConfig: React.Dispatch<React.SetStateAction<TextConfig>>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({ 
  imageUrl, 
  textConfig, 
  setTextConfig,
  canvasRef 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp values 0-100
    const clampedX = Math.min(Math.max(x, 0), 100);
    const clampedY = Math.min(Math.max(y, 0), 100);

    setTextConfig(prev => ({ ...prev, positionX: clampedX, positionY: clampedY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse leave to stop drag if user leaves area
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Construct shadow string
  const shadowStyle = textConfig.hasShadow 
    ? `${textConfig.shadowDistance}px ${textConfig.shadowDistance}px ${textConfig.shadowBlur}px ${textConfig.shadowColor}` 
    : 'none';
  
  const strokeStyle = textConfig.stroke 
    ? `2px ${textConfig.strokeColor}` // CSS text-stroke is widely supported now but we stick to standard or shadow hacks if needed. Webkit prefix usually needed.
    : 'none';

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 bg-slate-950 overflow-hidden relative">
      
      {/* This hidden canvas is used for the final high-res render/download logic triggered by parent */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Visual Preview Container (Responsive 16:9) */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl aspect-video bg-slate-900 shadow-2xl shadow-black rounded-lg overflow-hidden group select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Thumbnail Background" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-800/50">
            <div className="text-4xl mb-2 opacity-20">16:9</div>
            <p className="text-sm opacity-40">Generate an image to begin</p>
          </div>
        )}

        {/* Text Overlay Layer */}
        {imageUrl && textConfig.text && (
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: 'absolute',
              left: `${textConfig.positionX}%`,
              top: `${textConfig.positionY}%`,
              transform: `translate(-50%, -50%) scale(${textConfig.scale}) rotate(${textConfig.rotation}deg)`,
              fontFamily: `"${textConfig.font}", sans-serif`,
              color: textConfig.color,
              textShadow: shadowStyle,
              opacity: textConfig.opacity,
              cursor: isDragging ? 'grabbing' : 'grab',
              whiteSpace: 'nowrap',
              WebkitTextStroke: textConfig.stroke ? `2px ${textConfig.strokeColor}` : '0px', // Using Webkit for stroke
              zIndex: 10
            }}
            className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight p-2 border-2 border-transparent hover:border-indigo-500/50 hover:bg-black/10 rounded transition-colors ${isDragging ? 'border-indigo-500 bg-black/10' : ''}`}
          >
            {textConfig.text}
          </div>
        )}
        
        {!imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="animate-pulse text-slate-500">Waiting for generation...</span>
            </div>
        )}
      </div>
      
      <p className="mt-4 text-slate-500 text-xs font-mono">
        * Drag text to position manually. Use sidebar for fine-tuning.
      </p>
    </div>
  );
};

export default ThumbnailPreview;
