import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Calendar, ArrowRight, ShieldAlert, Clock } from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { MatchCard } from '../../components/cricket/MatchCard';
import { LiveBadge } from '../../components/common/LiveBadge';
import { DetailedScorecard } from '../../components/cricket/DetailedScorecard';

export const LiveMatchesPage: React.FC = () => {
  const { liveMatches, upcomingMatches } = useCricket();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LiveBadge />
            <h1 className="font-scoreboard text-3xl font-bold tracking-wider uppercase text-white">
              LIVE MATCH CENTER
            </h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Live ball-by-ball cricket updates and real-time scores directly from the field umpires in Pedda Kannali.
          </p>
        </div>
        <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-Time Firestore Listener Active
          </span>
          <span className="text-[11px] text-slate-400">Public spectator access · No login required</span>
        </div>
      </div>

      {/* Live Matches List */}
      {liveMatches.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">No Matches Currently in Progress</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
              There are no live cricket matches being scored at this very moment. Check the upcoming match schedule below or visit recent results.
            </p>
            <Link
              to="/fixtures"
              className="px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 inline-flex items-center gap-1.5 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Browse Tournament Fixtures</span>
            </Link>
          </div>

          {upcomingMatches.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Next Scheduled Fixture</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingMatches.slice(0, 2).map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {liveMatches.map((match) => (
            <div key={match.id} className="space-y-6">
              <DetailedScorecard match={match} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
