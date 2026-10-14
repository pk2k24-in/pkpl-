import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Flame, Award, Zap } from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';

export const StatsPage: React.FC = () => {
  const { players, teams } = useCricket();

  const topRunScorers = [...players]
    .filter((p) => p.stats.runs > 0)
    .sort((a, b) => b.stats.runs - a.stats.runs)
    .slice(0, 10);

  const topWicketTakers = [...players]
    .filter((p) => p.stats.wickets > 0)
    .sort((a, b) => b.stats.wickets - a.stats.wickets)
    .slice(0, 10);

  const bestStrikeRates = [...players]
    .filter((p) => p.stats.runs > 50)
    .sort((a, b) => b.stats.strikeRate - a.stats.strikeRate)
    .slice(0, 5);

  const bestEconomyRates = [...players]
    .filter((p) => p.stats.economyRate > 0)
    .sort((a, b) => a.stats.economyRate - b.stats.economyRate)
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
        <h1 className="font-scoreboard text-3xl font-bold tracking-wider uppercase text-white mb-1">
          TOURNAMENT STATISTICS & LEADERBOARD
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          PKPL Season 4 official cricket records: Top Run Getters, Leading Wicket Takers, and Best Strike Rates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orange Cap (Most Runs) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>Orange Cap — Most Runs</span>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider bg-slate-950/10 px-2 py-0.5 rounded">
              Leaderboard
            </span>
          </div>

          {topRunScorers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-1">
              <span className="font-semibold text-slate-700 block">No Match Deliveries Scored Yet</span>
              <p className="text-[11px] text-slate-400">
                The Orange Cap leaderboard will automatically activate once opening fixture deliveries are recorded by official umpires.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3 text-center">Rank</th>
                    <th className="py-2.5 px-4">Player</th>
                    <th className="py-2.5 px-3 text-right">Inns</th>
                    <th className="py-2.5 px-3 text-right font-bold text-slate-900">Runs</th>
                    <th className="py-2.5 px-3 text-right">Avg</th>
                    <th className="py-2.5 px-3 text-right">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topRunScorers.map((p, idx) => {
                    const team = teams.find((t) => t.id === p.teamId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                          {idx === 0 ? '👑 1' : idx + 1}
                        </td>
                        <td className="py-2.5 px-4">
                          <Link to={`/players/${p.id}`} className="font-bold text-slate-900 hover:text-amber-600">
                            {p.name}
                          </Link>
                          <span className="text-[10px] text-slate-500 block">{team?.shortName || '-'}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{p.stats.innings}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 text-sm bg-amber-50/30">
                          {p.stats.runs}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 font-medium">{p.stats.average}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{p.stats.strikeRate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Purple Cap (Most Wickets) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Zap className="w-4 h-4 text-purple-200" />
              <span>Purple Cap — Most Wickets</span>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
              Leaderboard
            </span>
          </div>

          {topWicketTakers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-1">
              <span className="font-semibold text-slate-700 block">No Wickets Taken Yet</span>
              <p className="text-[11px] text-slate-400">
                The Purple Cap leaderboard will rank leading bowlers as wickets fall during officiated matches.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3 text-center">Rank</th>
                    <th className="py-2.5 px-4">Player</th>
                    <th className="py-2.5 px-3 text-right">Inns</th>
                    <th className="py-2.5 px-3 text-right font-bold text-slate-900">Wkts</th>
                    <th className="py-2.5 px-3 text-right">Econ</th>
                    <th className="py-2.5 px-3 text-right">BBI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topWicketTakers.map((p, idx) => {
                    const team = teams.find((t) => t.id === p.teamId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">
                          {idx === 0 ? '👑 1' : idx + 1}
                        </td>
                        <td className="py-2.5 px-4">
                          <Link to={`/players/${p.id}`} className="font-bold text-slate-900 hover:text-purple-600">
                            {p.name}
                          </Link>
                          <span className="text-[10px] text-slate-500 block">{team?.shortName || '-'}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{p.stats.innings}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-purple-700 text-sm bg-purple-50/30">
                          {p.stats.wickets}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 font-medium">{p.stats.economyRate}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{p.stats.bestBowling}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Best Strike Rates & Economy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-3">
            Highest Batting Strike Rates (Min 50 Runs)
          </h3>
          {bestStrikeRates.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Requires a minimum of 50 runs scored in tournament matches.
            </p>
          ) : (
            <div className="space-y-2">
              {bestStrikeRates.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                  <Link to={`/players/${p.id}`} className="font-semibold text-slate-900 hover:text-amber-600">
                    {p.name}
                  </Link>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{p.stats.strikeRate}</span>
                    <span className="text-[11px] text-slate-400 ml-1.5">({p.stats.runs} runs)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-3">
            Best Bowling Economy Rates
          </h3>
          {bestEconomyRates.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Economy rates will compute once overs are completed by bowlers.
            </p>
          ) : (
            <div className="space-y-2">
              {bestEconomyRates.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                  <Link to={`/players/${p.id}`} className="font-semibold text-slate-900 hover:text-purple-600">
                    {p.name}
                  </Link>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700">{p.stats.economyRate} rpo</span>
                    <span className="text-[11px] text-slate-400 ml-1.5">({p.stats.wickets} wkts)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
