import React, { useState } from 'react';
import { Calendar, Filter, MapPin, Search } from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { MatchCard } from '../../components/cricket/MatchCard';

export const FixturesPage: React.FC = () => {
  const { matches, teams } = useCricket();
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const scheduledMatches = matches.filter(
    (m) => m.status === 'scheduled' || m.status === 'draft' || m.status === 'lineup_submitted' || m.status === 'ready'
  );

  const filteredMatches = scheduledMatches.filter((m) => {
    const matchesTeam = selectedTeam === 'all' || m.team1Id === selectedTeam || m.team2Id === selectedTeam;
    const matchesSearch =
      m.team1Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.team2Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
        <h1 className="font-scoreboard text-3xl font-bold tracking-wider uppercase text-white mb-1">
          TOURNAMENT FIXTURES & SCHEDULE
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Complete schedule of upcoming matches, match dates, venues, and timings for PKPL Season 4.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams or venues..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-600 shrink-0">Filter Team:</span>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.shortName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fixtures List */}
      {scheduledMatches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Fixtures Scheduled Yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            The tournament schedule will appear here as soon as match fixtures are published by the organizers.
          </p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
          No scheduled fixtures match your search filter criteria. Try clearing the team filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};
