import React, { useState } from 'react';
import { Trophy, Clock, MapPin, User, Activity, AlertCircle } from 'lucide-react';
import { Match, InningsData } from '../../types/cricket';
import { LiveBadge } from '../common/LiveBadge';
import { formatOvers } from '../../utils/cricketRules';
import { useCricket } from '../../context/CricketDataContext';

interface DetailedScorecardProps {
  match: Match;
}

export const DetailedScorecard: React.FC<DetailedScorecardProps> = ({ match }) => {
  const { getDeliveriesForMatch } = useCricket();
  const [activeTab, setActiveTab] = useState<'inn1' | 'inn2' | 'commentary' | 'info'>(
    match.currentInningsNumber === 2 && match.innings2 ? 'inn2' : 'inn1'
  );

  const inn1 = match.innings1;
  const inn2 = match.innings2;
  const isLive = match.status === 'live' || match.status === 'innings_break';
  const isCompleted = match.status === 'completed';
  const allDeliveries = getDeliveriesForMatch(match.id);

  const renderInningsTable = (innings?: InningsData) => {
    if (!innings) {
      return (
        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl my-4 text-sm text-slate-500">
          Innings has not commenced yet.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Batting Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">{innings.battingTeamName} Batting</span>
              <span className="text-slate-400 text-xs">({innings.inningsNumber === 1 ? '1st Innings' : '2nd Innings'})</span>
            </div>
            <div className="text-right">
              <span className="font-scoreboard text-2xl font-bold text-amber-400">
                {innings.totalRuns}/{innings.wickets}
              </span>
              <span className="text-xs text-slate-300 ml-2 font-medium">
                ({formatOvers(innings.overs, innings.balls)} Ov) · CRR: {innings.currentRunRate}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Batter</th>
                  <th className="py-2.5 px-4">Dismissal</th>
                  <th className="py-2.5 px-3 text-right">R</th>
                  <th className="py-2.5 px-3 text-right">B</th>
                  <th className="py-2.5 px-3 text-right">4s</th>
                  <th className="py-2.5 px-3 text-right">6s</th>
                  <th className="py-2.5 px-3 text-right">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {innings.batters.map((b) => (
                  <tr key={b.playerId} className={`hover:bg-slate-50/80 ${b.isBatting ? 'bg-amber-50/30' : ''}`}>
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{b.name}</span>
                      {b.isBatting && (
                        <span className="text-emerald-600 font-bold text-[10px]">
                          {b.isStriker ? '★ (striker)' : '•'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {b.isBatting ? (
                        <span className="text-emerald-700 font-medium">not out</span>
                      ) : b.dismissal ? (
                        <span>
                          {b.dismissal.type}
                          {b.dismissal.fielderName ? ` c ${b.dismissal.fielderName}` : ''}
                          {b.dismissal.bowlerName ? ` b ${b.dismissal.bowlerName}` : ''}
                        </span>
                      ) : (
                        <span>dismissed</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 text-sm">{b.runs}</td>
                    <td className="py-3 px-3 text-right text-slate-600">{b.ballsFaced}</td>
                    <td className="py-3 px-3 text-right text-slate-600">{b.fours}</td>
                    <td className="py-3 px-3 text-right text-slate-600">{b.sixes}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{b.strikeRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Extras and Total Footer */}
          <div className="bg-slate-50/70 border-t border-slate-200 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold text-slate-700">Extras:</span>
              <span>
                <strong className="text-slate-900">{innings.extras.total}</strong> (w {innings.extras.wides}, nb {innings.extras.noBalls}, b {innings.extras.byes}, lb {innings.extras.legByes})
              </span>
            </div>
            <div className="flex items-center justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200/60">
              <span>Total:</span>
              <span>
                {innings.totalRuns}/{innings.wickets} ({formatOvers(innings.overs, innings.balls)} Overs, RR {innings.currentRunRate})
              </span>
            </div>
          </div>
        </div>

        {/* Fall of Wickets */}
        {innings.fallOfWickets.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">Fall of Wickets</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {innings.fallOfWickets.map((fow) => (
                <div key={fow.wicketNumber} className="bg-slate-100 px-2.5 py-1 rounded text-slate-700">
                  <span className="font-bold text-slate-900">{fow.score}-{fow.wicketNumber}</span>{' '}
                  <span className="text-slate-500 text-[11px]">({fow.playerOutName}, {fow.overs} ov)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bowling Card */}
        {innings.bowlers.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-800 text-white flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide">{innings.bowlingTeamName} Bowling</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Bowler</th>
                    <th className="py-2.5 px-3 text-right">O</th>
                    <th className="py-2.5 px-3 text-right">M</th>
                    <th className="py-2.5 px-3 text-right">R</th>
                    <th className="py-2.5 px-3 text-right">W</th>
                    <th className="py-2.5 px-3 text-right">Econ</th>
                    <th className="py-2.5 px-3 text-right">Dots</th>
                    <th className="py-2.5 px-3 text-right">WD</th>
                    <th className="py-2.5 px-3 text-right">NB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {innings.bowlers.map((bw) => (
                    <tr key={bw.playerId} className={`hover:bg-slate-50/80 ${bw.isCurrentBowler ? 'bg-amber-50/30' : ''}`}>
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{bw.name}</span>
                        {bw.isCurrentBowler && (
                          <span className="text-amber-600 font-bold text-[10px]">★ bowling</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-800 font-medium">
                        {formatOvers(bw.overs, bw.balls)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">{bw.maidens}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">{bw.runsConceded}</td>
                      <td className="py-3 px-3 text-right font-bold text-rose-600 text-sm">{bw.wickets}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">{bw.economyRate}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{bw.dots}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{bw.wides}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{bw.noBalls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Match Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400 uppercase tracking-wider">PKPL Match #{match.matchNumber}</span>
            <span>·</span>
            <span>{match.format} ({match.overs} Overs)</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{match.venue}</span>
            </span>
          </div>
          <div>
            {isLive ? <LiveBadge /> : isCompleted ? <span className="text-emerald-400 font-semibold">Completed</span> : <span className="text-slate-300">Scheduled</span>}
          </div>
        </div>

        {/* Big Score Displays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Team 1 */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm"
                style={{ backgroundColor: match.team1Color, color: '#fff' }}
              >
                {match.team1Short}
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">{match.team1Name}</h3>
                <span className="text-xs text-slate-400">
                  {match.toss?.winnerTeamId === match.team1Id ? `Toss winner (${match.toss.decision})` : ''}
                </span>
              </div>
            </div>
            <div className="text-right">
              {match.innings1 && match.innings1.battingTeamId === match.team1Id ? (
                <div>
                  <span className="font-scoreboard text-3xl font-bold text-amber-400">
                    {match.innings1.totalRuns}/{match.innings1.wickets}
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5">
                    ({formatOvers(match.innings1.overs, match.innings1.balls)} ov)
                  </span>
                </div>
              ) : match.innings2 && match.innings2.battingTeamId === match.team1Id ? (
                <div>
                  <span className="font-scoreboard text-3xl font-bold text-amber-400">
                    {match.innings2.totalRuns}/{match.innings2.wickets}
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5">
                    ({formatOvers(match.innings2.overs, match.innings2.balls)} ov)
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">Yet to bat</span>
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm"
                style={{ backgroundColor: match.team2Color, color: '#fff' }}
              >
                {match.team2Short}
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">{match.team2Name}</h3>
                <span className="text-xs text-slate-400">
                  {match.toss?.winnerTeamId === match.team2Id ? `Toss winner (${match.toss.decision})` : ''}
                </span>
              </div>
            </div>
            <div className="text-right">
              {match.innings1 && match.innings1.battingTeamId === match.team2Id ? (
                <div>
                  <span className="font-scoreboard text-3xl font-bold text-amber-400">
                    {match.innings1.totalRuns}/{match.innings1.wickets}
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5">
                    ({formatOvers(match.innings1.overs, match.innings1.balls)} ov)
                  </span>
                </div>
              ) : match.innings2 && match.innings2.battingTeamId === match.team2Id ? (
                <div>
                  <span className="font-scoreboard text-3xl font-bold text-amber-400">
                    {match.innings2.totalRuns}/{match.innings2.wickets}
                  </span>
                  <span className="text-xs text-slate-400 ml-1.5">
                    ({formatOvers(match.innings2.overs, match.innings2.balls)} ov)
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">Yet to bat</span>
              )}
            </div>
          </div>
        </div>

        {/* Live Equation or Result String */}
        {isLive && match.currentInningsNumber === 2 && match.innings2?.target && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
            <p className="text-amber-300 font-bold text-sm">
              Target: {match.innings2.target} · Need {match.innings2.target - match.innings2.totalRuns} runs in{' '}
              {Math.max(0, match.overs * 6 - (match.innings2.overs * 6 + match.innings2.balls))} balls (Req RR:{' '}
              {match.innings2.requiredRunRate || 'N/A'})
            </p>
          </div>
        )}

        {isCompleted && match.resultString && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-center flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-emerald-300 font-bold text-sm">{match.resultString}</span>
          </div>
        )}

        {/* Toss & Umpire bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            {match.toss ? (
              <span>
                <strong>Toss:</strong> {match.toss.winnerTeamName} won the toss and elected to {match.toss.decision} first.
              </span>
            ) : (
              <span>Toss not yet recorded.</span>
            )}
          </div>
          <div>
            <span><strong>Umpire:</strong> {match.umpireName}</span>
          </div>
        </div>
      </div>

      {/* Player of the Match Showcase */}
      {match.playerOfTheMatch && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              Player of the Match
            </span>
            <h4 className="font-bold text-slate-900 text-base mt-0.5">{match.playerOfTheMatch.name}</h4>
            <p className="text-xs text-slate-600 font-medium">
              {match.playerOfTheMatch.teamName} · {match.playerOfTheMatch.performanceText}
            </p>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('inn1')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'inn1'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          1st Innings: {inn1 ? inn1.battingTeamName : match.team1Short}
        </button>

        <button
          onClick={() => setActiveTab('inn2')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'inn2'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          2nd Innings: {inn2 ? inn2.battingTeamName : match.team2Short}
        </button>

        <button
          onClick={() => setActiveTab('commentary')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'commentary'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Ball-by-Ball Feed ({allDeliveries.length})
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'info'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Match Info
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'inn1' && renderInningsTable(inn1)}
      {activeTab === 'inn2' && renderInningsTable(inn2)}

      {/* Ball by Ball Commentary Feed */}
      {activeTab === 'commentary' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <h4 className="font-bold text-sm text-slate-900 mb-2">Live Delivery Commentary</h4>
          {allDeliveries.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No deliveries recorded yet.</p>
          ) : (
            <div className="space-y-3 divide-y divide-slate-100">
              {allDeliveries.map((del) => (
                <div key={del.id} className="pt-3 first:pt-0 flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                      del.isWicket
                        ? 'bg-rose-600 text-white'
                        : del.batterRuns === 6
                        ? 'bg-purple-600 text-white'
                        : del.batterRuns === 4
                        ? 'bg-blue-600 text-white'
                        : del.extraType
                        ? 'bg-amber-100 text-amber-800'
                        : del.batterRuns === 0
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {del.isWicket ? 'W' : del.extraType ? (del.extraType === 'wide' ? 'WD' : 'NB') : del.batterRuns}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-0.5">
                      <span className="font-semibold text-slate-700">
                        Over {del.overNumber}.{del.ballInOver} · Innings {del.inningsNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(del.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed">{del.commentary}</p>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Bowler: <span className="font-semibold">{del.bowlerName}</span> to <span className="font-semibold">{del.strikerName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Match Info Tab */}
      {activeTab === 'info' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Match Specifications</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500 block">Tournament:</span>
              <strong className="text-slate-900 text-sm">{match.tournamentId}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Match Format:</span>
              <strong className="text-slate-900 text-sm">{match.format} ({match.overs} Overs per innings)</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Venue:</span>
              <strong className="text-slate-900 text-sm">{match.venue}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Date & Time:</span>
              <strong className="text-slate-900 text-sm">{match.date} at {match.time} IST</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Official Umpire:</span>
              <strong className="text-slate-900 text-sm">{match.umpireName} ({match.umpireEmail || 'Assigned'})</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Match Status:</span>
              <strong className="text-slate-900 text-sm capitalize">{match.status.replace('_', ' ')}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
