import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight, Trophy, Clock } from 'lucide-react';
import { Match } from '../../types/cricket';
import { LiveBadge } from '../common/LiveBadge';
import { formatOvers } from '../../utils/cricketRules';

interface MatchCardProps {
  match: Match;
  featured?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, featured = false }) => {
  const isLive = match.status === 'live' || match.status === 'innings_break';
  const isCompleted = match.status === 'completed';

  // Compute chase equation if 2nd innings live
  let chaseEquation = '';
  if (isLive && match.currentInningsNumber === 2 && match.innings2 && match.innings2.target) {
    const runsNeeded = match.innings2.target - match.innings2.totalRuns;
    const totalBalls = match.overs * 6;
    const ballsDone = match.innings2.overs * 6 + match.innings2.balls;
    const ballsRemaining = Math.max(0, totalBalls - ballsDone);

    if (runsNeeded <= 0) {
      chaseEquation = `${match.innings2.battingTeamName} target achieved!`;
    } else {
      chaseEquation = `${match.innings2.battingTeamName} need ${runsNeeded} run${runsNeeded === 1 ? '' : 's'} in ${ballsRemaining} ball${ballsRemaining === 1 ? '' : 's'}`;
    }
  }

  return (
    <div
      className={`bg-white border rounded-xl shadow-xs transition-all hover:shadow-md ${
        featured ? 'border-amber-400/80 ring-1 ring-amber-400/30' : 'border-slate-200'
      }`}
    >
      {/* Top Header: Match #, Status, Format */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50/70 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Match #{match.matchNumber}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-medium">{match.format} ({match.overs} Ov)</span>
        </div>
        <div>
          {isLive ? (
            <LiveBadge size="sm" />
          ) : isCompleted ? (
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
              Completed
            </span>
          ) : (
            <span className="font-medium text-slate-600 flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{match.date} · {match.time}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Content: Teams & Scores */}
      <div className="p-4 space-y-3">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
              style={{ backgroundColor: match.team1Color }}
            >
              {match.team1Short}
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-sm block leading-tight">
                {match.team1Name}
              </span>
              {match.toss && match.toss.winnerTeamId === match.team1Id && (
                <span className="text-[10px] text-slate-500">
                  Toss winner (elected to {match.toss.decision})
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            {match.innings1 && match.innings1.battingTeamId === match.team1Id ? (
              <div>
                <span className="font-scoreboard text-2xl font-bold text-slate-900">
                  {match.innings1.totalRuns}/{match.innings1.wickets}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                  ({formatOvers(match.innings1.overs, match.innings1.balls)} ov)
                </span>
              </div>
            ) : match.innings2 && match.innings2.battingTeamId === match.team1Id ? (
              <div>
                <span className="font-scoreboard text-2xl font-bold text-slate-900">
                  {match.innings2.totalRuns}/{match.innings2.wickets}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                  ({formatOvers(match.innings2.overs, match.innings2.balls)} ov)
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Yet to bat</span>
            )}
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
              style={{ backgroundColor: match.team2Color }}
            >
              {match.team2Short}
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-sm block leading-tight">
                {match.team2Name}
              </span>
              {match.toss && match.toss.winnerTeamId === match.team2Id && (
                <span className="text-[10px] text-slate-500">
                  Toss winner (elected to {match.toss.decision})
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            {match.innings1 && match.innings1.battingTeamId === match.team2Id ? (
              <div>
                <span className="font-scoreboard text-2xl font-bold text-slate-900">
                  {match.innings1.totalRuns}/{match.innings1.wickets}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                  ({formatOvers(match.innings1.overs, match.innings1.balls)} ov)
                </span>
              </div>
            ) : match.innings2 && match.innings2.battingTeamId === match.team2Id ? (
              <div>
                <span className="font-scoreboard text-2xl font-bold text-slate-900">
                  {match.innings2.totalRuns}/{match.innings2.wickets}
                </span>
                <span className="text-xs text-slate-500 ml-1.5 font-medium">
                  ({formatOvers(match.innings2.overs, match.innings2.balls)} ov)
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Yet to bat</span>
            )}
          </div>
        </div>

        {/* Chase status equation or Match Result */}
        {chaseEquation && (
          <div className="p-2 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs font-semibold text-amber-900 text-center">
            {chaseEquation}
          </div>
        )}

        {isCompleted && match.resultString && (
          <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-semibold text-emerald-800 text-center flex items-center justify-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>{match.resultString}</span>
          </div>
        )}

        {/* Venue & Umpire */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-[260px]">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{match.venue}</span>
          </div>
          <span>Umpire: {match.umpireName.split(' ')[0]}</span>
        </div>
      </div>

      {/* Footer Link */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/40 rounded-b-xl flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {isLive ? 'Live Ball-by-Ball Feed' : isCompleted ? 'Full Match Scorecard' : 'Match Preview & Squads'}
        </span>
        <Link
          to={`/match/${match.id}`}
          className="font-semibold text-slate-900 hover:text-amber-600 flex items-center gap-0.5 transition-colors"
        >
          <span>View Scorecard</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
