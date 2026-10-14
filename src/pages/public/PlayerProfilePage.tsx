import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, User, Award, Activity, Shield } from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';

export const PlayerProfilePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { players, teams } = useCricket();

  const player = players.find((p) => p.id === playerId);
  if (!player) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm">
        <p className="mb-4">Player not found in tournament records.</p>
        <Link to="/players" className="text-amber-600 font-semibold underline">
          Return to Players Directory
        </Link>
      </div>
    );
  }

  const team = teams.find((t) => t.id === player.teamId);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Link
          to="/players"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Players</span>
        </Link>
      </div>

      {/* Profile Card Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0"
              style={{ backgroundColor: team?.primaryColor || '#1e3a8a' }}
            >
              #{player.jerseyNumber || '-'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {player.role}
                </span>
                {team && (
                  <Link
                    to={`/teams/${team.id}`}
                    className="text-xs text-slate-300 hover:text-white underline font-semibold"
                  >
                    {team.name}
                  </Link>
                )}
              </div>
              <h1 className="font-scoreboard text-3xl sm:text-4xl font-bold tracking-wide text-white">
                {player.name}
              </h1>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>Batting: {player.battingStyle || 'Right-hand bat'}</span>
                <span>·</span>
                <span>Bowling: {player.bowlingStyle || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batting Career Statistics */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
          Batting & Fielding Record
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase block font-semibold">Matches</span>
            <strong className="text-lg text-slate-900">{player.stats.matches}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase block font-semibold">Innings</span>
            <strong className="text-lg text-slate-900">{player.stats.innings}</strong>
          </div>
          <div className="p-3 bg-amber-50/50 rounded-lg">
            <span className="text-[11px] text-amber-800 uppercase block font-semibold">Total Runs</span>
            <strong className="text-xl text-amber-600">{player.stats.runs}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase block font-semibold">Highest</span>
            <strong className="text-lg text-slate-900">{player.stats.highestScore}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase block font-semibold">Average</span>
            <strong className="text-lg text-slate-900">{player.stats.average}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase block font-semibold">Strike Rate</span>
            <strong className="text-lg text-slate-900">{player.stats.strikeRate}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase block font-semibold">50s / 100s</span>
            <strong className="text-lg text-slate-900">{player.stats.fifties} / {player.stats.hundreds}</strong>
          </div>
        </div>
      </div>

      {/* Bowling Career Statistics */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
          Bowling Record
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 text-center">
          <div className="p-3 bg-purple-50/50 rounded-lg">
            <span className="text-[11px] text-purple-800 uppercase block font-semibold">Wickets</span>
            <strong className="text-xl text-purple-700">{player.stats.wickets}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase block font-semibold">Best Bowling</span>
            <strong className="text-lg text-slate-900">{player.stats.bestBowling}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase block font-semibold">Bowling Avg</span>
            <strong className="text-lg text-slate-900">{player.stats.bowlingAverage || '-'}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase block font-semibold">Economy Rate</span>
            <strong className="text-lg text-slate-900">{player.stats.economyRate || '-'}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase block font-semibold">Catches</span>
            <strong className="text-lg text-slate-900">{player.stats.catches}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 uppercase block font-semibold">Stumpings</span>
            <strong className="text-lg text-slate-900">{player.stats.stumpings}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
