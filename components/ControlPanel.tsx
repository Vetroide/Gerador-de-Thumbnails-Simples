import React from 'react';
import { TextConfig, FontStyle, AnalysisResult } from '../types';
import { Settings2, Type, Palette, Layout, Download, Sparkles } from 'lucide-react';

interface ControlPanelProps {
  textConfig: TextConfig;
  setTextConfig: React.Dispatch<React.SetStateAction<TextConfig>>;
  analysis: AnalysisResult | null;
  onDownload: (resolution: '720' | '1080' | '1440') => void;
  isGenerating: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  textConfig, 
  setTextConfig, 
  analysis, 
  onDownload,
  isGenerating
}) => {

  const handleChange = <K extends keyof TextConfig>(key: K, value: TextConfig[K]) => {
    setTextConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-full flex flex-col bg-slate-800 border-l border-slate-700 w-full lg:w-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900 sticky top-0 z-10">
        <h2 className="text-lg font-bold flex items-center gap-2 text-white">
          <Settings2 className="w-5 h-5 text-indigo-400" />
          Editor
        </h2>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Text Content */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-3 h-3" /> Content
            </label>
          </div>
          <textarea
            value={textConfig.text}
            onChange={(e) => handleChange('text', e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-sm text-white focus:border-indigo-500 outline-none resize-none h-20"
            placeholder="Enter thumbnail text..."
          />
          {analysis && (
             <button 
               onClick={() => handleChange('text', analysis.suggestedTitle)}
               className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
             >
               <Sparkles className="w-3 h-3" /> Use Suggested: "{analysis.suggestedTitle}"
             </button>
          )}
        </section>

        {/* Typography */}
        <section className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Layout className="w-3 h-3" /> Typography
          </label>
          
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Font Family</label>
            <select
              value={textConfig.font}
              onChange={(e) => handleChange('font', e.target.value as FontStyle)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white"
            >
              {Object.entries(FontStyle).map(([key, value]) => (
                <option key={key} value={value}>{key}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
             <div>
                <label className="text-xs text-slate-500 mb-1 block">Size</label>
                <input 
                  type="range" min="0.5" max="3" step="0.1"
                  value={textConfig.scale}
                  onChange={(e) => handleChange('scale', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
             </div>
             <div>
                <label className="text-xs text-slate-500 mb-1 block">Rotation</label>
                <input 
                  type="range" min="-45" max="45"
                  value={textConfig.rotation}
                  onChange={(e) => handleChange('rotation', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
             </div>
          </div>
        </section>

        {/* Colors & Appearance */}
        <section className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-3 h-3" /> Appearance
          </label>

          <div className="flex items-center justify-between">
             <label className="text-sm text-slate-300">Text Color</label>
             <input 
                type="color" 
                value={textConfig.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
             />
          </div>

          <div className="flex items-center justify-between">
             <label className="text-sm text-slate-300 flex items-center gap-2">
               <input 
                 type="checkbox" 
                 checked={textConfig.stroke}
                 onChange={(e) => handleChange('stroke', e.target.checked)}
                 className="rounded border-slate-600 bg-slate-700 text-indigo-500"
               />
               Stroke/Outline
             </label>
             {textConfig.stroke && (
               <input 
                  type="color" 
                  value={textConfig.strokeColor}
                  onChange={(e) => handleChange('strokeColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
               />
             )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-700">
             <div className="flex items-center justify-between">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={textConfig.hasShadow}
                  onChange={(e) => handleChange('hasShadow', e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700 text-indigo-500"
                />
                Drop Shadow
              </label>
              {textConfig.hasShadow && (
                <input 
                    type="color" 
                    value={textConfig.shadowColor}
                    onChange={(e) => handleChange('shadowColor', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                />
              )}
             </div>
             
             {textConfig.hasShadow && (
               <div className="space-y-2 pl-2 border-l-2 border-indigo-500/30 ml-1">
                  <div>
                    <label className="text-xs text-slate-500">Blur</label>
                    <input type="range" min="0" max="20" value={textConfig.shadowBlur} onChange={(e) => handleChange('shadowBlur', parseFloat(e.target.value))} className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Distance</label>
                    <input type="range" min="0" max="20" value={textConfig.shadowDistance} onChange={(e) => handleChange('shadowDistance', parseFloat(e.target.value))} className="w-full accent-indigo-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                  </div>
               </div>
             )}
          </div>
        </section>

        {/* Position Manual Controls */}
        <section className="space-y-3">
           <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Position</label>
           <div className="grid grid-cols-2 gap-2">
              <div>
                 <span className="text-xs text-slate-500">X Axis</span>
                 <input type="range" min="0" max="100" value={textConfig.positionX} onChange={(e) => handleChange('positionX', parseFloat(e.target.value))} className="w-full accent-indigo-500" />
              </div>
              <div>
                 <span className="text-xs text-slate-500">Y Axis</span>
                 <input type="range" min="0" max="100" value={textConfig.positionY} onChange={(e) => handleChange('positionY', parseFloat(e.target.value))} className="w-full accent-indigo-500" />
              </div>
           </div>
        </section>

        {/* Download Actions */}
        <section className="pt-6 border-t border-slate-700 space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Download className="w-3 h-3" /> Export
          </label>
          <div className="grid grid-cols-3 gap-2">
             <button onClick={() => onDownload('720')} disabled={isGenerating} className="bg-slate-700 hover:bg-slate-600 text-xs font-bold py-2 rounded transition-colors">720p</button>
             <button onClick={() => onDownload('1080')} disabled={isGenerating} className="bg-slate-700 hover:bg-slate-600 text-xs font-bold py-2 rounded transition-colors">1080p</button>
             <button onClick={() => onDownload('1440')} disabled={isGenerating} className="bg-slate-700 hover:bg-slate-600 text-xs font-bold py-2 rounded transition-colors">2K</button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ControlPanel;
