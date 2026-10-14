import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Trophy,
  Shield,
  Activity,
  Users,
  LogIn,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  Lock,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { UserRole } from '../../types/cricket';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    firebaseUser,
    isFirebaseConnected,
    firebaseProjectId,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logoutFirebase,
    switchRole,
    seedPKPLDataToFirestore,
  } = useCricket();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('organizer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [teamId, setTeamId] = useState('team-pkr');
  const [umpireId, setUmpireId] = useState('ump-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/organizer');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        setSuccessMsg('Successfully signed in via Firebase Auth.');
        setTimeout(() => {
          navigate(selectedRole === 'spectator' ? '/' : `/${selectedRole}`);
        }, 600);
      } else {
        await registerWithEmail(email, password, selectedRole, {
          displayName: displayName || email.split('@')[0],
          teamId: selectedRole === 'captain' ? teamId : undefined,
          umpireId: selectedRole === 'umpire' ? umpireId : undefined,
        });
        setSuccessMsg('Account created and registered in Cloud Firestore.');
        setTimeout(() => {
          navigate(`/${selectedRole}`);
        }, 600);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPersona = (role: UserRole) => {
    switchRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Firebase Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Connected to Firebase: <strong className="text-amber-400 font-mono">{firebaseProjectId}</strong>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>Security Rules: Active ABAC Enforced</span>
          <span>·</span>
          <span>Web SDK Live</span>
        </div>
      </div>

      {/* Notice Banner for Spectators */}
      <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-xs">
        <Trophy className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-sm font-bold text-amber-950 mb-0.5">
            Public Spectators Do Not Require An Account
          </strong>
          <p className="leading-relaxed text-amber-800">
            If you are a fan, cricket follower, or player's family member wanting to follow live match scores, full scorecards, or points table standings, you can browse freely with zero registration.{' '}
            <Link to="/" className="underline font-bold text-amber-950 hover:text-amber-900">
              Return to Public Match Center →
            </Link>
          </p>
        </div>
      </div>

      {/* Current User Logged In State */}
      {currentUser && (
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Active Session
              </span>
              <h3 className="font-bold text-base text-slate-900">{currentUser.displayName}</h3>
              <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/${currentUser.role}`}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                Go to {currentUser.role.toUpperCase()} Dashboard →
              </Link>
              <button
                type="button"
                onClick={() => logoutFirebase()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-md">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="font-scoreboard text-3xl font-bold tracking-wider text-slate-900">
          AUTHORIZED STAFF & OFFICIALS ACCESS
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Sign in via Firebase Authentication as a Tournament Director, Certified Field Umpire, or Franchise Captain.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Organizer */}
        <div
          onClick={() => setSelectedRole('organizer')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedRole === 'organizer'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/40'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  selectedRole === 'organizer' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}
              >
                1
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  selectedRole === 'organizer' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Director
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base">Tournament Organizer</h3>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  selectedRole === 'organizer' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Configure tournament settings, approve franchise teams, schedule fixtures, assign umpires & publish bulletins.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200/20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDemoPersona('organizer');
              }}
              className="w-full py-2 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Quick Preview as Organizer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Umpire */}
        <div
          onClick={() => setSelectedRole('umpire')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedRole === 'umpire'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/40'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  selectedRole === 'umpire' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}
              >
                2
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  selectedRole === 'umpire' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Field Umpire
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base">Match Umpire Portal</h3>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  selectedRole === 'umpire' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Operate the live ball-by-ball touch console. Strictly restricted to matches where you are the assigned official.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200/20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDemoPersona('umpire');
              }}
              className="w-full py-2 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Quick Preview as Umpire</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Captain */}
        <div
          onClick={() => setSelectedRole('captain')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedRole === 'captain'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/40'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  selectedRole === 'captain' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}
              >
                3
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  selectedRole === 'captain' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Captain
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base">Team Captain Dashboard</h3>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  selectedRole === 'captain' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Add squad cricketers, assign jersey numbers, and submit official match playing XIs directly to Cloud Firestore.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200/20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDemoPersona('captain');
              }}
              className="w-full py-2 px-3 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Quick Preview as Captain</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real Firebase Authentication Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs max-w-lg mx-auto space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-sm text-slate-900">Firebase Authentication</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                mode === 'login' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                mode === 'register' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign In with Google (Direct Firebase Auth)</span>
        </button>

        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span>or with email credentials</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Full Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. K. Mahesh Reddy"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="official@pkpl.org"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign Initial Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="organizer">Tournament Organizer / Director</option>
                <option value="umpire">Certified Match Umpire</option>
                <option value="captain">Franchise Team Captain</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>
              {loading
                ? 'Authenticating with Firebase...'
                : mode === 'login'
                ? `Sign In to ${selectedRole.toUpperCase()} Portal`
                : `Create ${selectedRole.toUpperCase()} Account`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
