import React from 'react';
import { AnalysisResult } from '../types';
import { User, Flame, MapPin, Palette, Camera } from 'lucide-react';

interface AnalysisViewProps {
  analysis: AnalysisResult;
}

const Tag: React.FC<{ icon: React.ElementType, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex flex-col gap-1`}>
    <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
    <div className="text-sm text-slate-200 leading-snug">{value}</div>
  </div>
);

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis }) => {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
        AI Script Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Tag icon={User} label="Protagonist" value={analysis.protagonist} color="text-blue-400" />
        <Tag icon={Flame} label="Threat / Conflict" value={analysis.threat} color="text-red-400" />
        <Tag icon={MapPin} label="Setting" value={analysis.setting} color="text-emerald-400" />
        <Tag icon={Palette} label="Mood" value={analysis.mood} color="text-purple-400" />
      </div>

      <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
        <div className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5 mb-1">
            <Camera className="w-3 h-3" /> 
            Visual Composition Plan
        </div>
        <p className="text-sm text-slate-300 italic">"{analysis.visualComposition}"</p>
      </div>
    </div>
  );
};

export default AnalysisView;
