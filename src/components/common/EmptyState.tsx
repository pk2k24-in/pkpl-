import React from 'react';
import { Trophy, Calendar, Users, Award, Shield } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'trophy' | 'calendar' | 'users' | 'award' | 'shield';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'trophy',
  title,
  description,
  actionText,
  onAction,
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'calendar':
        return <Calendar className="w-8 h-8 text-slate-400" />;
      case 'users':
        return <Users className="w-8 h-8 text-slate-400" />;
      case 'award':
        return <Award className="w-8 h-8 text-slate-400" />;
      case 'shield':
        return <Shield className="w-8 h-8 text-slate-400" />;
      case 'trophy':
      default:
        return <Trophy className="w-8 h-8 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-slate-200/80 rounded-xl my-4">
      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3">
        {getIcon()}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
