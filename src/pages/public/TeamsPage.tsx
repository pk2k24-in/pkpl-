import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ChevronRight, MapPin, User, Shield } from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';

export const TeamsPage: React.FC = () => {
  const { teams, players, matches } = useCricket();

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
        <h1 className="font-scoreboard text-3xl font-bold tracking-wider uppercase text-white mb-1">
          PKPL FRANCHISE TEAMS
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Discover all approved cricket teams competing for the Pedda Kannali Premier League trophy.
        </p>
      </div>

      {teams.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 space-y-2">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Franchise Teams Registered Yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            Participating teams will appear here once approved by the PKPL Tournament Committee.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const teamPlayers = players.filter((p) => p.teamId === team.id && p.isActive);
            const teamMatches = matches.filter((m) => m.team1Id === team.id || m.team2Id === team.id);

          return (
            <div
              key={team.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Strip with Team Color */}
                <div
                  className="h-3 w-full"
                  style={{ backgroundColor: team.primaryColor }}
                />

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
                      style={{ backgroundColor: team.primaryColor }}
                    >
                      {team.shortName}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {team.name}
                      </h3>
                      <span className="text-xs font-semibold text-slate-500">
                        {team.shortName} Franchise
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {team.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Team Captain:</span>
                      <strong className="text-slate-900">{team.captainName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Home Ground:</span>
                      <span className="text-slate-800 font-medium truncate max-w-[170px] text-right">
                        {team.homeGround || 'Pedda Kannali Stadium'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Active Squad Size:</span>
                      <span className="font-semibold text-slate-900">{teamPlayers.length} Cricketers</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{teamMatches.length} Matches in Season</span>
                <Link
                  to={`/teams/${team.id}`}
                  className="font-semibold text-slate-900 hover:text-amber-600 flex items-center gap-1 transition-colors"
                >
                  <span>Team Squad & Stats</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
