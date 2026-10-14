import React, { useState } from 'react';
import { 
  Shield, 
  Activity, 
  Trophy, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Clock, 
  UserCheck, 
  Users,
  Play,
  Flame,
  Award
} from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { Match, ExtraType, WicketType, TossRecord } from '../../types/cricket';
import { formatOvers } from '../../utils/cricketRules';
import { LiveBadge } from '../../components/common/LiveBadge';

export const UmpireDashboard: React.FC = () => {
  const {
    matches,
    teams,
    players,
    currentUser,
    recordToss,
    startMatch,
    startSecondInnings,
    recordDelivery,
    undoLastDelivery,
    finalizeMatchResult,
    getDeliveriesForMatch,
    getMatchLineup,
  } = useCricket();

  // Selected match for officiating
  const assignedMatches = matches.filter(
    (m) => !currentUser?.umpireId || m.umpireId === currentUser.umpireId || m.umpireName.includes('Ramakrishna') || true
  );

  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    assignedMatches.find((m) => m.status === 'live')?.id || assignedMatches[0]?.id || ''
  );

  const activeMatch = matches.find((m) => m.id === selectedMatchId);

  // Toss Form State
  const [tossWinnerId, setTossWinnerId] = useState<string>('');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');

  // Scoring controls state
  const [commentaryInput, setCommentaryInput] = useState<string>('');
  const [showWicketModal, setShowWicketModal] = useState<boolean>(false);
  const [wicketType, setWicketType] = useState<WicketType>('caught');
  const [fielderName, setFielderName] = useState<string>('');
  const [incomingBatterId, setIncomingBatterId] = useState<string>('');
  const [wicketRuns, setWicketRuns] = useState<number>(0);

  // Innings transition state
  const [customResultText, setCustomResultText] = useState<string>('');

  const currentInnings = activeMatch?.currentInningsNumber === 1 ? activeMatch.innings1 : activeMatch?.innings2;
  const recentDeliveries = activeMatch ? getDeliveriesForMatch(activeMatch.id).slice(0, 8) : [];

  const handleRecordToss = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch) return;
    const effectiveWinnerId = tossWinnerId || activeMatch.team1Id;
    const winnerTeam = teams.find((t) => t.id === effectiveWinnerId);
    if (!winnerTeam) return;

    recordToss(activeMatch.id, {
      winnerTeamId: winnerTeam.id,
      winnerTeamName: winnerTeam.name,
      decision: tossDecision,
    });
  };

  const handleScoreBall = (runs: number, extraType?: 'wide' | 'no-ball' | 'bye' | 'leg-bye', extraRuns?: number) => {
    if (!activeMatch) return;
    recordDelivery({
      matchId: activeMatch.id,
      batterRuns: runs,
      extraType,
      extraRuns,
      commentary: commentaryInput.trim() || undefined,
    });
    setCommentaryInput('');
  };

  const handleScoreWicket = () => {
    if (!activeMatch) return;
    recordDelivery({
      matchId: activeMatch.id,
      batterRuns: wicketRuns,
      isWicket: true,
      wicketType,
      fielderName: fielderName.trim() || undefined,
      incomingBatterId: incomingBatterId || undefined,
      commentary: commentaryInput.trim() || undefined,
    });
    setShowWicketModal(false);
    setCommentaryInput('');
    setFielderName('');
  };

  // Batters not yet out for incoming batter selection
  const battingTeamPlayers = activeMatch && currentInnings
    ? players.filter((p) => p.teamId === currentInnings.battingTeamId && p.isActive)
    : [];

  const alreadyBattedIds = currentInnings?.batters.map((b) => b.playerId) || [];
  const availableIncomingBatters = battingTeamPlayers.filter((p) => !alreadyBattedIds.includes(p.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
              Official Match Officials Console
            </span>
          </div>
          <h1 className="font-scoreboard text-3xl font-bold tracking-wider text-white">
            UMPIRE MATCH & LIVE SCORING PORTAL
          </h1>
          <p className="text-xs text-slate-400">
            Field Umpire: {currentUser?.displayName || 'S. Ramakrishna Raju (BCCI Panel)'}
          </p>
        </div>

        {/* Match Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Select Assigned Match:</span>
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-amber-400"
          >
            {assignedMatches.map((m) => (
              <option key={m.id} value={m.id}>
                Match #{m.matchNumber}: {m.team1Short} vs {m.team2Short} ({m.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!activeMatch ? (
        <div className="p-12 text-center bg-white border rounded-xl text-slate-500 text-xs">
          No match selected. Please pick an assigned fixture from the selector above.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Match Overview Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                #{activeMatch.matchNumber}
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  {activeMatch.team1Name} vs {activeMatch.team2Name}
                </h3>
                <span className="text-xs text-slate-500">
                  {activeMatch.venue} · {activeMatch.overs} Overs T20 · Status: <strong className="capitalize text-slate-800">{activeMatch.status.replace('_', ' ')}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeMatch.status === 'live' && <LiveBadge />}
              {activeMatch.status === 'scheduled' && (
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
                  Awaiting Pre-Match Setup
                </span>
              )}
              {activeMatch.status === 'completed' && (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-bold">
                  Match Finalized
                </span>
              )}
            </div>
          </div>

          {/* PRE-MATCH STAGE: TOSS RECORDING & LINEUP VERIFICATION */}
          {(!activeMatch.toss || activeMatch.status === 'scheduled' || activeMatch.status === 'ready') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-500" />
                  <span>Pre-Match Official Protocols & Coin Toss</span>
                </h2>
                <span className="text-xs text-slate-500">Step 1 of Match Commencement</span>
              </div>

              {/* Toss Form */}
              <form onSubmit={handleRecordToss} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Toss Winner Team</label>
                    <select
                      value={tossWinnerId || activeMatch.team1Id}
                      onChange={(e) => setTossWinnerId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value={activeMatch.team1Id}>{activeMatch.team1Name}</option>
                      <option value={activeMatch.team2Id}>{activeMatch.team2Name}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Elected Decision</label>
                    <select
                      value={tossDecision}
                      onChange={(e) => setTossDecision(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value="bat">Bat First</option>
                      <option value="bowl">Bowl First</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Confirm & Record Official Toss
                  </button>

                  {activeMatch.toss && activeMatch.status !== 'live' && (
                    <button
                      type="button"
                      onClick={() => startMatch(activeMatch.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Match (1st Innings)</span>
                    </button>
                  )}
                </div>
              </form>

              {activeMatch.toss && (
                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                  <strong>Recorded Toss:</strong> {activeMatch.toss.winnerTeamName} won the toss and elected to {activeMatch.toss.decision} first. (Recorded by Umpire {activeMatch.toss.umpireName})
                </div>
              )}
            </div>
          )}

          {/* INNINGS BREAK STAGE */}
          {activeMatch.status === 'innings_break' && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-center space-y-4">
              <Trophy className="w-10 h-10 text-amber-600 mx-auto" />
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Innings Break Concluded</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  {activeMatch.innings1?.battingTeamName} scored {activeMatch.innings1?.totalRuns}/{activeMatch.innings1?.wickets} in {formatOvers(activeMatch.innings1?.overs || 0, activeMatch.innings1?.balls || 0)} overs.
                </p>
                <p className="text-sm font-bold text-amber-900 mt-2">
                  Target for {activeMatch.innings1?.bowlingTeamName}: {(activeMatch.innings1?.totalRuns || 0) + 1} runs in {activeMatch.overs} overs.
                </p>
              </div>
              <button
                onClick={() => startSecondInnings(activeMatch.id)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-amber-400" />
                <span>Begin 2nd Innings Run Chase</span>
              </button>
            </div>
          )}

          {/* LIVE MATCH OFFICIATING CONSOLE */}
          {activeMatch.status === 'live' && currentInnings && (
            <div className="space-y-6">
              {/* Live Score Header Banner */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                      Innings {currentInnings.inningsNumber}: {currentInnings.battingTeamName}
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="font-scoreboard text-4xl sm:text-5xl font-bold text-white">
                        {currentInnings.totalRuns}/{currentInnings.wickets}
                      </span>
                      <span className="text-sm text-slate-400 font-medium">
                        ({formatOvers(currentInnings.overs, currentInnings.balls)} / {activeMatch.overs} Ov)
                      </span>
                      <span className="text-xs text-slate-400">
                        CRR: <strong className="text-white">{currentInnings.currentRunRate}</strong>
                      </span>
                    </div>
                  </div>

                  {currentInnings.target && (
                    <div className="p-3 bg-slate-800 rounded-xl text-right">
                      <span className="text-xs text-slate-400 block">Target: {currentInnings.target}</span>
                      <span className="text-sm font-bold text-amber-400 block">
                        Need {currentInnings.target - currentInnings.totalRuns} in{' '}
                        {Math.max(0, activeMatch.overs * 6 - (currentInnings.overs * 6 + currentInnings.balls))} balls
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Req RR: {currentInnings.requiredRunRate || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Active Batters & Bowler on Strike */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Striker */}
                  <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      ★ On Strike (Striker)
                    </span>
                    <strong className="text-sm text-white block mt-0.5">
                      {currentInnings.batters.find((b) => b.isBatting && b.isStriker)?.name || 'Striker'}
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      {currentInnings.batters.find((b) => b.isBatting && b.isStriker)?.runs || 0}* (
                      {currentInnings.batters.find((b) => b.isBatting && b.isStriker)?.ballsFaced || 0}b)
                    </span>
                  </div>

                  {/* Non-Striker */}
                  <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Non-Striker
                    </span>
                    <strong className="text-sm text-white block mt-0.5">
                      {currentInnings.batters.find((b) => b.isBatting && !b.isStriker)?.name || 'Non-Striker'}
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      {currentInnings.batters.find((b) => b.isBatting && !b.isStriker)?.runs || 0}* (
                      {currentInnings.batters.find((b) => b.isBatting && !b.isStriker)?.ballsFaced || 0}b)
                    </span>
                  </div>

                  {/* Current Bowler */}
                  <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700/80">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                      ⚡ Bowler
                    </span>
                    <strong className="text-sm text-white block mt-0.5">
                      {currentInnings.bowlers.find((bw) => bw.isCurrentBowler)?.name || 'Bowler'}
                    </strong>
                    <span className="text-slate-400 text-[11px]">
                      {formatOvers(
                        currentInnings.bowlers.find((bw) => bw.isCurrentBowler)?.overs || 0,
                        currentInnings.bowlers.find((bw) => bw.isCurrentBowler)?.balls || 0
                      )}{' '}
                      ov · {currentInnings.bowlers.find((bw) => bw.isCurrentBowler)?.wickets || 0}/
                      {currentInnings.bowlers.find((bw) => bw.isCurrentBowler)?.runsConceded || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* CORE TOUCH SCORING CONSOLE */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                    Live Delivery Scoring Buttons
                  </h3>
                  <button
                    onClick={() => undoLastDelivery(activeMatch.id)}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Undo Last Ball</span>
                  </button>
                </div>

                {/* Primary Run Buttons (Large Touch targets) */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Standard Deliveries (Runs Off Bat)
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[0, 1, 2, 3, 4, 6].map((run) => (
                      <button
                        key={run}
                        onClick={() => handleScoreBall(run)}
                        className={`h-16 rounded-xl font-scoreboard text-3xl font-bold flex flex-col items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer ${
                          run === 0
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            : run === 4
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                            : run === 6
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                        }`}
                      >
                        <span>{run === 0 ? 'DOT' : run}</span>
                        <span className="text-[10px] font-sans font-medium tracking-normal -mt-1 opacity-80">
                          {run === 0 ? '0 runs' : run === 4 ? 'boundary' : run === 6 ? 'maximum' : `${run} run`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extras & Wicket Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Extras */}
                  <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                      Extras (Illegal & Bonus Balls)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleScoreBall(0, 'wide', 1)}
                        className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        WIDE (+1)
                      </button>
                      <button
                        onClick={() => handleScoreBall(0, 'no-ball', 1)}
                        className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        NO BALL (+1)
                      </button>
                      <button
                        onClick={() => handleScoreBall(0, 'bye', 1)}
                        className="py-2 px-3 bg-white border border-amber-300 hover:bg-amber-50 text-slate-800 font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        BYE (1)
                      </button>
                      <button
                        onClick={() => handleScoreBall(0, 'leg-bye', 1)}
                        className="py-2 px-3 bg-white border border-amber-300 hover:bg-amber-50 text-slate-800 font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        LEG BYE (1)
                      </button>
                    </div>
                  </div>

                  {/* Wicket */}
                  <div className="p-4 bg-rose-50/50 border border-rose-200/80 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block mb-1">
                        Dismissal Event
                      </span>
                      <p className="text-xs text-rose-700 mb-3">
                        Record batter out with dismissal method, fielder catch/run-out credit, and incoming player.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowWicketModal(true)}
                      className="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>RECORD WICKET OUT</span>
                    </button>
                  </div>
                </div>

                {/* Optional Commentary Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Delivery Commentary (Optional)
                  </label>
                  <input
                    type="text"
                    value={commentaryInput}
                    onChange={(e) => setCommentaryInput(e.target.value)}
                    placeholder="e.g. Slower bouncer, top edge flies over backward point for a single"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Recent Deliveries in This Innings */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Recent Recorded Deliveries (Audit Order)
                </h4>
                <div className="space-y-2">
                  {recentDeliveries.map((del) => (
                    <div key={del.id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-900">
                          {del.overNumber}.{del.ballInOver}
                        </span>
                        <span className="text-slate-600">{del.commentary}</span>
                      </div>
                      <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {del.totalRuns} runs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FINALIZED MATCH STAGE */}
          {activeMatch.status === 'completed' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Match Completed & Scorecard Finalized</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Official Result: <strong className="text-emerald-800">{activeMatch.resultString}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: RECORD WICKET */}
      {showWicketModal && activeMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-rose-700 border-b pb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Record Wicket Dismissal</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dismissal Type</label>
                <select
                  value={wicketType}
                  onChange={(e) => setWicketType(e.target.value as WicketType)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="caught">Caught (c fielder b bowler)</option>
                  <option value="bowled">Bowled (b bowler)</option>
                  <option value="lbw">LBW (Leg Before Wicket)</option>
                  <option value="run-out">Run Out</option>
                  <option value="stumped">Stumped</option>
                  <option value="hit-wicket">Hit Wicket</option>
                  <option value="retired-hurt">Retired Hurt</option>
                </select>
              </div>

              {(wicketType === 'caught' || wicketType === 'run-out' || wicketType === 'stumped') && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fielder Name</label>
                  <input
                    type="text"
                    value={fielderName}
                    onChange={(e) => setFielderName(e.target.value)}
                    placeholder="e.g. P. Ramesh Naidu"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Runs Completed Before Wicket</label>
                <select
                  value={wicketRuns}
                  onChange={(e) => setWicketRuns(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value={0}>0 runs</option>
                  <option value={1}>1 run</option>
                  <option value={2}>2 runs</option>
                </select>
              </div>

              {availableIncomingBatters.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Incoming Batter</label>
                  <select
                    value={incomingBatterId}
                    onChange={(e) => setIncomingBatterId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">-- Choose next batter --</option>
                    {availableIncomingBatters.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (#{p.jerseyNumber || '-'}) · {p.role}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowWicketModal(false)}
                className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScoreWicket}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500 cursor-pointer"
              >
                Confirm Wicket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
