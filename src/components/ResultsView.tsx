import { Database, Smartphone, Eye, FileText, Server, Shield, ArrowLeft } from 'lucide-react';
import { WebsiteAnalysis } from '../lib/supabase';
import { ScoreCard } from './ScoreCard';
import { RecommendationsList } from './RecommendationsList';
import { ChatAssistant } from './ChatAssistant';
import { ConsultationAd } from './ConsultationAd';
import { PremiumFeatureGate } from './PremiumFeatureGate';
import { PerformanceMetrics } from './PerformanceMetrics';

interface ResultsViewProps {
  analysis: WebsiteAnalysis;
  onReset: () => void;
}

export function ResultsView({ analysis, onReset }: ResultsViewProps) {
  const getOverallLabel = (score: number) => {
    if (score >= 80) return 'Excellent AI Readiness';
    if (score >= 60) return 'Good AI Readiness';
    if (score >= 30) return 'Needs Improvement';
    return 'Critical Issues Found';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Analyze another website
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Results</h2>
            <p className="text-sm text-gray-600 break-all">{analysis.url}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
          <div className="inline-block">
            <div className="text-6xl font-bold text-black mb-2">
              {analysis.overall_score}
            </div>
            <div className="text-sm text-gray-500 mb-4">Overall Score</div>
            <div className="text-lg font-medium text-gray-700">
              {getOverallLabel(analysis.overall_score)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ScoreCard
          title="Structured Data"
          score={analysis.structured_data_score}
          details={analysis.structured_data_details}
          icon={<Database className="w-5 h-5" />}
          findings={analysis.structured_data_details.findings || []}
        />
        <ScoreCard
          title="Mobile-Friendly"
          score={analysis.mobile_friendly_score}
          details={analysis.mobile_friendly_details}
          icon={<Smartphone className="w-5 h-5" />}
          findings={analysis.mobile_friendly_details.findings || []}
        />
        <ScoreCard
          title="Accessibility"
          score={analysis.accessibility_score}
          details={analysis.accessibility_details}
          icon={<Eye className="w-5 h-5" />}
          findings={analysis.accessibility_details.findings || []}
        />
        <ScoreCard
          title="Content Quality"
          score={analysis.content_quality_score}
          details={analysis.content_quality_details}
          icon={<FileText className="w-5 h-5" />}
          findings={analysis.content_quality_details.findings || []}
        />
        <ScoreCard
          title="Technical SEO"
          score={analysis.technical_seo_score}
          details={analysis.technical_seo_details}
          icon={<Server className="w-5 h-5" />}
          findings={analysis.technical_seo_details.findings || []}
        />
        <ScoreCard
          title="Privacy Compliance"
          score={analysis.privacy_score}
          details={analysis.privacy_details}
          icon={<Shield className="w-5 h-5" />}
          findings={analysis.privacy_details.findings || []}
        />
      </div>

      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <RecommendationsList recommendations={analysis.recommendations} />
      )}

      <PremiumFeatureGate
        feature="performance_metrics"
        requiredTier="starter"
        featureName="Performance Metrics"
        description="Deep dive into your website's loading speed, Core Web Vitals, and performance scores with Google PageSpeed Insights"
      >
        <PerformanceMetrics
          analysisId={analysis.id}
          url={analysis.url}
          performanceScore={analysis.performance_score}
          performanceMetrics={analysis.performance_metrics}
        />
      </PremiumFeatureGate>

      <PremiumFeatureGate
        feature="ai_chat"
        requiredTier="professional"
        featureName="AI Assistant"
        description="Get instant answers about your analysis and personalized improvement strategies from our AI expert"
      >
        <ChatAssistant analysisId={analysis.id} />
      </PremiumFeatureGate>

      <ConsultationAd analysis={analysis} />
    </div>
  );
}
