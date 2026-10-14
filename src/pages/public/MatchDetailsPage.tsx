import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { DetailedScorecard } from '../../components/cricket/DetailedScorecard';

export const MatchDetailsPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { getMatchById } = useCricket();

  const match = matchId ? getMatchById(matchId) : undefined;

  if (!match) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm max-w-lg mx-auto my-8">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800 text-base mb-1">Match Not Found</h3>
        <p className="text-xs mb-4">The requested match ID does not exist in the tournament records.</p>
        <Link to="/fixtures" className="text-amber-600 font-semibold underline text-xs">
          Browse Tournament Schedule
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Link
          to="/fixtures"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Matches</span>
        </Link>
      </div>

      <DetailedScorecard match={match} />
    </div>
  );
};
