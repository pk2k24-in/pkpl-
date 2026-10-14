import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';
import { Player, PlayerRole, LineupPlayer, BattingStyle, BowlingStyle } from '../../types/cricket';

export const CaptainDashboard: React.FC = () => {
  const {
    teams,
    players,
    matches,
    currentUser,
    addPlayerToRoster,
    updatePlayer,
    removePlayerFromRoster,
    submitMatchLineup,
    getMatchLineup,
  } = useCricket();

  // Find captain's team (defaults to PKR if test session)
  const myTeam = teams.find((t) => t.id === currentUser?.teamId) || teams[0];
  const myRoster = players.filter((p) => p.teamId === myTeam?.id && p.isActive);
  const myMatches = matches.filter(
    (m) => m.team1Id === myTeam?.id || m.team2Id === myTeam?.id
  );

  const upcomingMatches = myMatches.filter(
    (m) => m.status === 'scheduled' || m.status === 'draft' || m.status === 'lineup_submitted'
  );

  const [activeTab, setActiveTab] = useState<'roster' | 'lineups' | 'matches'>('roster');

  // Add Player State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    jerseyNumber: 1,
    role: 'batter' as PlayerRole,
    battingStyle: 'Right-hand bat' as BattingStyle,
    bowlingStyle: 'Right-arm medium' as BowlingStyle,
    isActive: true,
  });

  // Lineup Selection State
  const [selectedMatchId, setSelectedMatchId] = useState<string>(upcomingMatches[0]?.id || '');
  const [selectedPlayingXI, setSelectedPlayingXI] = useState<string[]>([]);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [lineupSuccessMsg, setLineupSuccessMsg] = useState<string>('');

  const currentLineupRecord = selectedMatchId && myTeam ? getMatchLineup(selectedMatchId, myTeam.id) : null;

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam || !newPlayer.name.trim()) return;

    addPlayerToRoster(myTeam.id, {
      ...newPlayer,
      jerseyNumber: Number(newPlayer.jerseyNumber) || undefined,
    });

    setShowAddModal(false);
    setNewPlayer({
      name: '',
      jerseyNumber: 1,
      role: 'batter',
      battingStyle: 'Right-hand bat',
      bowlingStyle: 'Right-arm medium',
      isActive: true,
    });
  };

  const togglePlayerInPlayingXI = (playerId: string) => {
    if (selectedPlayingXI.includes(playerId)) {
      setSelectedPlayingXI(selectedPlayingXI.filter((id) => id !== playerId));
    } else {
      if (selectedPlayingXI.length >= 11) {
        alert('Standard cricket playing XI is limited to 11 players.');
        return;
      }
      setSelectedPlayingXI([...selectedPlayingXI, playerId]);
      // Remove from subs if was in subs
      setSelectedSubs(selectedSubs.filter((id) => id !== playerId));
    }
  };

  const togglePlayerInSubs = (playerId: string) => {
    if (selectedSubs.includes(playerId)) {
      setSelectedSubs(selectedSubs.filter((id) => id !== playerId));
    } else {
      if (selectedPlayingXI.includes(playerId)) {
        alert('Player is already in the Playing XI.');
        return;
      }
      setSelectedSubs([...selectedSubs, playerId]);
    }
  };

  const handleSubmitLineup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId || !myTeam) return;

    if (selectedPlayingXI.length !== 11) {
      alert(`Standard cricket rules mandate 11 players in the Playing XI. You currently selected ${selectedPlayingXI.length}.`);
      return;
    }

    const playingXIObjects: LineupPlayer[] = selectedPlayingXI.map((id) => {
      const p = players.find((pl) => pl.id === id);
      return {
        playerId: id,
        name: p?.name || 'Player',
        jerseyNumber: p?.jerseyNumber,
        role: p?.role || 'batter',
        isCaptain: p?.id === myTeam.captainId,
      };
    });

    const subObjects: LineupPlayer[] = selectedSubs.map((id) => {
      const p = players.find((pl) => pl.id === id);
      return {
        playerId: id,
        name: p?.name || 'Substitute',
        jerseyNumber: p?.jerseyNumber,
        role: p?.role || 'batter',
      };
    });

    submitMatchLineup(selectedMatchId, myTeam.id, playingXIObjects, subObjects);
    setLineupSuccessMsg('Match Playing XI and Substitutes officially submitted and locked!');
    setTimeout(() => setLineupSuccessMsg(''), 4000);
  };

  if (!myTeam) {
    return (
      <div className="p-12 text-center bg-white border rounded-xl text-slate-500 text-xs">
        No team associated with your captain profile. Please switch to an authorized captain persona in the menu.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md"
            style={{ backgroundColor: myTeam.primaryColor }}
          >
            {myTeam.shortName}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                Franchise Captain Dashboard
              </span>
              <span className="text-[11px] text-slate-400">· {myTeam.shortName}</span>
            </div>
            <h1 className="font-scoreboard text-3xl font-bold tracking-wider text-white">
              {myTeam.name}
            </h1>
            <p className="text-xs text-slate-400">
              Captain: {myTeam.captainName} · {myRoster.length} Active Cricketers in Roster
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Player to Roster</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Squad Roster ({myRoster.length})
        </button>

        <button
          onClick={() => setActiveTab('lineups')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'lineups'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Match Lineup Submission (Playing XI)
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'matches'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          My Team's Match History ({myMatches.length})
        </button>
      </div>

      {/* TAB: ROSTER MANAGEMENT */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900">Registered Team Roster</h2>
              <p className="text-xs text-slate-500">
                Players added here are available for match-specific Playing XI submissions. Stable unique IDs protect historical stats.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Player</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">#</th>
                  <th className="py-2.5 px-4">Player Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Batting Style</th>
                  <th className="py-2.5 px-3">Bowling Style</th>
                  <th className="py-2.5 px-3 text-right">Runs</th>
                  <th className="py-2.5 px-3 text-right">Wickets</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRoster.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                      #{p.jerseyNumber || '-'}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {p.name}
                      {p.id === myTeam.captainId && (
                        <span className="text-amber-600 text-[10px] ml-1.5 font-bold uppercase">(C)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-700">{p.role}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.battingStyle || 'Right-hand bat'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.bowlingStyle || 'None'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{p.stats.runs}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-purple-700">{p.stats.wickets}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => removePlayerFromRoster(p.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Deactivate player (preserves historical match records)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: MATCH-SPECIFIC LINEUP SUBMISSION */}
      {activeTab === 'lineups' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Submit Match Playing XI</h3>
                <p className="text-xs text-slate-500">
                  Select precisely 11 players from your roster for the upcoming match. Umpire validates this lineup prior to coin toss.
                </p>
              </div>

              {/* Match selector */}
              {upcomingMatches.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Select Match:</span>
                  <select
                    value={selectedMatchId}
                    onChange={(e) => setSelectedMatchId(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold border rounded-lg bg-white"
                  >
                    {upcomingMatches.map((m) => (
                      <option key={m.id} value={m.id}>
                        Match #{m.matchNumber}: {m.team1Short} vs {m.team2Short} ({m.date})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {lineupSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{lineupSuccessMsg}</span>
              </div>
            )}

            {currentLineupRecord && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500">Previous Submission on Record:</span>{' '}
                  <strong className="text-slate-900">
                    {currentLineupRecord.playingXI.length} Playing XI Players + {currentLineupRecord.substitutes.length} Substitutes
                  </strong>
                </div>
                <span className="text-[11px] text-slate-400">
                  Submitted by {currentLineupRecord.submittedBy}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmitLineup} className="space-y-6">
              {/* Counter status */}
              <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="font-semibold text-slate-700">Playing XI Selected:</span>{' '}
                  <strong className={`text-sm ${selectedPlayingXI.length === 11 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedPlayingXI.length} / 11 Players
                  </strong>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Substitutes Selected:</span>{' '}
                  <strong className="text-sm text-slate-900">{selectedSubs.length} Players</strong>
                </div>
              </div>

              {/* Roster selection grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {myRoster.map((player) => {
                  const isPlaying = selectedPlayingXI.includes(player.id);
                  const isSub = selectedSubs.includes(player.id);

                  return (
                    <div
                      key={player.id}
                      className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                        isPlaying
                          ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400/30'
                          : isSub
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>#{player.jerseyNumber || '-'}</span>
                          <span>{player.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 capitalize">{player.role}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePlayerInPlayingXI(player.id)}
                          className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                            isPlaying
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isPlaying ? 'XI ✓' : '+ XI'}
                        </button>

                        <button
                          type="button"
                          onClick={() => togglePlayerInSubs(player.id)}
                          className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                            isSub
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSub ? 'Sub ✓' : '+ Sub'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  type="submit"
                  disabled={selectedPlayingXI.length !== 11}
                  className={`px-6 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                    selectedPlayingXI.length === 11
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Submit Official Match Lineup</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: MATCH HISTORY */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <h2 className="font-bold text-base text-slate-900">Team Match History & Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myMatches.map((m) => (
              <div key={m.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Match #{m.matchNumber} · {m.date} at {m.time}</span>
                  <span className="uppercase font-bold text-slate-700">{m.status}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {m.team1Name} vs {m.team2Name}
                </h4>
                <div className="text-slate-600">Venue: {m.venue}</div>
                {m.resultString && (
                  <div className="p-2 bg-slate-50 rounded text-emerald-800 font-semibold text-[11px]">
                    Result: {m.resultString}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD PLAYER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900 border-b pb-2">Add Player to Team Squad</h3>
            <form onSubmit={handleAddPlayer} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Player Full Name *</label>
                <input
                  type="text"
                  required
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  placeholder="e.g. S. Venkatesh"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jersey Number</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={newPlayer.jerseyNumber}
                    onChange={(e) => setNewPlayer({ ...newPlayer, jerseyNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Playing Role</label>
                  <select
                    value={newPlayer.role}
                    onChange={(e) => setNewPlayer({ ...newPlayer, role: e.target.value as PlayerRole })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="batter">Batter</option>
                    <option value="bowler">Bowler</option>
                    <option value="all-rounder">All-Rounder</option>
                    <option value="wicketkeeper-batter">Wicketkeeper-Batter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batting Style</label>
                  <select
                    value={newPlayer.battingStyle}
                    onChange={(e) => setNewPlayer({ ...newPlayer, battingStyle: e.target.value as BattingStyle })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Right-hand bat">Right-hand bat</option>
                    <option value="Left-hand bat">Left-hand bat</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bowling Style</label>
                  <select
                    value={newPlayer.bowlingStyle}
                    onChange={(e) => setNewPlayer({ ...newPlayer, bowlingStyle: e.target.value as BowlingStyle })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Right-arm medium">Right-arm medium</option>
                    <option value="Right-arm fast">Right-arm fast</option>
                    <option value="Right-arm off-break">Right-arm off-break</option>
                    <option value="Right-arm leg-break">Right-arm leg-break</option>
                    <option value="Left-arm fast">Left-arm fast</option>
                    <option value="Left-arm orthodox">Left-arm orthodox</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Add Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
