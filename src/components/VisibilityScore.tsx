import { Star, FileText, Sparkles, Globe, Target, FileCheck, Settings, FileSearch, Code, AlertCircle, Bot } from 'lucide-react';

interface VisibilityScoreProps {
  aeoOverallScore: number;
  structuredDataScore: number;
  snippetOptimizationScore: number;
  crawlabilityScore: number;
  featuredSnippetReadyScore: number;
  contentQualityScore: number;
  technicalSeoScore: number;
  pagesAnalyzed: number;
  aeoSchemasCount: number;
  totalIssues: number;
  aiModelAccess: string;
}

export default function VisibilityScore({
  aeoOverallScore,
  structuredDataScore,
  snippetOptimizationScore,
  crawlabilityScore,
  featuredSnippetReadyScore,
  contentQualityScore,
  technicalSeoScore,
  pagesAnalyzed,
  aeoSchemasCount,
  totalIssues,
  aiModelAccess,
}: VisibilityScoreProps) {
  const metrics = [
    {
      icon: Star,
      label: 'Overall AEO Score',
      value: aeoOverallScore.toFixed(2),
      maxValue: null,
      highlighted: true,
    },
    {
      icon: FileText,
      label: 'Structured Data',
      value: structuredDataScore,
      maxValue: 10,
    },
    {
      icon: Sparkles,
      label: 'Snippet Optimization',
      value: snippetOptimizationScore,
      maxValue: 10,
    },
    {
      icon: Globe,
      label: 'Crawlability',
      value: crawlabilityScore,
      maxValue: 10,
    },
    {
      icon: Target,
      label: 'Featured Snippet Ready',
      value: featuredSnippetReadyScore,
      maxValue: 10,
    },
    {
      icon: FileCheck,
      label: 'Content Quality',
      value: contentQualityScore,
      maxValue: 10,
    },
    {
      icon: Settings,
      label: 'Technical SEO',
      value: technicalSeoScore,
      maxValue: 10,
    },
    {
      icon: FileSearch,
      label: 'Pages Analyzed',
      value: pagesAnalyzed,
      maxValue: null,
    },
    {
      icon: Code,
      label: 'AEO Schemas',
      value: aeoSchemasCount,
      maxValue: null,
    },
    {
      icon: AlertCircle,
      label: 'Total Issues',
      value: totalIssues,
      maxValue: null,
      isWarning: true,
    },
    {
      icon: Bot,
      label: 'AI Model Access',
      value: aiModelAccess,
      maxValue: null,
    },
  ];

  const getScoreColor = (value: number, maxValue: number | null) => {
    if (!maxValue) return 'text-gray-900';

    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (value: number, maxValue: number | null) => {
    if (!maxValue) return 'bg-gray-50';

    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return 'bg-green-50';
    if (percentage >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isHighlighted = metric.highlighted;
        const numValue = typeof metric.value === 'number' ? metric.value : 0;
        const scoreColor = metric.isWarning
          ? (numValue > 5 ? 'text-red-600' : numValue > 2 ? 'text-yellow-600' : 'text-green-600')
          : getScoreColor(numValue, metric.maxValue);
        const bgColor = metric.isWarning
          ? (numValue > 5 ? 'bg-red-50' : numValue > 2 ? 'bg-yellow-50' : 'bg-green-50')
          : getScoreBgColor(numValue, metric.maxValue);

        return (
          <div
            key={index}
            className={`${bgColor} rounded-xl p-6 border transition-all hover:shadow-md ${
              isHighlighted
                ? 'border-black md:col-span-2 lg:col-span-1'
                : 'border-gray-200'
            }`}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-lg ${isHighlighted ? 'bg-black' : 'bg-white'}`}>
                <Icon className={`w-6 h-6 ${isHighlighted ? 'text-white' : 'text-gray-600'}`} />
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-gray-600">
                  {metric.label}
                </div>
                <div className={`text-3xl font-bold ${scoreColor}`}>
                  {metric.value}
                  {metric.maxValue && <span className="text-lg">/{metric.maxValue}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
