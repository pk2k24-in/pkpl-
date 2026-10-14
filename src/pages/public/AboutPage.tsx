import React from 'react';
import { Trophy, ShieldCheck, MapPin, Award, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full text-amber-400 text-xs font-semibold mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>CRICKET CONSTITUTION & TOURNAMENT CODE</span>
          </div>
          <h1 className="font-scoreboard text-3xl sm:text-5xl font-bold tracking-wide uppercase text-white mb-2">
            ABOUT PEDDA KANNALI PREMIER LEAGUE
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Pedda Kannali Premier League (PKPL) is the premier rural and regional cricket competition in Andhra Pradesh, established to foster grassroots sporting excellence and community unity through pure, unadulterated cricket.
          </p>
        </div>
      </div>

      {/* Core Cricket Mission & Strict Cricket-Only Focus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            🏏
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Exclusively Cricket</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            PKPL is dedicated solely to cricket. Every rule, statistical calculation, scorecard format, and umpire protocol conforms to professional MCC and BCCI T20 cricket playing standards.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Open Spectator Access</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cricket belongs to the supporters. Public spectators enjoy 100% free, real-time access to live scoreboards, match fixtures, and ball-by-ball commentary without registration or email logins.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Integrity & Audit Trail</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every delivery, toss, wicket, extra, and lineup submission is recorded with an immutable audit log to preserve tournament history and guarantee genuine competition.
          </p>
        </div>
      </div>

      {/* Tournament Playing Conditions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
          Official PKPL Playing Regulations (T20 Format)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block">Match Duration:</strong>
              20 overs per side, with a mandatory 15-minute innings break between innings.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block">Bowler Quota:</strong>
              No bowler may bowl more than 4 overs in an uninterrupted 20-over match.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block">Powerplay Overs:</strong>
              Overs 1 through 6 are fielding restriction overs (maximum 2 fielders outside 30-yard circle).
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block">Tied Matches & Super Over:</strong>
              Matches tied on runs proceed to a 1-over eliminator (Super Over) to decide the winner.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block">No-Ball Free Hit:</strong>
              Any front-foot or illegal field no-ball awards the batting side an automatic Free Hit.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block">Net Run Rate Discipline:</strong>
              Calculated using official ICC mathematical standards. All-out innings count as full 20 overs.
            </div>
          </div>
        </div>
      </div>

      {/* Venues Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-500" />
          <span>Official Match Venues</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Pedda Kannali Main Stadium</h4>
            <p className="text-slate-500 text-[11px]">Primary Center & Finals Venue</p>
            <div className="text-slate-600 pt-1">
              <div>Pitch: Turf Track</div>
              <div>Boundary: 65 meters</div>
              <div>Capacity: 3,500 Spectators</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">ZPHS Cricket Grounds</h4>
            <p className="text-slate-500 text-[11px]">Secondary Rural Ground</p>
            <div className="text-slate-600 pt-1">
              <div>Pitch: Matting / Compact</div>
              <div>Boundary: 60 meters</div>
              <div>Capacity: 2,000 Spectators</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
            <h4 className="font-bold text-slate-900 text-sm">Sri Rama Ground</h4>
            <p className="text-slate-500 text-[11px]">Venkatapuram Rural Sports Hub</p>
            <div className="text-slate-600 pt-1">
              <div>Pitch: Astro-Turf Surface</div>
              <div>Boundary: 62 meters</div>
              <div>Capacity: 1,500 Spectators</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
