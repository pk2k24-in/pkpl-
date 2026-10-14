import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, MapPin, Mail, Phone, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="font-scoreboard text-xl text-white font-bold tracking-wider">PKPL CRICKET</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Pedda Kannali Premier League — The official rural and regional cricket championship celebrating sportsmanship, athletic talent, and community spirit across Pedda Kannali and Tirupati rural district.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Dedicated Cricket-Only Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Tournament Central</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/live" className="hover:text-amber-400 transition-colors">Live Match Scoreboard</Link></li>
              <li><Link to="/fixtures" className="hover:text-amber-400 transition-colors">Upcoming Fixtures</Link></li>
              <li><Link to="/results" className="hover:text-amber-400 transition-colors">Completed Results & Scorecards</Link></li>
              <li><Link to="/points-table" className="hover:text-amber-400 transition-colors">Points Table & NRR Standings</Link></li>
              <li><Link to="/stats" className="hover:text-amber-400 transition-colors">Tournament Leaderboard & Stats</Link></li>
            </ul>
          </div>

          {/* Teams & Players */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Teams & Players</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/teams" className="hover:text-amber-400 transition-colors">Participating Teams</Link></li>
              <li><Link to="/players" className="hover:text-amber-400 transition-colors">Registered Players Roster</Link></li>
              <li><Link to="/announcements" className="hover:text-amber-400 transition-colors">Official Announcements</Link></li>
              <li><Link to="/about" className="hover:text-amber-400 transition-colors">Rules & Playing Conditions</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Organizing Committee Contact</Link></li>
            </ul>
          </div>

          {/* Venue & Spectator Notice */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Tournament Headquarters</h4>
            <div className="flex items-start gap-2 text-xs">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Pedda Kannali Main Cricket Stadium, Pedda Kannali, Tirupati District, Andhra Pradesh</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>committee@pkpl.org</span>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300">
              <strong className="text-white block mb-0.5">Spectator Guarantee:</strong>
              No login, email, or registration is required to view live cricket scores, ball-by-ball updates, or scorecards.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} PKPL — Pedda Kannali Premier League. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-300">Constitution & Rules</Link>
            <span>·</span>
            <Link to="/login" className="hover:text-amber-400 text-slate-400 font-semibold">Staff Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
