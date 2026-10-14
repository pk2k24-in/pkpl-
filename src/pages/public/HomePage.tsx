import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  Flame, 
  ArrowRight, 
  MapPin, 
  Users, 
  Award, 
  Megaphone,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { MatchCard } from '../../components/cricket/MatchCard';
import { PointsTable } from '../../components/cricket/PointsTable';
import { LiveBadge } from '../../components/common/LiveBadge';

export const HomePage: React.FC = () => {
  const { 
    currentTournament, 
    liveMatches, 
    upcomingMatches, 
    completedMatches, 
    standings, 
    teams, 
    players, 
    announcements 
  } = useCricket();

  // Top batters and bowlers across registered players
  const topBatters = [...players].sort((a, b) => b.stats.runs - a.stats.runs).slice(0, 4);
  const topBowlers = [...players].sort((a, b) => b.stats.wickets - a.stats.wickets).slice(0, 4);

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Tournament Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full text-amber-400 text-xs font-semibold mb-4">
            <Trophy className="w-3.5 h-3.5" />
            <span>OFFICIAL CRICKET TOURNAMENT PORTAL</span>
          </div>

          <h1 className="font-scoreboard text-4xl sm:text-6xl font-bold tracking-wide uppercase text-white leading-tight mb-3">
            PEDDA KANNALI PREMIER LEAGUE
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
            Welcome to PKPL Season 4. Live scores, real-time ball-by-ball commentary, match fixtures, official team rosters, and dynamic points standings. Open for all spectators worldwide with zero registration required.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {liveMatches.length > 0 ? (
              <Link
                to="/live"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-rose-900/40"
              >
                <LiveBadge size="sm" />
                <span>Watch Live Match Scoreboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/fixtures"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
              >
                <span>View Full Match Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/points-table"
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-colors"
            >
              Tournament Standings
            </Link>

            <Link
              to="/about"
              className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              Tournament Rules & Ground Info
            </Link>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div>
            <span className="text-2xl sm:text-3xl font-scoreboard font-bold text-amber-400 block">
              {teams.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Franchise Teams</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-scoreboard font-bold text-white block">
              {upcomingMatches.length + completedMatches.length + liveMatches.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Scheduled Fixtures</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-scoreboard font-bold text-emerald-400 block">
              {players.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Registered Cricketers</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-scoreboard font-bold text-blue-400 block">
              3
            </span>
            <span className="text-xs text-slate-400 font-medium">Cricket Venues</span>
          </div>
        </div>
      </section>

      {/* LIVE MATCH SECTION (If any match is live) OR NEXT MATCH SPOTLIGHT */}
      {liveMatches.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LiveBadge />
              <h2 className="font-bold text-lg text-slate-900 tracking-tight">Live in Pedda Kannali</h2>
            </div>
            <Link to="/live" className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
              <span>All Live Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} featured={true} />
            ))}
          </div>
        </section>
      ) : upcomingMatches.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-base text-slate-900">Next Scheduled Fixture (Opening Match)</h2>
            </div>
            <Link to="/fixtures" className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <span>Full Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="max-w-2xl">
            <MatchCard match={upcomingMatches[0]} featured={true} />
          </div>
        </section>
      ) : null}

      {/* Upcoming Fixtures and Latest Results Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Fixtures */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h2 className="font-bold text-base text-slate-900">Upcoming Fixtures</h2>
            </div>
            <Link to="/fixtures" className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
              No upcoming matches scheduled currently.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.slice(0, 3).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </div>

        {/* Latest Completed Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-base text-slate-900">Recent Match Results</h2>
            </div>
            <Link to="/results" className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <span>Full Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {completedMatches.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-500 space-y-2">
              <Award className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No matches completed yet in Season 4.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Official completed scorecards and final results will appear here as soon as games conclude on the field.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedMatches.slice(0, 3).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Points Table Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-base text-slate-900">Points Table & Net Run Rate</h2>
          </div>
          <Link to="/points-table" className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <span>Detailed Standings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <PointsTable standings={standings} compact={true} />
      </section>

      {/* Top Performers Leaderboard Preview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leading Batters */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                🏏
              </div>
              <h3 className="font-bold text-sm text-slate-900">Top Run Scorers (Orange Cap)</h3>
            </div>
            <Link to="/stats" className="text-xs font-semibold text-amber-700 hover:text-amber-800">
              View All
            </Link>
          </div>

          {topBatters.some((p) => p.stats.runs > 0) ? (
            <div className="space-y-2.5">
              {topBatters.map((p, idx) => {
                const team = teams.find((t) => t.id === p.teamId);
                return (
                  <div key={p.id} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-400 w-4 text-center">{idx + 1}</span>
                      <div>
                        <Link to={`/players/${p.id}`} className="font-semibold text-slate-900 hover:text-amber-600">
                          {p.name}
                        </Link>
                        <span className="text-[11px] text-slate-500 block">{team?.shortName || 'PKPL'} · {p.role}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 text-sm">{p.stats.runs}</span>
                      <span className="text-[11px] text-slate-500 block">SR: {p.stats.strikeRate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 space-y-1">
              <span className="text-slate-400 block font-semibold">Tournament Stats Awaiting Match Play</span>
              <p className="text-[11px] text-slate-400">
                Individual batting leaderboards will track live as deliveries are recorded by field umpires.
              </p>
            </div>
          )}
        </div>

        {/* Leading Bowlers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                ⚡
              </div>
              <h3 className="font-bold text-sm text-slate-900">Top Wicket Takers (Purple Cap)</h3>
            </div>
            <Link to="/stats" className="text-xs font-semibold text-purple-700 hover:text-purple-800">
              View All
            </Link>
          </div>

          {topBowlers.some((p) => p.stats.wickets > 0) ? (
            <div className="space-y-2.5">
              {topBowlers.map((p, idx) => {
                const team = teams.find((t) => t.id === p.teamId);
                return (
                  <div key={p.id} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-400 w-4 text-center">{idx + 1}</span>
                      <div>
                        <Link to={`/players/${p.id}`} className="font-semibold text-slate-900 hover:text-purple-600">
                          {p.name}
                        </Link>
                        <span className="text-[11px] text-slate-500 block">{team?.shortName || 'PKPL'} · {p.bowlingStyle || 'Bowler'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-700 text-sm">{p.stats.wickets} wkts</span>
                      <span className="text-[11px] text-slate-500 block">Econ: {p.stats.economyRate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 space-y-1">
              <span className="text-slate-400 block font-semibold">Tournament Stats Awaiting Match Play</span>
              <p className="text-[11px] text-slate-400">
                Purple Cap bowling leaderboards will update as wickets fall in officiated matches.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-lg text-white">PKPL Official Announcements</h2>
          </div>
          <Link to="/announcements" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
            <span>Read All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.slice(0, 3).map((ann) => (
            <div key={ann.id} className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-amber-400 font-semibold">{ann.category}</span>
                <span>{ann.date}</span>
              </div>
              <h4 className="font-bold text-white text-sm line-clamp-2">{ann.title}</h4>
              <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed">{ann.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
