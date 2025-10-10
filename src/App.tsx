import { useState, useEffect } from 'react';
import { supabase, WebsiteAnalysis } from './lib/supabase';
import { UrlInput } from './components/UrlInput';
import { ResultsView } from './components/ResultsView';
import { Loader2 } from 'lucide-react';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [error, setError] = useState<string>('');

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const { data: newAnalysis, error: insertError } = await supabase
        .from('website_analyses')
        .insert({ url, status: 'pending' })
        .select()
        .single();

      if (insertError) throw insertError;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-website`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          analysisId: newAnalysis.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const subscription = supabase
        .channel('analysis-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'website_analyses',
            filter: `id=eq.${newAnalysis.id}`,
          },
          (payload) => {
            const updated = payload.new as WebsiteAnalysis;
            if (updated.status === 'completed' || updated.status === 'failed') {
              setAnalysis(updated);
              setIsAnalyzing(false);
              subscription.unsubscribe();
            }
          }
        )
        .subscribe();

      setTimeout(async () => {
        const { data: completedAnalysis } = await supabase
          .from('website_analyses')
          .select()
          .eq('id', newAnalysis.id)
          .single();

        if (completedAnalysis) {
          setAnalysis(completedAnalysis);
          setIsAnalyzing(false);
          subscription.unsubscribe();
        }
      }, 10000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="container mx-auto">
        {!analysis ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <UrlInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 max-w-3xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">Analyzing website...</p>
                  <p className="text-sm text-gray-600 mt-1">
                    This may take up to 30 seconds
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <ResultsView analysis={analysis} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}

export default App;
