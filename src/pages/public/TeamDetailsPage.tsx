import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, ChevronLeft, MapPin, Trophy, Shield, Calendar } from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { MatchCard } from '../../components/cricket/MatchCard';

export const TeamDetailsPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { teams, players, matches } = useCricket();

  const team = teams.find((t) => t.id === teamId);
  if (!team) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-sm">
        <p className="mb-4">Team not found in tournament records.</p>
        <Link to="/teams" className="text-amber-600 font-semibold underline">
          Return to Teams List
        </Link>
      </div>
    );
  }

  const teamPlayers = players.filter((p) => p.teamId === team.id && p.isActive);
  const teamMatches = matches.filter((m) => m.team1Id === team.id || m.team2Id === team.id);

  return (
    <div className="space-y-8 pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/teams"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Teams</span>
        </Link>
      </div>

      {/* Team Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0"
              style={{ backgroundColor: team.primaryColor }}
            >
              {team.shortName}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {team.shortName}
                </span>
                <span className="text-xs text-slate-400">Est. {team.establishedYear || 2022}</span>
              </div>
              <h1 className="font-scoreboard text-3xl sm:text-4xl font-bold tracking-wide text-white">
                {team.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">{team.description}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs space-y-1.5 min-w-[200px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Captain:</span>
              <strong className="text-white">{team.captainName}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Home Ground:</span>
              <span className="text-slate-300 font-medium">{team.homeGround}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Squad:</span>
              <span className="text-amber-400 font-bold">{teamPlayers.length} Players</span>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>Official Team Squad ({teamPlayers.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {teamPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    #{player.jerseyNumber || '-'}
                  </span>
                  <Link
                    to={`/players/${player.id}`}
                    className="font-bold text-slate-900 text-sm hover:text-amber-600 transition-colors"
                  >
                    {player.name}
                  </Link>
                </div>
                <div className="text-xs text-slate-500 capitalize">{player.role}</div>
                <div className="text-[11px] text-slate-400">
                  {player.battingStyle || 'Right-hand bat'}
                  {player.bowlingStyle && player.bowlingStyle !== 'None' ? ` · ${player.bowlingStyle}` : ''}
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="font-bold text-slate-900 block">{player.stats.runs} Runs</span>
                <span className="text-slate-500 text-[11px] block">{player.stats.wickets} Wkts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matches Involving This Team */}
      <div className="space-y-4">
        <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <span>Team Fixtures & Matches</span>
        </h2>

        {teamMatches.length === 0 ? (
          <p className="text-xs text-slate-500">No matches scheduled for this team.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
