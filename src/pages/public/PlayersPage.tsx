import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, User, ChevronRight } from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { PlayerRole } from '../../types/cricket';

export const PlayersPage: React.FC = () => {
  const { players, teams } = useCricket();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activePlayers = players.filter((p) => p.isActive);

  const filteredPlayers = activePlayers.filter((p) => {
    const matchesRole = selectedRole === 'all' || p.role === selectedRole;
    const matchesTeam = selectedTeam === 'all' || p.teamId === selectedTeam;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesTeam && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
        <h1 className="font-scoreboard text-3xl font-bold tracking-wider uppercase text-white mb-1">
          TOURNAMENT PLAYERS DIRECTORY
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Browse profiles, stats, batting styles, and bowling figures of all registered PKPL cricketers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by player name..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Roles</option>
            <option value="batter">Batters</option>
            <option value="bowler">Bowlers</option>
            <option value="all-rounder">All-Rounders</option>
            <option value="wicketkeeper-batter">Wicketkeepers</option>
          </select>

          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.shortName} - {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
          No players match your search filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => {
            const team = teams.find((t) => t.id === player.teamId);
            return (
              <div
                key={player.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-700">
                      #{player.jerseyNumber || '-'}
                    </span>
                    {team && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: team.primaryColor }}
                      >
                        {team.shortName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">
                    {player.name}
                  </h3>
                  <div className="text-xs text-amber-700 font-medium capitalize mb-2">
                    {player.role}
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>Bat: {player.battingStyle || 'Right-hand'}</div>
                    <div>Bowl: {player.bowlingStyle || 'None'}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{player.stats.runs}</span>
                    <span className="text-[10px] text-slate-500 ml-1">runs</span>
                    <span className="text-slate-300 mx-1">·</span>
                    <span className="font-bold text-purple-700">{player.stats.wickets}</span>
                    <span className="text-[10px] text-slate-500 ml-1">wkts</span>
                  </div>
                  <Link
                    to={`/players/${player.id}`}
                    className="font-semibold text-slate-800 hover:text-amber-600 transition-colors"
                  >
                    Profile →
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
