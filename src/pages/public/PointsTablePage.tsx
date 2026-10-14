import React from 'react';
import { Trophy, HelpCircle, ShieldCheck } from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { PointsTable } from '../../components/cricket/PointsTable';

export const PointsTablePage: React.FC = () => {
  const { standings } = useCricket();

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
        <h1 className="font-scoreboard text-3xl font-bold tracking-wider uppercase text-white mb-1">
          POINTS TABLE & TOURNAMENT STANDINGS
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Live tournament table computed strictly from recorded matches with exact Net Run Rate (NRR) and tie-breaker regulations.
        </p>
      </div>

      <PointsTable standings={standings} compact={false} />

      {/* Rules Explainer */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-xs text-slate-600 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span>PKPL Standing & Net Run Rate (NRR) Rules</span>
        </h3>
        <p className="leading-relaxed">
          <strong>Points System:</strong> Each team is awarded <strong>2 points</strong> for a win, <strong>1 point</strong> for a tie or no-result/washout, and <strong>0 points</strong> for a loss.
        </p>
        <p className="leading-relaxed">
          <strong>Net Run Rate (NRR):</strong> NRR is calculated by subtracting the average runs conceded per over bowled by a team from the average runs scored per over faced by that team across all completed matches.
        </p>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
          NRR = (Total Runs Scored ÷ Total Overs Faced) − (Total Runs Conceded ÷ Total Overs Bowled)
        </div>
        <p className="leading-relaxed text-[11px] text-slate-500">
          * Note: If a team is bowled out (all out) prior to their allocated 20 overs, the full 20 overs are credited in the calculation.
        </p>
      </div>
    </div>
  );
};
