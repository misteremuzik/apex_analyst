import { useState, useEffect } from 'react';
import { supabase, WebsiteAnalysis } from './lib/supabase';
import { ResultsView } from './components/ResultsView';
import { LandingPage } from './components/LandingPage';
import { PricingPage } from './components/PricingPage';
import { Navbar } from './components/Navbar';
import { Loader2 } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isPremium, canAnalyze, user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pricing') === 'true') {
      setShowPricing(true);
    }
    if (params.get('success') === 'true') {
      setError('');
      setShowPricing(false);
    }
  }, []);

  const handleAnalyze = async (url: string) => {
    const { allowed, reason } = canAnalyze();
    if (!allowed) {
      setError(reason || 'Unable to analyze at this time');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const { data: newAnalysis, error: insertError } = await supabase
        .from('website_analyses')
        .insert({ url, status: 'pending', user_id: user?.id })
        .select()
        .single();

      if (insertError) throw insertError;

      if (user) {
        const { data: premiumUser } = await supabase
          .from('premium_users')
          .select('analysis_count')
          .eq('id', user.id)
          .single();

        if (premiumUser) {
          await supabase
            .from('premium_users')
            .update({ analysis_count: (premiumUser.analysis_count || 0) + 1 })
            .eq('id', user.id);
        }
      }

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

      if (isPremium) {
        const visibilityUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-visibility-score`;
        await fetch(visibilityUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            analysisId: newAnalysis.id,
          }),
        }).catch(err => {
          console.error('Visibility score calculation failed:', err);
        });
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
    <div className="min-h-screen bg-white">
      <Navbar onLogoClick={() => {
        handleReset();
        setShowPricing(false);
        window.history.pushState({}, '', '/');
      }} />

      {showPricing ? (
        <PricingPage />
      ) : !analysis && !isAnalyzing ? (
        <LandingPage onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
      ) : (
        <div className="py-12 px-4">
          <div className="container mx-auto">
            {error && (
              <div className="mt-6 border border-gray-200 rounded-lg p-4 max-w-3xl mx-auto">
                <p className="text-sm text-gray-700">{error}</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-black animate-spin" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">Analyzing website...</p>
                  <p className="text-sm text-gray-500 mt-1">
                    This may take up to 30 seconds
                  </p>
                </div>
              </div>
            )}

            {analysis && <ResultsView analysis={analysis} onReset={handleReset} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
