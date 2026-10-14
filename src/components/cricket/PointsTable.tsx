import React from 'react';
import { Trophy, Info } from 'lucide-react';
import { StandingsRow } from '../../types/cricket';

interface PointsTableProps {
  standings: StandingsRow[];
  compact?: boolean;
}

export const PointsTable: React.FC<PointsTableProps> = ({ standings, compact = false }) => {
  if (standings.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs">
        No tournament standings available yet. Matches need to be recorded to calculate points and Net Run Rate.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm tracking-wide">PKPL Season 4 Official Standings</h3>
        </div>
        <span className="text-[11px] text-slate-400">
          {standings.every((r) => r.played === 0) ? 'Season Scheduled · 0 Matches Played' : 'Top 4 qualify for Playoffs'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 text-center w-10">Pos</th>
              <th className="py-2.5 px-4">Team</th>
              <th className="py-2.5 px-2.5 text-center">P</th>
              <th className="py-2.5 px-2.5 text-center">W</th>
              <th className="py-2.5 px-2.5 text-center">L</th>
              <th className="py-2.5 px-2.5 text-center">T</th>
              <th className="py-2.5 px-2.5 text-center">NR</th>
              <th className="py-2.5 px-3 text-center font-bold text-slate-900">PTS</th>
              <th className="py-2.5 px-3 text-right">NRR</th>
              {!compact && (
                <>
                  <th className="py-2.5 px-3 text-right">For</th>
                  <th className="py-2.5 px-3 text-right">Against</th>
                  <th className="py-2.5 px-4 text-center">Recent Form</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {standings.map((row, idx) => {
              const isTop4 = idx < 4;
              const nrrPositive = row.netRunRate > 0;
              const nrrZero = row.netRunRate === 0;

              return (
                <tr
                  key={row.teamId}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isTop4 ? 'bg-amber-50/15' : ''
                  }`}
                >
                  <td className="py-3 px-3 text-center font-bold text-slate-700">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800 font-bold'
                          : isTop4
                          ? 'bg-slate-100 text-slate-800 font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                        style={{ backgroundColor: row.teamColor }}
                      >
                        {row.teamShort}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">
                          {row.teamName}
                        </span>
                        <span className="text-[10px] text-slate-500">{row.teamShort}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2.5 text-center font-medium text-slate-700">{row.played}</td>
                  <td className="py-3 px-2.5 text-center font-bold text-emerald-700">{row.won}</td>
                  <td className="py-3 px-2.5 text-center font-medium text-rose-700">{row.lost}</td>
                  <td className="py-3 px-2.5 text-center text-slate-600">{row.tied}</td>
                  <td className="py-3 px-2.5 text-center text-slate-600">{row.noResult}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900 text-sm bg-slate-50/50">
                    {row.points}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-bold ${
                      nrrPositive
                        ? 'text-emerald-700'
                        : nrrZero
                        ? 'text-slate-600'
                        : 'text-rose-700'
                    }`}
                  >
                    {row.netRunRate > 0 ? `+${row.netRunRate.toFixed(3)}` : row.netRunRate.toFixed(3)}
                  </td>
                  {!compact && (
                    <>
                      <td className="py-3 px-3 text-right text-slate-600 font-mono text-[11px]">
                        {row.runsScored}/{row.oversFaced}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600 font-mono text-[11px]">
                        {row.runsConceded}/{row.oversBowled}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {row.form.length === 0 ? (
                            <span className="text-slate-400 text-[11px]">-</span>
                          ) : (
                            row.form.map((res, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${
                                  res === 'W'
                                    ? 'bg-emerald-600'
                                    : res === 'L'
                                    ? 'bg-rose-600'
                                    : res === 'T'
                                    ? 'bg-amber-600'
                                    : 'bg-slate-400'
                                }`}
                              >
                                {res}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>
            <strong>NRR Calculation:</strong> (Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled). All-out teams count as full 20 overs.
          </span>
        </div>
        <div className="flex items-center gap-3 font-semibold text-slate-700">
          <span>Win: 2 pts</span>
          <span>·</span>
          <span>Tie / NR: 1 pt</span>
          <span>·</span>
          <span>Loss: 0 pts</span>
        </div>
      </div>
    </div>
  );
};
