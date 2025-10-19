import { useState } from 'react';
import { Gauge, TrendingUp, Zap, Clock, Layout, Eye, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PerformanceMetricsProps {
  analysisId: string;
  url: string;
  performanceScore?: number;
  performanceMetrics?: any;
}

export function PerformanceMetrics({
  analysisId,
  url,
  performanceMetrics: initialMetrics
}: PerformanceMetricsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState(initialMetrics || null);
  const { session } = useAuth();

  const analyzePerformance = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-performance`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          analysisId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to analyze performance: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMetrics(data.performanceMetrics);
    } catch (err) {
      console.error('Performance analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze performance');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const hasValidMetrics = metrics && metrics.categories && metrics.lcp && metrics.fcp && metrics.cls;

  if (!hasValidMetrics && !isAnalyzing) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <Gauge className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Performance Metrics</h3>
            <p className="text-sm text-gray-600 mb-4">
              Analyze your website's loading speed, Core Web Vitals, and overall performance using Google PageSpeed Insights.
            </p>
            <button
              onClick={analyzePerformance}
              className="bg-black text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Run Performance Analysis
            </button>
            {error && (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">Analyzing Performance...</p>
            <p className="text-sm text-gray-500 mt-1">
              This may take up to 30 seconds
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <Gauge className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-900 mb-1">Performance Metrics</h3>
            <p className="text-sm text-gray-600">Powered by Google PageSpeed Insights</p>
          </div>
        </div>
        <button
          onClick={analyzePerformance}
          disabled={isAnalyzing}
          className="text-sm text-gray-600 hover:text-black transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-lg border p-4 ${getScoreBgColor(metrics.categories.performance)}`}>
          <div className="flex items-center justify-between mb-2">
            <Zap className={`w-5 h-5 ${getScoreColor(metrics.categories.performance)}`} />
            <span className={`text-2xl font-bold ${getScoreColor(metrics.categories.performance)}`}>
              {metrics.categories.performance}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900 mb-1">Performance</div>
          <div className="text-xs text-gray-600">{getScoreLabel(metrics.categories.performance)}</div>
        </div>

        <div className={`rounded-lg border p-4 ${getScoreBgColor(metrics.categories.accessibility)}`}>
          <div className="flex items-center justify-between mb-2">
            <Eye className={`w-5 h-5 ${getScoreColor(metrics.categories.accessibility)}`} />
            <span className={`text-2xl font-bold ${getScoreColor(metrics.categories.accessibility)}`}>
              {metrics.categories.accessibility}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900 mb-1">Accessibility</div>
          <div className="text-xs text-gray-600">{getScoreLabel(metrics.categories.accessibility)}</div>
        </div>

        <div className={`rounded-lg border p-4 ${getScoreBgColor(metrics.categories.bestPractices)}`}>
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className={`w-5 h-5 ${getScoreColor(metrics.categories.bestPractices)}`} />
            <span className={`text-2xl font-bold ${getScoreColor(metrics.categories.bestPractices)}`}>
              {metrics.categories.bestPractices}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900 mb-1">Best Practices</div>
          <div className="text-xs text-gray-600">{getScoreLabel(metrics.categories.bestPractices)}</div>
        </div>

        <div className={`rounded-lg border p-4 ${getScoreBgColor(metrics.categories.seo)}`}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className={`w-5 h-5 ${getScoreColor(metrics.categories.seo)}`} />
            <span className={`text-2xl font-bold ${getScoreColor(metrics.categories.seo)}`}>
              {metrics.categories.seo}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900 mb-1">SEO</div>
          <div className="text-xs text-gray-600">{getScoreLabel(metrics.categories.seo)}</div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Core Web Vitals</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className={`text-sm font-medium ${getScoreColor(metrics.lcp.score)}`}>
                {metrics.lcp.score}/100
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              Largest Contentful Paint
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.lcp.displayValue}
            </div>
            <div className="text-xs text-gray-600">
              Measures loading performance
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <Zap className="w-5 h-5 text-gray-600" />
              <span className={`text-sm font-medium ${getScoreColor(metrics.fcp.score)}`}>
                {metrics.fcp.score}/100
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              First Contentful Paint
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.fcp.displayValue}
            </div>
            <div className="text-xs text-gray-600">
              First visible content
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <Layout className="w-5 h-5 text-gray-600" />
              <span className={`text-sm font-medium ${getScoreColor(metrics.cls.score)}`}>
                {metrics.cls.score}/100
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              Cumulative Layout Shift
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.cls.displayValue}
            </div>
            <div className="text-xs text-gray-600">
              Visual stability metric
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600">Speed Index</div>
            <div className="text-sm font-medium text-gray-900">{metrics.speedIndex.displayValue}</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600">Time to Interactive</div>
            <div className="text-sm font-medium text-gray-900">{metrics.tti.displayValue}</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600">Total Blocking Time</div>
            <div className="text-sm font-medium text-gray-900">{metrics.tbt.displayValue}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
