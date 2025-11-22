import React, { useState, useRef, useEffect } from 'react';
import ControlPanel from './components/ControlPanel';
import ThumbnailPreview from './components/ThumbnailPreview';
import AnalysisView from './components/AnalysisView';
import { AnalysisResult, TextConfig, FontStyle, AppStatus } from './types';
import { analyzeScript, generateThumbnailImage } from './services/geminiService';
import { Sparkles, AlertCircle, ImagePlus, Key } from 'lucide-react';

const DEFAULT_TEXT_CONFIG: TextConfig = {
  text: 'YOUR TITLE HERE',
  font: FontStyle.IMPACT,
  color: '#FFFFFF',
  hasShadow: true,
  shadowColor: '#000000',
  shadowBlur: 10,
  shadowDistance: 5,
  opacity: 1,
  stroke: true,
  strokeColor: '#000000',
  positionX: 50,
  positionY: 80,
  scale: 1,
  rotation: 0,
};

function App() {
  const [script, setScript] = useState('');
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [textConfig, setTextConfig] = useState<TextConfig>(DEFAULT_TEXT_CONFIG);
  const [hasApiKey, setHasApiKey] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check for API Key selection on mount (for Veo/Imagen flows if needed)
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for non-aistudio environments if environment variable is present
        if (process.env.API_KEY) {
           setHasApiKey(true);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success as per instructions
        setHasApiKey(true);
      } catch (e) {
        setError("Failed to select API key. Please try again.");
      }
    }
  };

  const handleGenerate = async () => {
    if (!script.trim()) {
      setError("Please enter a script or description first.");
      return;
    }
    if (!hasApiKey) {
      setError("Please select an API Key to proceed.");
      return;
    }

    setStatus('analyzing');
    setError(null);

    try {
      // 1. Analyze Text
      const result = await analyzeScript(script);
      setAnalysis(result);
      
      // Update title suggestion
      setTextConfig(prev => ({
        ...prev,
        text: result.suggestedTitle || prev.text
      }));

      setStatus('generating_image');

      // 2. Generate Image
      const imageUrl = await generateThumbnailImage(result.imagePrompt);
      setGeneratedImageUrl(imageUrl);

      setStatus('complete');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setStatus('error');
    }
  };

  // Canvas Rendering for Download
  const handleDownload = (resolution: '720' | '1080' | '1440') => {
    if (!generatedImageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = generatedImageUrl;

    img.onload = () => {
      // Set dimensions based on requested resolution (16:9 aspect ratio)
      let width = 1280;
      if (resolution === '1080') width = 1920;
      if (resolution === '1440') width = 2560;
      
      const height = Math.round(width * (9 / 16));

      canvas.width = width;
      canvas.height = height;

      // 1. Draw Image
      ctx.drawImage(img, 0, 0, width, height);

      // 2. Draw Text
      if (textConfig.text) {
        ctx.save();
        
        // Calculate position
        const x = (textConfig.positionX / 100) * width;
        const y = (textConfig.positionY / 100) * height;

        ctx.translate(x, y);
        ctx.rotate((textConfig.rotation * Math.PI) / 180);
        ctx.scale(textConfig.scale, textConfig.scale);

        // Font Size Scaling relative to canvas height (roughly 15% of height as base)
        const baseFontSize = height * 0.15;
        ctx.font = `900 ${baseFontSize}px "${textConfig.font}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shadow
        if (textConfig.hasShadow) {
          ctx.shadowColor = textConfig.shadowColor;
          ctx.shadowBlur = textConfig.shadowBlur * (width / 1000); // Scale blur
          ctx.shadowOffsetX = textConfig.shadowDistance;
          ctx.shadowOffsetY = textConfig.shadowDistance;
        }

        // Stroke
        if (textConfig.stroke) {
          ctx.lineWidth = width * 0.005; // Responsive stroke width
          ctx.strokeStyle = textConfig.strokeColor;
          ctx.strokeText(textConfig.text, 0, 0);
        }

        // Fill
        ctx.shadowColor = 'transparent'; // Reset shadow for fill to avoid double shadow if stroke had it
        if (textConfig.hasShadow) {
            // Re-apply shadow for fill if wanted, but usually stroke shadow covers it. 
            // Let's keep simple: Stroke gets shadow, fill sits on top.
            ctx.shadowColor = textConfig.shadowColor;
        }
        
        ctx.fillStyle = textConfig.color;
        ctx.globalAlpha = textConfig.opacity;
        ctx.fillText(textConfig.text, 0, 0);

        ctx.restore();
      }

      // 3. Trigger Download
      const link = document.createElement('a');
      link.download = `thumbnail-${resolution}p.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    };
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-roboto">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
        
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-6 justify-between shrink-0">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                 <ImagePlus className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                ThumbGenius AI
              </h1>
           </div>

           <div className="flex items-center gap-4">
              {!hasApiKey && window.aistudio && (
                <button 
                  onClick={handleSelectKey}
                  className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-sm hover:bg-amber-500/20 transition"
                >
                  <Key className="w-4 h-4" />
                  Select API Key
                </button>
              )}
              <div className="text-xs text-slate-500 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                v1.0 • Gemini & Imagen
              </div>
           </div>
        </header>

        {/* Two Column Layout (Input/Analysis vs Preview) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Side: Input & Analysis (Scrollable) */}
          <div className="w-full max-w-md border-r border-slate-800 bg-slate-900/50 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 p-6 space-y-6">
            
            {/* Input Section */}
            <section className="space-y-3">
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-wide">
                Script / Description
              </label>
              <textarea 
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your video script, story, or idea here... (e.g., 'A detective finds a glowing artifact in a rainy cyberpunk alleyway...')"
                className="w-full h-40 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all shadow-inner"
              />
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={status === 'analyzing' || status === 'generating_image'}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                  ${status === 'idle' || status === 'complete' || status === 'error'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25' 
                    : 'bg-slate-700 cursor-wait opacity-80'}`
                }
              >
                {status === 'analyzing' && (
                   <> <Sparkles className="w-5 h-5 animate-spin" /> Analyzing Script...</>
                )}
                {status === 'generating_image' && (
                   <> <ImagePlus className="w-5 h-5 animate-bounce" /> Generating Visuals...</>
                )}
                {(status === 'idle' || status === 'complete' || status === 'error') && (
                   <> <Sparkles className="w-5 h-5" /> Generate Thumbnail</>
                )}
              </button>
            </section>

            {/* Analysis Output */}
            {analysis && (
              <div className="animate-fade-in">
                 <AnalysisView analysis={analysis} />
              </div>
            )}

          </div>

          {/* Center: Preview Canvas */}
          <ThumbnailPreview 
             imageUrl={generatedImageUrl} 
             textConfig={textConfig}
             setTextConfig={setTextConfig}
             canvasRef={canvasRef}
          />
        </div>
      </main>

      {/* Right Side: Control Panel */}
      <aside className="h-full shrink-0 z-10 shadow-2xl">
        <ControlPanel 
          textConfig={textConfig} 
          setTextConfig={setTextConfig} 
          analysis={analysis}
          onDownload={handleDownload}
          isGenerating={status !== 'idle' && status !== 'complete' && status !== 'error'}
        />
      </aside>
    </div>
  );
}

export default App;