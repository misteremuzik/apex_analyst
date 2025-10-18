import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
}

export function UrlInput({ onAnalyze, isAnalyzing }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      const urlObj = new URL(url.trim());
      if (!urlObj.protocol.startsWith('http')) {
        throw new Error('Invalid protocol');
      }
      onAnalyze(url.trim());
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-normal text-black mb-4">Search With Apex Analyst</h1>
        <p className="text-xl text-gray-500">Analyze your website for AI search compatibility</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your website URL (e.g. https://yourdomain.com)"
            disabled={isAnalyzing}
            className="w-full px-6 py-4 text-gray-600 border border-gray-300 rounded-full focus:outline-none focus:border-gray-400 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          {error && (
            <p className="mt-2 text-sm text-gray-600 text-center">{error}</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="bg-black text-white font-medium py-3 px-12 rounded-full hover:bg-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
