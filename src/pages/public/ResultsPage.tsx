import React from 'react';
import { Award, Trophy } from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { MatchCard } from '../../components/cricket/MatchCard';

export const ResultsPage: React.FC = () => {
  const { completedMatches } = useCricket();

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
        <h1 className="font-scoreboard text-3xl font-bold tracking-wider uppercase text-white mb-1">
          MATCH RESULTS & ARCHIVES
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Official completed scorecards, winning margins, and Player of the Match awards.
        </p>
      </div>

      {completedMatches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2 max-w-lg mx-auto">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Matches Completed Yet</h3>
          <p className="text-slate-400 leading-relaxed">
            PKPL Season 4 matches have not concluded yet. Official verified scorecards, winning margins, and Player of the Match awards will appear here once games finish.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};
