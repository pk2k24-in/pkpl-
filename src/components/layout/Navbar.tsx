import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Trophy, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  ShieldAlert, 
  ChevronDown, 
  Flame, 
  Calendar, 
  Users, 
  Award,
  Activity,
  FileText
} from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { LiveBadge } from '../common/LiveBadge';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, userRole, liveMatches, logout, logoutFirebase, switchRole, resetToSampleData, clearAllToEmptyState } = useCricket();

  const navLinks = [
    { label: 'Home', path: '/' },
    { 
      label: 'Live Matches', 
      path: '/live', 
      hasLive: liveMatches.length > 0 
    },
    { label: 'Fixtures', path: '/fixtures' },
    { label: 'Results', path: '/results' },
    { label: 'Points Table', path: '/points-table' },
    { label: 'Teams', path: '/teams' },
    { label: 'Players', path: '/players' },
    { label: 'Statistics', path: '/stats' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'About', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      {/* Top Banner Notice for Spectators */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1 text-[11px] font-semibold text-center tracking-wide flex items-center justify-center gap-2">
        <span>🏆 PKPL SEASON 4 — PEDDA KANNALI CRICKET CARNIVAL</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline font-normal">Public Spectator Portal: No Registration Required</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md border border-amber-300/30 group-hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-scoreboard text-2xl tracking-wider text-white font-bold leading-none">PKPL</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                  CRICKET
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-tight">Pedda Kannali Premier League</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  isActive(link.path)
                    ? 'text-amber-400 bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{link.label}</span>
                {link.hasLive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right Action: User Role / Staff Access */}
          <div className="flex items-center gap-2.5">
            {/* Quick Live Link for Mobile / Tablet */}
            {liveMatches.length > 0 && (
              <Link
                to="/live"
                className="xl:hidden flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-md"
              >
                <LiveBadge size="sm" />
              </Link>
            )}

            {/* Role / Login Status */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="capitalize">{currentUser.role}: {currentUser.displayName.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-700/80 mb-1">
                      <p className="font-semibold text-white">{currentUser.displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 uppercase text-[10px] font-bold text-amber-400 tracking-wider">
                        Role: {currentUser.role}
                      </span>
                    </div>

                    <Link
                      to={`/${currentUser.role}`}
                      onClick={() => setRoleMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>Open {currentUser.role.toUpperCase()} Dashboard</span>
                    </Link>

                    <div className="border-t border-slate-700/80 my-1"></div>

                    <div className="px-3 py-1 text-[11px] font-medium text-slate-400">Switch Persona for Review:</div>
                    <button
                      onClick={() => { switchRole('organizer'); setRoleMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-slate-300"
                    >
                      Switch to Organizer
                    </button>
                    <button
                      onClick={() => { switchRole('umpire'); setRoleMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-slate-300"
                    >
                      Switch to Umpire (S. Raju)
                    </button>
                    <button
                      onClick={() => { switchRole('captain'); setRoleMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-700 text-slate-300"
                    >
                      Switch to Captain (PKR)
                    </button>

                    <div className="border-t border-slate-700/80 my-1"></div>

                    <button
                      onClick={() => { logoutFirebase(); logout(); setRoleMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out (Spectator Mode)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Staff Portal</span>
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950 border-t border-slate-800 px-4 pt-3 pb-6 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider mb-2">
            Spectator Navigation
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                isActive(link.path)
                  ? 'text-amber-400 bg-slate-900 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <span>{link.label}</span>
              {link.hasLive && <LiveBadge size="sm" />}
            </Link>
          ))}

          <div className="pt-4 border-t border-slate-800 mt-3 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 px-3 uppercase tracking-wider">
              Staff & Administration
            </div>
            {currentUser ? (
              <>
                <Link
                  to={`/${currentUser.role}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-amber-400 bg-slate-900 rounded-md"
                >
                  Open {currentUser.role.toUpperCase()} Dashboard
                </Link>
                <button
                  onClick={() => { logoutFirebase(); logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-950/40 rounded-md"
                >
                  Log Out to Spectator Mode
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm font-semibold text-slate-950 bg-amber-500 rounded-lg"
              >
                Organizer / Umpire / Captain Login
              </Link>
            )}

            <div className="pt-2 flex items-center justify-between gap-2 px-1 text-xs">
              <button
                onClick={() => { resetToSampleData(); setMobileMenuOpen(false); }}
                className="text-slate-400 hover:text-white underline text-[11px]"
              >
                Reload PKPL Season 4 Data
              </button>
              <button
                onClick={() => { clearAllToEmptyState(); setMobileMenuOpen(false); }}
                className="text-rose-400 hover:text-rose-300 underline text-[11px]"
              >
                Start Clean Empty
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
