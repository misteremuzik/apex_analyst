interface ScoreCardProps {
  title: string;
  score: number;
  details: Record<string, any>;
  icon: React.ReactNode;
  findings?: string[];
}

export function ScoreCard({ title, score, details, icon, findings = [] }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-black';
    if (score >= 60) return 'text-gray-700';
    if (score >= 30) return 'text-gray-700';
    return 'text-gray-700';
  };

  const getScoreBgColor = (score: number) => {
    return 'bg-gray-50 border-gray-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 30) return 'Needs Work';
    return 'Critical';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getScoreBgColor(score)} text-gray-600`}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              {getScoreLabel(score)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-black">
            {score}
          </div>
          <div className="text-xs text-gray-400">/ 100</div>
        </div>
      </div>

      {findings.length > 0 && (
        <div className="space-y-2">
          {findings.map((finding, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-gray-500">
              <span className="text-gray-300 mt-0.5">•</span>
              <span>{finding}</span>
            </div>
          ))}
        </div>
      )}

      {Object.keys(details).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(details).slice(0, 4).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="font-medium text-gray-600">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
