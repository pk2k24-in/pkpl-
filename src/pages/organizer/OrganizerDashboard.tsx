import React, { useState } from 'react';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Plus, 
  MapPin, 
  Megaphone, 
  Shield, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { Match, Team, Venue, MatchFormat } from '../../types/cricket';

export const OrganizerDashboard: React.FC = () => {
  const {
    currentTournament,
    tournaments,
    teams,
    matches,
    venues,
    announcements,
    auditLogs,
    createTeam,
    scheduleMatch,
    addVenue,
    addAnnouncement,
    seedPKPLDataToFirestore,
    firebaseProjectId,
    resetToSampleData,
    clearAllToEmptyState,
  } = useCricket();

  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'fixtures' | 'venues' | 'announcements' | 'audit'>('overview');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // Form states
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showAnnModal, setShowAnnModal] = useState(false);

  // New Team Form
  const [newTeam, setNewTeam] = useState({
    name: '',
    shortName: '',
    captainName: '',
    contactEmail: '',
    primaryColor: '#1e3a8a',
    secondaryColor: '#d97706',
    description: '',
    homeGround: 'Pedda Kannali Main Stadium',
  });

  // New Match Form
  const [newMatch, setNewMatch] = useState({
    matchNumber: matches.length + 1,
    team1Id: teams[0]?.id || '',
    team2Id: teams[1]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    venue: venues[0]?.name || 'Pedda Kannali Main Stadium',
    overs: 20,
    format: 'T20' as MatchFormat,
    status: 'scheduled' as const,
    umpireId: 'umpire-1',
    umpireName: 'S. Ramakrishna Raju',
    umpireEmail: 'ramakrishna.umpire@pkpl.org',
  });

  // New Venue Form
  const [newVenue, setNewVenue] = useState({
    name: '',
    city: 'Pedda Kannali',
    address: '',
    pitchType: 'Turf' as const,
    boundarySizeMeters: 65,
    capacity: 2500,
  });

  // New Announcement Form
  const [newAnn, setNewAnn] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Tournament Update' as const,
    author: 'PKPL Organizing Committee',
    isPinned: false,
  });

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || !newTeam.shortName || !newTeam.captainName) return;

    createTeam({
      ...newTeam,
      captainId: `cap-${Date.now()}`,
    });

    setShowTeamModal(false);
    setNewTeam({
      name: '',
      shortName: '',
      captainName: '',
      contactEmail: '',
      primaryColor: '#1e3a8a',
      secondaryColor: '#d97706',
      description: '',
      homeGround: 'Pedda Kannali Main Stadium',
    });
  };

  const handleScheduleMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMatch.team1Id === newMatch.team2Id) {
      alert('A team cannot play against itself. Please select two different teams.');
      return;
    }

    const t1 = teams.find((t) => t.id === newMatch.team1Id);
    const t2 = teams.find((t) => t.id === newMatch.team2Id);
    if (!t1 || !t2) return;

    scheduleMatch({
      tournamentId: currentTournament?.id || 'pkpl-2026',
      matchNumber: Number(newMatch.matchNumber),
      team1Id: t1.id,
      team2Id: t2.id,
      team1Name: t1.name,
      team2Name: t2.name,
      team1Short: t1.shortName,
      team2Short: t2.shortName,
      team1Color: t1.primaryColor,
      team2Color: t2.primaryColor,
      date: newMatch.date,
      time: newMatch.time,
      venue: newMatch.venue,
      overs: Number(newMatch.overs),
      format: newMatch.format,
      status: 'scheduled',
      umpireId: newMatch.umpireId,
      umpireName: newMatch.umpireName,
      umpireEmail: newMatch.umpireEmail,
    });

    setShowMatchModal(false);
  };

  const handleAddVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenue.name) return;
    addVenue(newVenue);
    setShowVenueModal(false);
    setNewVenue({
      name: '',
      city: 'Pedda Kannali',
      address: '',
      pitchType: 'Turf',
      boundarySizeMeters: 65,
      capacity: 2500,
    });
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.content) return;
    addAnnouncement(newAnn);
    setShowAnnModal(false);
    setNewAnn({
      title: '',
      summary: '',
      content: '',
      category: 'Tournament Update',
      author: 'PKPL Organizing Committee',
      isPinned: false,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
              Tournament Director Console
            </span>
          </div>
          <h1 className="font-scoreboard text-3xl font-bold tracking-wider text-white">
            PKPL ORGANIZER DASHBOARD
          </h1>
          <p className="text-xs text-slate-400">
            {currentTournament?.name || 'Pedda Kannali Premier League'} · {currentTournament?.season || 'Season 4'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={async () => {
              setSyncLoading(true);
              setSyncStatus('');
              try {
                await seedPKPLDataToFirestore();
                setSyncStatus('Live PKPL Season 4 data synchronized to Cloud Firestore!');
              } catch (err: any) {
                setSyncStatus(`Sync error: ${err.message || 'Permissions error'}`);
              } finally {
                setSyncLoading(false);
              }
            }}
            disabled={syncLoading}
            className="px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title={`Push official PKPL data to Cloud Firestore on ${firebaseProjectId}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
            <span>{syncLoading ? 'Syncing to Firestore...' : 'Sync Data to Firestore'}</span>
          </button>
          <button
            onClick={resetToSampleData}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload Official PKPL Season 4 Dataset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
          <button
            onClick={clearAllToEmptyState}
            className="px-3 py-1.5 text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Clear all to start fresh tournament"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear to Empty</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
          syncStatus.includes('error') ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'teams', label: `Teams (${teams.length})` },
          { id: 'fixtures', label: `Fixtures (${matches.length})` },
          { id: 'venues', label: `Venues (${venues.length})` },
          { id: 'announcements', label: `Announcements (${announcements.length})` },
          { id: 'audit', label: `Audit Logs (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Registered Teams</span>
              <strong className="text-2xl font-scoreboard font-bold text-slate-900">{teams.length}</strong>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Matches</span>
              <strong className="text-2xl font-scoreboard font-bold text-slate-900">{matches.length}</strong>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Active Venues</span>
              <strong className="text-2xl font-scoreboard font-bold text-slate-900">{venues.length}</strong>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Tournament Status</span>
              <strong className="text-base font-bold text-emerald-700 capitalize">
                {currentTournament?.status || 'Active'}
              </strong>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Tournament Configuration & Playing Conditions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Tournament Name:</span>
                <strong className="text-slate-900">{currentTournament?.name || 'PKPL'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Season:</span>
                <strong className="text-slate-900">{currentTournament?.season || 'Season 4'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Format & Overs:</span>
                <strong className="text-slate-900">
                  {currentTournament?.format || 'League'} · {currentTournament?.rules.oversPerInnings || 20} Overs
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Points Rule:</span>
                <strong className="text-slate-900">Win: 2 pts · Tie: 1 pt · Loss: 0 pts</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: TEAMS */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900">Approved Tournament Teams</h2>
            <button
              onClick={() => setShowTeamModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Team</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                    style={{ backgroundColor: t.primaryColor }}
                  >
                    {t.shortName}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Approved
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                <div className="text-xs text-slate-600 space-y-0.5 pt-1 border-t border-slate-50">
                  <div>Captain: <span className="font-semibold text-slate-800">{t.captainName}</span></div>
                  <div>Contact: <span className="text-slate-500">{t.contactEmail}</span></div>
                  <div>Ground: <span className="text-slate-500">{t.homeGround}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: FIXTURES */}
      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900">Scheduled Matches & Umpire Allocations</h2>
            <button
              onClick={() => setShowMatchModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Match</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-center">Match #</th>
                  <th className="py-2.5 px-4">Fixture</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Venue</th>
                  <th className="py-2.5 px-3">Assigned Umpire</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matches.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-600">#{m.matchNumber}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {m.team1Short} vs {m.team2Short}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{m.date} at {m.time}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.venue}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{m.umpireName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        m.status === 'live'
                          ? 'bg-rose-100 text-rose-700'
                          : m.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: VENUES */}
      {activeTab === 'venues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900">Tournament Cricket Venues</h2>
            <button
              onClick={() => setShowVenueModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Venue</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {venues.map((v) => (
              <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">{v.name}</h4>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{v.city} · {v.address}</span>
                </div>
                <div className="text-xs text-slate-600 pt-1 border-t border-slate-50">
                  <div>Pitch Surface: <strong className="text-slate-800">{v.pitchType}</strong></div>
                  <div>Boundary Radius: <strong className="text-slate-800">{v.boundarySizeMeters}m</strong></div>
                  <div>Spectator Capacity: <strong className="text-slate-800">{v.capacity || '-'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900">Published Bulletins</h2>
            <button
              onClick={() => setShowAnnModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Bulletin</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-bold text-amber-700">{ann.category}</span>
                  <span>{ann.date}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                <p className="text-slate-600">{ann.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h2 className="font-bold text-base text-slate-900">Audit Trail & Integrity Logs</h2>
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Performed By</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900">{log.action}</td>
                    <td className="py-2 px-3 text-slate-700">{log.performedBy}</td>
                    <td className="py-2 px-3 uppercase text-amber-700 font-bold">{log.userRole}</td>
                    <td className="py-2 px-4 text-slate-600 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Register Team */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 border-b pb-2">Register New Franchise Team</h3>
            <form onSubmit={handleCreateTeam} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="e.g. Tirupati Strikers"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Short Name (3-4 chars)</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={newTeam.shortName}
                    onChange={(e) => setNewTeam({ ...newTeam, shortName: e.target.value.toUpperCase() })}
                    placeholder="e.g. TS"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Captain Name</label>
                  <input
                    type="text"
                    required
                    value={newTeam.captainName}
                    onChange={(e) => setNewTeam({ ...newTeam, captainName: e.target.value })}
                    placeholder="e.g. R. Prasad"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Captain / Team Email</label>
                  <input
                    type="email"
                    required
                    value={newTeam.contactEmail}
                    onChange={(e) => setNewTeam({ ...newTeam, contactEmail: e.target.value })}
                    placeholder="captain@pkpl.org"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={newTeam.primaryColor}
                    onChange={(e) => setNewTeam({ ...newTeam, primaryColor: e.target.value })}
                    className="w-full h-9 p-1 border rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Team Description</label>
                <textarea
                  rows={2}
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Team background and pedigree..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Confirm & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Schedule Match */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 border-b pb-2">Schedule Match Fixture</h3>
            <form onSubmit={handleScheduleMatch} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Team 1</label>
                  <select
                    value={newMatch.team1Id}
                    onChange={(e) => setNewMatch({ ...newMatch, team1Id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Team 2</label>
                  <select
                    value={newMatch.team2Id}
                    onChange={(e) => setNewMatch({ ...newMatch, team2Id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Match Date</label>
                  <input
                    type="date"
                    required
                    value={newMatch.date}
                    onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newMatch.time}
                    onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Venue</label>
                  <select
                    value={newMatch.venue}
                    onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Overs Per Innings</label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={newMatch.overs}
                    onChange={(e) => setNewMatch({ ...newMatch, overs: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Official Field Umpire</label>
                <select
                  value={newMatch.umpireName}
                  onChange={(e) => {
                    const name = e.target.value;
                    const email = name.includes('Ramakrishna') ? 'ramakrishna.umpire@pkpl.org' : 'govinda.umpire@pkpl.org';
                    setNewMatch({ ...newMatch, umpireName: name, umpireEmail: email });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900 bg-white"
                >
                  <option value="S. Ramakrishna Raju">S. Ramakrishna Raju (BCCI Level 1 certified)</option>
                  <option value="P. Govinda Rao">P. Govinda Rao (Senior State Panel)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowMatchModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Publish Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Venue */}
      {showVenueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 border-b pb-2">Add Tournament Venue</h3>
            <form onSubmit={handleAddVenue} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stadium / Ground Name</label>
                <input
                  type="text"
                  required
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                  placeholder="e.g. Pedda Kannali Community Ground"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={newVenue.address}
                  onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
                  placeholder="Street / Near Landmark"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pitch Type</label>
                  <select
                    value={newVenue.pitchType}
                    onChange={(e) => setNewVenue({ ...newVenue, pitchType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Turf">Turf</option>
                    <option value="Matting">Matting</option>
                    <option value="Astro-Turf">Astro-Turf</option>
                    <option value="Concrete">Concrete</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Boundary (meters)</label>
                  <input
                    type="number"
                    value={newVenue.boundarySizeMeters}
                    onChange={(e) => setNewVenue({ ...newVenue, boundarySizeMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newVenue.capacity}
                    onChange={(e) => setNewVenue({ ...newVenue, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowVenueModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Save Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Publish Announcement */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 border-b pb-2">Publish Official Announcement</h3>
            <form onSubmit={handleAddAnnouncement} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newAnn.title}
                  onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                  placeholder="e.g. Schedule Update for Quarter Finals"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Summary (1 sentence)</label>
                <input
                  type="text"
                  required
                  value={newAnn.summary}
                  onChange={(e) => setNewAnn({ ...newAnn, summary: e.target.value })}
                  placeholder="Brief preview line..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Content</label>
                <textarea
                  rows={4}
                  required
                  value={newAnn.content}
                  onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                  placeholder="Full bulletin body text..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={newAnn.isPinned}
                  onChange={(e) => setNewAnn({ ...newAnn, isPinned: e.target.checked })}
                  className="rounded text-slate-900"
                />
                <label htmlFor="pinCheck" className="text-slate-700 font-semibold cursor-pointer">
                  Pin this announcement to top of feed
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
