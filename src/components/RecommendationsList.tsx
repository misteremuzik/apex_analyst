import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          label: 'Critical',
          labelColor: 'bg-red-100 text-red-700',
        };
      case 'high':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-orange-50 border-orange-200',
          iconColor: 'text-orange-600',
          label: 'High',
          labelColor: 'bg-orange-100 text-orange-700',
        };
      case 'medium':
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-yellow-50 border-yellow-200',
          iconColor: 'text-yellow-600',
          label: 'Medium',
          labelColor: 'bg-yellow-100 text-yellow-700',
        };
      default:
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          label: 'Low',
          labelColor: 'bg-green-100 text-green-700',
        };
    }
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h2>
      <p className="text-sm text-gray-600 mb-6">
        Priority-ordered improvements to enhance your website's AI readiness
      </p>

      <div className="space-y-4">
        {sortedRecommendations.map((rec, index) => {
          const config = getPriorityConfig(rec.priority);
          return (
            <div
              key={index}
              className={`border rounded-lg p-4 ${config.bgColor} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start gap-4">
                <div className={config.iconColor}>{config.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${config.labelColor}`}>
                      {config.label} Priority
                    </span>
                    <span className="text-xs font-medium text-gray-600">{rec.category}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{rec.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
