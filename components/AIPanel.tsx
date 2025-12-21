import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { GeneratorStatus } from '../types';

interface AIPanelProps {
  onGenerate: (prompt: string) => void;
  status: GeneratorStatus;
}

const AIPanel: React.FC<AIPanelProps> = ({ onGenerate, status }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && status !== GeneratorStatus.GENERATING) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl z-20 animate-slide-up">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-center gap-2 bg-gray-950/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl"
        >
          <div className="pl-3 text-indigo-400">
             {status === GeneratorStatus.GENERATING ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
             ) : (
                 <Sparkles className="w-5 h-5" />
             )}
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe a shader..."
            disabled={status === GeneratorStatus.GENERATING}
            className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 text-xs sm:text-sm font-medium py-3 min-w-0"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || status === GeneratorStatus.GENERATING}
            className="p-2.5 rounded-xl bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
      
      {/* Suggestions */}
      <div className="mt-3 flex justify-center gap-2 flex-wrap px-2">
        {[
            "Aurora Borealis",
            "Digital Rain",
            "Hypnotic Spirals",
            "Lava Flow"
        ].map(suggestion => (
            <button
                key={suggestion}
                type="button"
                onClick={() => {
                    setPrompt(suggestion);
                    if(status !== GeneratorStatus.GENERATING) onGenerate(suggestion);
                }}
                className="text-[10px] sm:text-[11px] font-medium text-gray-500 bg-black/40 border border-white/5 hover:border-white/20 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-full transition-colors backdrop-blur-md"
            >
                {suggestion}
            </button>
        ))}
      </div>
    </div>
  );
};

export default AIPanel;