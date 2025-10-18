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
          bgColor: 'bg-gray-50 border-gray-300',
          iconColor: 'text-gray-700',
          label: 'Critical',
          labelColor: 'bg-black text-white',
        };
      case 'high':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-gray-50 border-gray-300',
          iconColor: 'text-gray-700',
          label: 'High',
          labelColor: 'bg-gray-800 text-white',
        };
      case 'medium':
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-gray-50 border-gray-300',
          iconColor: 'text-gray-700',
          label: 'Medium',
          labelColor: 'bg-gray-600 text-white',
        };
      default:
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-gray-50 border-gray-300',
          iconColor: 'text-gray-700',
          label: 'Low',
          labelColor: 'bg-gray-400 text-white',
        };
    }
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-medium text-gray-900 mb-4">Recommendations</h2>
      <p className="text-sm text-gray-500 mb-6">
        Priority-ordered improvements to enhance your website's AI readiness
      </p>

      <div className="space-y-4">
        {sortedRecommendations.map((rec, index) => {
          const config = getPriorityConfig(rec.priority);
          return (
            <div
              key={index}
              className={`border rounded-lg p-4 ${config.bgColor} transition-all hover:border-gray-400`}
            >
              <div className="flex items-start gap-4">
                <div className={config.iconColor}>{config.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${config.labelColor}`}>
                      {config.label}
                    </span>
                    <span className="text-xs font-medium text-gray-500">{rec.category}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{rec.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
