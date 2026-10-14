import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Tournament,
  Team,
  Player,
  Venue,
  Match,
  DeliveryEvent,
  Announcement,
  AuditLogItem,
  UserProfile,
  UserRole,
  StandingsRow,
  TossRecord,
  LineupPlayer,
  InningsData,
  BatterInningsStats,
  BowlerInningsStats,
  MatchLineup,
} from '../types/cricket';
import {
  INITIAL_TOURNAMENT,
  INITIAL_TEAMS,
  INITIAL_PLAYERS,
  INITIAL_VENUES,
  INITIAL_MATCHES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DELIVERIES,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';
import { calculateStandings, calculateRunRate, calculateRequiredRunRate, formatOvers } from '../utils/cricketRules';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  validateFirestoreConnection,
} from '../firebase/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

interface CricketContextType {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  teams: Team[];
  players: Player[];
  venues: Venue[];
  matches: Match[];
  deliveries: DeliveryEvent[];
  announcements: Announcement[];
  auditLogs: AuditLogItem[];
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  isFirebaseConnected: boolean;
  firebaseProjectId: string;
  standings: StandingsRow[];
  liveMatches: Match[];
  upcomingMatches: Match[];
  completedMatches: Match[];
  userRole: UserRole;

  // Real Firebase Auth Actions
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    pass: string,
    role: UserRole,
    extra?: { teamId?: string; umpireId?: string; displayName?: string }
  ) => Promise<void>;
  logoutFirebase: () => Promise<void>;

  // Role Switcher & Mock Logout
  switchRole: (role: UserRole, details?: Partial<UserProfile>) => void;
  logout: () => void;

  // Organizer Actions
  createTournament: (data: Omit<Tournament, 'id' | 'createdAt'>) => Promise<Tournament>;
  updateTournament: (id: string, updates: Partial<Tournament>) => Promise<void>;
  createTeam: (data: Omit<Team, 'id' | 'createdAt' | 'status'>) => Promise<Team>;
  updateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  scheduleMatch: (data: Omit<Match, 'id' | 'createdAt' | 'updatedAt' | 'currentInningsNumber'>) => Promise<Match>;
  addVenue: (venue: Omit<Venue, 'id'>) => Promise<Venue>;
  addAnnouncement: (data: Omit<Announcement, 'id' | 'date'>) => Promise<Announcement>;
  seedPKPLDataToFirestore: () => Promise<void>;

  // Captain Actions
  addPlayerToRoster: (teamId: string, player: Omit<Player, 'id' | 'teamId' | 'stats' | 'createdAt'>) => Promise<Player>;
  updatePlayer: (id: string, updates: Partial<Player>) => Promise<void>;
  removePlayerFromRoster: (id: string) => Promise<void>;
  submitMatchLineup: (matchId: string, teamId: string, playingXI: LineupPlayer[], substitutes: LineupPlayer[]) => Promise<void>;
  getMatchLineup: (matchId: string, teamId: string) => MatchLineup | null;

  // Umpire Actions
  recordToss: (matchId: string, toss: Omit<TossRecord, 'recordedAt' | 'umpireId' | 'umpireName'>) => Promise<void>;
  startMatch: (matchId: string) => Promise<void>;
  startSecondInnings: (matchId: string) => Promise<void>;
  recordDelivery: (params: {
    matchId: string;
    batterRuns: number;
    extraType?: 'wide' | 'no-ball' | 'bye' | 'leg-bye';
    extraRuns?: number;
    isWicket?: boolean;
    wicketType?: 'bowled' | 'caught' | 'lbw' | 'run-out' | 'stumped' | 'hit-wicket' | 'retired-hurt';
    dismissedBatterId?: string;
    fielderName?: string;
    incomingBatterId?: string;
    commentary?: string;
  }) => Promise<void>;
  undoLastDelivery: (matchId: string) => Promise<void>;
  finalizeMatchResult: (matchId: string, winnerTeamId?: string, resultString?: string) => Promise<void>;

  // Helpers
  getMatchById: (id: string) => Match | undefined;
  getTeamById: (id: string) => Team | undefined;
  getPlayerById: (id: string) => Player | undefined;
  getDeliveriesForMatch: (matchId: string, inningsNumber?: 1 | 2) => DeliveryEvent[];
  resetToSampleData: () => void;
  clearAllToEmptyState: () => void;
}

const CricketDataContext = createContext<CricketContextType | undefined>(undefined);

export const CricketDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for cricket data
  const [tournaments, setTournaments] = useState<Tournament[]>([INITIAL_TOURNAMENT]);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [deliveries, setDeliveries] = useState<DeliveryEvent[]>(INITIAL_DELIVERIES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [lineups, setLineups] = useState<Record<string, MatchLineup>>({});

  // Auth & Connection State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const firebaseProjectId = 'pkpl-d4252';

  // 1. Validate connection and establish real-time Firestore listeners for all public spectator data
  useEffect(() => {
    validateFirestoreConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });

    // Listen to Tournaments collection
    const unsubTournaments = onSnapshot(
      collection(db, 'tournaments'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as Tournament);
          setTournaments(loaded);
        }
      },
      (error) => {
        console.warn('Firestore tournaments listener error:', error.message);
      }
    );

    // Listen to Teams collection
    const unsubTeams = onSnapshot(
      collection(db, 'teams'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as Team);
          setTeams(loaded);
        }
      },
      (error) => {
        console.warn('Firestore teams listener error:', error.message);
      }
    );

    // Listen to Players collection
    const unsubPlayers = onSnapshot(
      collection(db, 'players'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as Player);
          setPlayers(loaded);
        }
      },
      (error) => {
        console.warn('Firestore players listener error:', error.message);
      }
    );

    // Listen to Venues collection
    const unsubVenues = onSnapshot(
      collection(db, 'venues'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as Venue);
          setVenues(loaded);
        }
      },
      (error) => {
        console.warn('Firestore venues listener error:', error.message);
      }
    );

    // Listen to Matches collection (live scoreboards, schedules, results)
    const unsubMatches = onSnapshot(
      collection(db, 'matches'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as Match);
          setMatches(loaded);
        }
      },
      (error) => {
        console.warn('Firestore matches listener error:', error.message);
      }
    );

    // Listen to Announcements collection
    const unsubAnnouncements = onSnapshot(
      collection(db, 'announcements'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data() as Announcement);
          setAnnouncements(loaded);
        }
      },
      (error) => {
        console.warn('Firestore announcements listener error:', error.message);
      }
    );

    return () => {
      unsubTournaments();
      unsubTeams();
      unsubPlayers();
      unsubVenues();
      unsubMatches();
      unsubAnnouncements();
    };
  }, []);

  // 2. Real-time Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setIsAuthReady(true);

      if (fbUser) {
        try {
          // Check if user has a profile document in Firestore
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          // Bootstrap project owner/admin email as organizer
          const isOwnerEmail = fbUser.email?.toLowerCase() === 'pk2k24.in@gmail.com';

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserProfile;
            setCurrentUser({
              ...data,
              email: fbUser.email || data.email,
              role: isOwnerEmail ? 'organizer' : data.role,
            });
          } else {
            // New authenticated user profile
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || 'user@pkpl.org',
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'PKPL Member',
              role: isOwnerEmail ? 'organizer' : 'spectator',
              createdAt: new Date().toISOString(),
            };
            // Try saving to Firestore
            try {
              await setDoc(userDocRef, newProfile);
            } catch (err) {
              console.warn('Could not auto-write new user profile doc:', err);
            }
            setCurrentUser(newProfile);
          }
        } catch (err) {
          console.warn('Error reading user profile from Firestore:', err);
          setCurrentUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Official',
            role: fbUser.email?.toLowerCase() === 'pk2k24.in@gmail.com' ? 'organizer' : 'spectator',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        // Logged out spectator
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const userRole: UserRole = currentUser?.role || 'spectator';

  // Audit logger
  const logAudit = (
    entityType: AuditLogItem['entityType'],
    entityId: string,
    action: string,
    details: string
  ) => {
    const item: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      performedBy: currentUser ? currentUser.displayName : 'Official',
      userRole,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [item, ...prev].slice(0, 100));
  };

  // Switch demo persona or dev role
  const switchRole = (role: UserRole, details?: Partial<UserProfile>) => {
    const demoProfiles: Record<UserRole, UserProfile> = {
      organizer: {
        uid: auth.currentUser?.uid || 'usr-org-1',
        email: auth.currentUser?.email || 'organizer@pkpl.org',
        displayName: auth.currentUser?.displayName || 'K. Venkat Reddy (Tournament Director)',
        role: 'organizer',
        createdAt: '2026-09-01T00:00:00Z',
      },
      umpire: {
        uid: auth.currentUser?.uid || 'usr-ump-1',
        email: auth.currentUser?.email || 'ramakrishna.umpire@pkpl.org',
        displayName: 'S. Ramakrishna (Match Referee & Chief Umpire)',
        role: 'umpire',
        umpireId: 'ump-1',
        createdAt: '2026-09-01T00:00:00Z',
      },
      captain: {
        uid: auth.currentUser?.uid || 'usr-cap-1',
        email: auth.currentUser?.email || 'mahesh.pkr@pkpl.org',
        displayName: 'K. Mahesh Reddy (Cap: Pedda Kannali Royals)',
        role: 'captain',
        teamId: 'team-pkr',
        createdAt: '2026-09-01T00:00:00Z',
      },
      spectator: {
        uid: 'spectator',
        email: 'spectator@pkpl.org',
        displayName: 'Cricket Spectator',
        role: 'spectator',
        createdAt: '2026-09-01T00:00:00Z',
      },
    };

    const base = demoProfiles[role];
    const updated = { ...base, ...details };
    setCurrentUser(role === 'spectator' ? null : updated);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Real Firebase Auth Functions
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (emailInput: string, passwordInput: string) => {
    try {
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    }
  };

  const registerWithEmail = async (
    emailInput: string,
    passwordInput: string,
    role: UserRole,
    extra?: { teamId?: string; umpireId?: string; displayName?: string }
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
      const isOwner = emailInput.toLowerCase() === 'pk2k24.in@gmail.com';
      const profile: UserProfile = {
        uid: cred.user.uid,
        email: emailInput,
        displayName: extra?.displayName || emailInput.split('@')[0],
        role: isOwner ? 'organizer' : role,
        teamId: extra?.teamId,
        umpireId: extra?.umpireId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      setCurrentUser(profile);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logoutFirebase = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Push official PKPL seed data to Cloud Firestore
  const seedPKPLDataToFirestore = async () => {
    try {
      // 1. Tournaments
      await setDoc(doc(db, 'tournaments', INITIAL_TOURNAMENT.id), INITIAL_TOURNAMENT);

      // 2. Venues
      for (const v of INITIAL_VENUES) {
        await setDoc(doc(db, 'venues', v.id), v);
      }

      // 3. Teams
      for (const t of INITIAL_TEAMS) {
        await setDoc(doc(db, 'teams', t.id), t);
      }

      // 4. Players
      for (const p of INITIAL_PLAYERS) {
        await setDoc(doc(db, 'players', p.id), p);
      }

      // 5. Matches
      for (const m of INITIAL_MATCHES) {
        await setDoc(doc(db, 'matches', m.id), m);
      }

      // 6. Announcements
      for (const a of INITIAL_ANNOUNCEMENTS) {
        await setDoc(doc(db, 'announcements', a.id), a);
      }

      logAudit('tournament', INITIAL_TOURNAMENT.id, 'SEED_FIRESTORE', 'Populated PKPL Season 4 data to Cloud Firestore.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tournaments');
    }
  };

  // Current active tournament
  const currentTournament = useMemo(() => {
    return tournaments.find((t) => t.status === 'ongoing') || tournaments[0] || null;
  }, [tournaments]);

  // Derived match lists
  const liveMatches = useMemo(() => {
    return matches.filter((m) => m.status === 'live' || m.status === 'innings_break');
  }, [matches]);

  const upcomingMatches = useMemo(() => {
    return matches.filter(
      (m) => m.status === 'scheduled' || m.status === 'lineup_submitted' || m.status === 'ready' || m.status === 'draft'
    );
  }, [matches]);

  const completedMatches = useMemo(() => {
    return matches.filter((m) => m.status === 'completed');
  }, [matches]);

  // Derived dynamic points table
  const standings = useMemo(() => {
    return calculateStandings(teams, matches);
  }, [matches, teams]);

  // Organizer: Create Tournament
  const createTournament = async (data: Omit<Tournament, 'id' | 'createdAt'>): Promise<Tournament> => {
    const id = `pkpl-${Date.now()}`;
    const newTourn: Tournament = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'tournaments', id), newTourn);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tournaments/${id}`);
    }
    setTournaments((prev) => [newTourn, ...prev]);
    logAudit('tournament', id, 'CREATE_TOURNAMENT', `Created tournament "${data.name}" (${data.season})`);
    return newTourn;
  };

  const updateTournament = async (id: string, updates: Partial<Tournament>) => {
    try {
      await updateDoc(doc(db, 'tournaments', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tournaments/${id}`);
    }
    setTournaments((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    logAudit('tournament', id, 'UPDATE_TOURNAMENT', `Updated tournament settings`);
  };

  // Organizer: Create Team
  const createTeam = async (data: Omit<Team, 'id' | 'createdAt' | 'status'>): Promise<Team> => {
    const id = `team-${data.shortName.toLowerCase()}-${Date.now().toString(36)}`;
    const newTeamObj: Team = {
      ...data,
      id,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'teams', id), newTeamObj);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `teams/${id}`);
    }
    setTeams((prev) => [...prev, newTeamObj]);
    logAudit('team', id, 'CREATE_TEAM', `Registered team "${data.name}" (${data.shortName})`);
    return newTeamObj;
  };

  const updateTeam = async (id: string, updates: Partial<Team>) => {
    try {
      await updateDoc(doc(db, 'teams', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `teams/${id}`);
    }
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    logAudit('team', id, 'UPDATE_TEAM', `Updated team profile for ID: ${id}`);
  };

  // Organizer: Schedule Match
  const scheduleMatch = async (
    data: Omit<Match, 'id' | 'createdAt' | 'updatedAt' | 'currentInningsNumber'>
  ): Promise<Match> => {
    const id = `match-${data.matchNumber}-${Date.now().toString(36)}`;
    const newMatchObj: Match = {
      ...data,
      id,
      currentInningsNumber: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'matches', id), newMatchObj);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `matches/${id}`);
    }
    setMatches((prev) => [...prev, newMatchObj]);
    logAudit('match', id, 'SCHEDULE_MATCH', `Scheduled Match #${data.matchNumber}: ${data.team1Short} vs ${data.team2Short}`);
    return newMatchObj;
  };

  // Organizer: Add Venue
  const addVenue = async (venueData: Omit<Venue, 'id'>): Promise<Venue> => {
    const id = `venue-${Date.now().toString(36)}`;
    const venueObj: Venue = { ...venueData, id };
    try {
      await setDoc(doc(db, 'venues', id), venueObj);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `venues/${id}`);
    }
    setVenues((prev) => [...prev, venueObj]);
    logAudit('venue', id, 'ADD_VENUE', `Added venue ${venueData.name}`);
    return venueObj;
  };

  // Organizer: Add Announcement
  const addAnnouncement = async (data: Omit<Announcement, 'id' | 'date'>): Promise<Announcement> => {
    const id = `ann-${Date.now()}`;
    const annObj: Announcement = {
      ...data,
      id,
      date: new Date().toISOString().split('T')[0],
    };
    try {
      await setDoc(doc(db, 'announcements', id), annObj);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `announcements/${id}`);
    }
    setAnnouncements((prev) => [annObj, ...prev]);
    logAudit('announcement', id, 'POST_ANNOUNCEMENT', `Published announcement: "${data.title}"`);
    return annObj;
  };

  // Captain: Add Player to Roster
  const addPlayerToRoster = async (
    teamId: string,
    playerData: Omit<Player, 'id' | 'teamId' | 'stats' | 'createdAt'>
  ): Promise<Player> => {
    const id = `p-${teamId.replace('team-', '')}-${Date.now().toString(36)}`;
    const newPlayer: Player = {
      ...playerData,
      id,
      teamId,
      createdAt: new Date().toISOString(),
      stats: {
        matches: 0,
        innings: 0,
        runs: 0,
        highestScore: 0,
        average: 0,
        strikeRate: 0,
        fifties: 0,
        hundreds: 0,
        wickets: 0,
        bowlingAverage: 0,
        economyRate: 0,
        bestBowling: '-',
        catches: 0,
        stumpings: 0,
      },
    };
    try {
      await setDoc(doc(db, 'players', id), newPlayer);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `players/${id}`);
    }
    setPlayers((prev) => [...prev, newPlayer]);
    logAudit('player', id, 'ADD_PLAYER', `Added player ${newPlayer.name} to roster (${teamId})`);
    return newPlayer;
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    try {
      await updateDoc(doc(db, 'players', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `players/${id}`);
    }
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    logAudit('player', id, 'UPDATE_PLAYER', `Updated player details for ID: ${id}`);
  };

  const removePlayerFromRoster = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'players', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `players/${id}`);
    }
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    logAudit('player', id, 'REMOVE_PLAYER', `Removed player ID: ${id} from team roster`);
  };

  // Captain: Submit Match Lineup
  const submitMatchLineup = async (
    matchId: string,
    teamId: string,
    playingXI: LineupPlayer[],
    substitutes: LineupPlayer[]
  ) => {
    const lineupId = `${matchId}_${teamId}`;
    const lineup: MatchLineup = {
      id: lineupId,
      matchId,
      teamId,
      playingXI,
      substitutes,
      submittedAt: new Date().toISOString(),
      submittedBy: currentUser?.displayName || 'Captain',
      isLocked: true,
    };

    try {
      await setDoc(doc(db, 'matches', matchId, 'lineups', teamId), lineup);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `matches/${matchId}/lineups/${teamId}`);
    }

    setLineups((prev) => ({ ...prev, [lineupId]: lineup }));

    // Check if both teams have submitted lineups to advance match status
    const match = matches.find((m) => m.id === matchId);
    if (match) {
      const otherTeamId = match.team1Id === teamId ? match.team2Id : match.team1Id;
      const otherLineupKey = `${matchId}_${otherTeamId}`;
      const bothReady = Boolean(lineups[otherLineupKey]);

      const newStatus = bothReady ? 'ready' : 'lineup_submitted';
      try {
        await updateDoc(doc(db, 'matches', matchId), {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not update match status on lineup submission:', err);
      }

      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : m
        )
      );
    }

    logAudit('match', matchId, 'SUBMIT_LINEUP', `Submitted playing XI for team ${teamId}`);
  };

  const getMatchLineup = (matchId: string, teamId: string): MatchLineup | null => {
    return lineups[`${matchId}_${teamId}`] || null;
  };

  // Umpire: Record Toss
  const recordToss = async (
    matchId: string,
    tossData: Omit<TossRecord, 'recordedAt' | 'umpireId' | 'umpireName'>
  ) => {
    const fullToss: TossRecord = {
      ...tossData,
      recordedAt: new Date().toISOString(),
      umpireId: currentUser?.umpireId || 'ump-1',
      umpireName: currentUser?.displayName || 'Field Umpire',
    };

    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    let batTeamId: string;
    let bowlTeamId: string;
    let batTeamName: string;
    let bowlTeamName: string;

    if (tossData.decision === 'bat') {
      batTeamId = tossData.winnerTeamId;
      bowlTeamId = match.team1Id === tossData.winnerTeamId ? match.team2Id : match.team1Id;
    } else {
      bowlTeamId = tossData.winnerTeamId;
      batTeamId = match.team1Id === tossData.winnerTeamId ? match.team2Id : match.team1Id;
    }

    batTeamName = batTeamId === match.team1Id ? match.team1Name : match.team2Name;
    bowlTeamName = bowlTeamId === match.team1Id ? match.team1Name : match.team2Name;

    const initialInnings1: InningsData = {
      inningsNumber: 1,
      battingTeamId: batTeamId,
      battingTeamName: batTeamName,
      bowlingTeamId: bowlTeamId,
      bowlingTeamName: bowlTeamName,
      totalRuns: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      isCompleted: false,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
      batters: [],
      bowlers: [],
      fallOfWickets: [],
      currentRunRate: 0,
    };

    const updates = {
      toss: fullToss,
      status: 'ready' as const,
      currentInningsNumber: 1 as const,
      innings1: initialInnings1,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'matches', matchId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    }

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, ...updates } : m))
    );

    logAudit('match', matchId, 'RECORD_TOSS', `${tossData.winnerTeamName} won toss and elected to ${tossData.decision}`);
  };

  // Umpire: Start Match (Innings 1 Live)
  const startMatch = async (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match || !match.innings1) return;

    const teamBatters = players
      .filter((p) => p.teamId === match.innings1?.battingTeamId && p.isActive)
      .slice(0, 2);
    const teamBowler = players
      .filter((p) => p.teamId === match.innings1?.bowlingTeamId && p.isActive)
      .find((p) => p.role === 'bowler' || p.role === 'all-rounder') || players[0];

    const initialBatters: BatterInningsStats[] = teamBatters.map((b, idx) => ({
      playerId: b.id,
      name: b.name,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isBatting: true,
      isStriker: idx === 0,
    }));

    const initialBowler: BowlerInningsStats = {
      playerId: teamBowler.id,
      name: teamBowler.name,
      overs: 0,
      balls: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      wides: 0,
      noBalls: 0,
      dots: 0,
      economyRate: 0,
      isCurrentBowler: true,
    };

    const updatedInnings1: InningsData = {
      ...match.innings1,
      batters: initialBatters,
      bowlers: [initialBowler],
    };

    const updates = {
      status: 'live' as const,
      innings1: updatedInnings1,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'matches', matchId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    }

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, ...updates } : m))
    );

    logAudit('match', matchId, 'START_MATCH', 'Match commenced live on field');
  };

  // Umpire: Start Second Innings
  const startSecondInnings = async (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match || !match.innings1) return;

    const batTeamId = match.innings1.bowlingTeamId;
    const bowlTeamId = match.innings1.battingTeamId;
    const batTeamName = match.innings1.bowlingTeamName;
    const bowlTeamName = match.innings1.battingTeamName;
    const target = match.innings1.totalRuns + 1;

    const teamBatters = players.filter((p) => p.teamId === batTeamId && p.isActive).slice(0, 2);
    const teamBowler = players
      .filter((p) => p.teamId === bowlTeamId && p.isActive)
      .find((p) => p.role === 'bowler' || p.role === 'all-rounder') || players[0];

    const initialBatters: BatterInningsStats[] = teamBatters.map((b, idx) => ({
      playerId: b.id,
      name: b.name,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isBatting: true,
      isStriker: idx === 0,
    }));

    const initialBowler: BowlerInningsStats = {
      playerId: teamBowler.id,
      name: teamBowler.name,
      overs: 0,
      balls: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      wides: 0,
      noBalls: 0,
      dots: 0,
      economyRate: 0,
      isCurrentBowler: true,
    };

    const innings2: InningsData = {
      inningsNumber: 2,
      battingTeamId: batTeamId,
      battingTeamName: batTeamName,
      bowlingTeamId: bowlTeamId,
      bowlingTeamName: bowlTeamName,
      totalRuns: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      isCompleted: false,
      extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
      batters: initialBatters,
      bowlers: [initialBowler],
      fallOfWickets: [],
      target,
      requiredRunRate: calculateRequiredRunRate(target, 0, 20, 0, 0) ?? undefined,
      currentRunRate: 0,
    };

    const updates = {
      status: 'live' as const,
      currentInningsNumber: 2 as const,
      innings2,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'matches', matchId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    }

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, ...updates } : m))
    );

    logAudit('match', matchId, 'START_INNINGS_2', `2nd innings started. Target: ${target} runs`);
  };

  // Umpire: Record Delivery (The Cricket Scoring Heartbeat)
  const recordDelivery = async (params: {
    matchId: string;
    batterRuns: number;
    extraType?: 'wide' | 'no-ball' | 'bye' | 'leg-bye';
    extraRuns?: number;
    isWicket?: boolean;
    wicketType?: 'bowled' | 'caught' | 'lbw' | 'run-out' | 'stumped' | 'hit-wicket' | 'retired-hurt';
    dismissedBatterId?: string;
    fielderName?: string;
    incomingBatterId?: string;
    commentary?: string;
  }) => {
    const {
      matchId,
      batterRuns,
      extraType,
      extraRuns = 0,
      isWicket = false,
      wicketType,
      dismissedBatterId,
      fielderName,
      incomingBatterId,
      commentary,
    } = params;

    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const currentInningsNum = match.currentInningsNumber;
    const currentInnings = currentInningsNum === 1 ? match.innings1 : match.innings2;
    if (!currentInnings) return;

    const isWideOrNoBall = extraType === 'wide' || extraType === 'no-ball';
    const isLegalDelivery = !isWideOrNoBall;
    const totalDeliveryRuns = batterRuns + extraRuns;

    // Active striker and bowler
    const striker = currentInnings.batters.find((b) => b.isBatting && b.isStriker) || currentInnings.batters[0];
    const nonStriker = currentInnings.batters.find((b) => b.isBatting && !b.isStriker) || currentInnings.batters[1];
    const bowler = currentInnings.bowlers.find((b) => b.isCurrentBowler) || currentInnings.bowlers[0];

    // Calculate over and ball counts
    let updatedOvers = currentInnings.overs;
    let updatedBalls = currentInnings.balls;

    if (isLegalDelivery) {
      if (updatedBalls === 5) {
        updatedOvers += 1;
        updatedBalls = 0;
      } else {
        updatedBalls += 1;
      }
    }

    const updatedTotalRuns = currentInnings.totalRuns + totalDeliveryRuns;
    let updatedWickets = currentInnings.wickets;
    if (isWicket) updatedWickets += 1;

    // Batters updates
    let updatedBatters = currentInnings.batters.map((b) => {
      if (b.playerId === striker?.playerId) {
        const addedBalls = extraType === 'wide' ? 0 : 1;
        const newRuns = b.runs + batterRuns;
        const newBalls = b.ballsFaced + addedBalls;
        const newFours = batterRuns === 4 ? b.fours + 1 : b.fours;
        const newSixes = batterRuns === 6 ? b.sixes + 1 : b.sixes;
        const newSR = newBalls > 0 ? Number(((newRuns / newBalls) * 100).toFixed(2)) : 0;

        if (isWicket && (!dismissedBatterId || dismissedBatterId === b.playerId)) {
          return {
            ...b,
            runs: newRuns,
            ballsFaced: newBalls,
            fours: newFours,
            sixes: newSixes,
            strikeRate: newSR,
            isBatting: false,
            isStriker: false,
            dismissal: {
              type: wicketType || 'bowled',
              bowlerName: bowler?.name,
              fielderName,
            },
          };
        }

        return {
          ...b,
          runs: newRuns,
          ballsFaced: newBalls,
          fours: newFours,
          sixes: newSixes,
          strikeRate: newSR,
        };
      }
      return b;
    });

    // Add incoming batter if wicket fell and batter provided
    if (isWicket && incomingBatterId) {
      const incomingPlayer = players.find((p) => p.id === incomingBatterId);
      if (incomingPlayer && !updatedBatters.some((b) => b.playerId === incomingBatterId)) {
        updatedBatters.push({
          playerId: incomingPlayer.id,
          name: incomingPlayer.name,
          runs: 0,
          ballsFaced: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isBatting: true,
          isStriker: true,
        });
      }
    }

    // Strike rotation logic
    const rotatesOnRuns = (batterRuns + (extraType === 'bye' || extraType === 'leg-bye' ? extraRuns : 0)) % 2 !== 0;
    const isEndOfOver = isLegalDelivery && updatedBalls === 0;
    const shouldSwitchEnds = rotatesOnRuns !== isEndOfOver;

    if (shouldSwitchEnds && !isWicket) {
      updatedBatters = updatedBatters.map((b) => {
        if (b.playerId === striker?.playerId) return { ...b, isStriker: false };
        if (b.playerId === nonStriker?.playerId) return { ...b, isStriker: true };
        return b;
      });
    }

    // Bowler updates
    const bowlerRunsConceded = batterRuns + (extraType === 'wide' || extraType === 'no-ball' ? extraRuns : 0);
    const updatedBowlers = currentInnings.bowlers.map((bw) => {
      if (bw.playerId === bowler?.playerId) {
        const addedBalls = isLegalDelivery ? 1 : 0;
        let newCompleteOvers = bw.overs;
        let newBallsInOver = bw.balls + addedBalls;
        if (newBallsInOver === 6) {
          newCompleteOvers += 1;
          newBallsInOver = 0;
        }

        const totalBowlerRuns = bw.runsConceded + bowlerRunsConceded;
        const totalBowlerWickets = isWicket && wicketType !== 'run-out' ? bw.wickets + 1 : bw.wickets;
        const decOvers = newCompleteOvers + newBallsInOver / 6;
        const economy = decOvers > 0 ? Number((totalBowlerRuns / decOvers).toFixed(2)) : 0;

        return {
          ...bw,
          overs: newCompleteOvers,
          balls: newBallsInOver,
          runsConceded: totalBowlerRuns,
          wickets: totalBowlerWickets,
          economyRate: economy,
          wides: extraType === 'wide' ? bw.wides + extraRuns : bw.wides,
          noBalls: extraType === 'no-ball' ? bw.noBalls + extraRuns : bw.noBalls,
          dots: totalDeliveryRuns === 0 && isLegalDelivery ? bw.dots + 1 : bw.dots,
        };
      }
      return bw;
    });

    // Extras summary
    const updatedExtras = { ...currentInnings.extras };
    if (extraType === 'wide') {
      updatedExtras.wides += extraRuns;
      updatedExtras.total += extraRuns;
    } else if (extraType === 'no-ball') {
      updatedExtras.noBalls += extraRuns;
      updatedExtras.total += extraRuns;
    } else if (extraType === 'bye') {
      updatedExtras.byes += extraRuns;
      updatedExtras.total += extraRuns;
    } else if (extraType === 'leg-bye') {
      updatedExtras.legByes += extraRuns;
      updatedExtras.total += extraRuns;
    }

    // Fall of wicket
    const updatedFOW = [...currentInnings.fallOfWickets];
    if (isWicket) {
      updatedFOW.push({
        wicketNumber: updatedWickets,
        score: updatedTotalRuns,
        overs: formatOvers(updatedOvers, updatedBalls),
        playerOutName: striker?.name || 'Batter',
      });
    }

    const currentRunRate = calculateRunRate(updatedTotalRuns, updatedOvers, updatedBalls);

    const updatedInnings: InningsData = {
      ...currentInnings,
      totalRuns: updatedTotalRuns,
      wickets: updatedWickets,
      overs: updatedOvers,
      balls: updatedBalls,
      currentRunRate,
      batters: updatedBatters,
      bowlers: updatedBowlers,
      extras: updatedExtras,
      fallOfWickets: updatedFOW,
    };

    // Auto-complete match conditions
    let newMatchStatus = match.status;
    let winnerTeamId: string | undefined = match.winnerTeamId;
    let resultString: string | undefined = match.resultString;

    if (currentInningsNum === 2 && currentInnings.target) {
      if (updatedTotalRuns >= currentInnings.target) {
        newMatchStatus = 'completed';
        winnerTeamId = currentInnings.battingTeamId;
        const wicketsRemaining = 10 - updatedWickets;
        resultString = `${currentInnings.battingTeamName} won by ${wicketsRemaining} wicket${wicketsRemaining === 1 ? '' : 's'}`;
        updatedInnings.isCompleted = true;
      } else if (updatedOvers >= match.overs || updatedWickets >= 10) {
        newMatchStatus = 'completed';
        const margin = currentInnings.target - 1 - updatedTotalRuns;
        if (margin > 0) {
          winnerTeamId = currentInnings.bowlingTeamId;
          resultString = `${currentInnings.bowlingTeamName} won by ${margin} run${margin === 1 ? '' : 's'}`;
        } else {
          resultString = 'Match Tied! (Super Over required as per PKPL rules)';
        }
        updatedInnings.isCompleted = true;
      }
    } else if (currentInningsNum === 1) {
      if (updatedOvers >= match.overs || updatedWickets >= 10) {
        newMatchStatus = 'innings_break';
        updatedInnings.isCompleted = true;
      }
    }

    // Create delivery event
    const deliveryId = `del-${matchId}-${currentInningsNum}-${Date.now()}`;
    const newDelivery: DeliveryEvent = {
      id: deliveryId,
      matchId,
      inningsNumber: currentInningsNum,
      overNumber: updatedBalls === 0 && isLegalDelivery ? updatedOvers - 1 : updatedOvers,
      ballInOver: currentInnings.balls + 1,
      legalBallNumber: updatedBalls === 0 && isLegalDelivery ? 6 : updatedBalls,
      strikerId: striker?.playerId || '',
      strikerName: striker?.name || '',
      nonStrikerId: nonStriker?.playerId || '',
      nonStrikerName: nonStriker?.name || '',
      bowlerId: bowler?.playerId || '',
      bowlerName: bowler?.name || '',
      batterRuns,
      extraType,
      extraRuns,
      totalRuns: totalDeliveryRuns,
      isLegalDelivery,
      isWicket,
      wicketType,
      dismissedBatterId,
      dismissedBatterName: striker?.name,
      fielderName,
      commentary: commentary || `${formatOvers(updatedOvers, updatedBalls)}: ${bowler?.name} to ${striker?.name}, ${totalDeliveryRuns} runs`,
      timestamp: new Date().toISOString(),
      recordedByUid: currentUser?.uid || 'official',
    };

    const matchUpdates = {
      status: newMatchStatus,
      ...(currentInningsNum === 1 ? { innings1: updatedInnings } : { innings2: updatedInnings }),
      ...(winnerTeamId ? { winnerTeamId } : {}),
      ...(resultString ? { resultString } : {}),
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore!
    try {
      await updateDoc(doc(db, 'matches', matchId), matchUpdates);
      await setDoc(doc(db, 'matches', matchId, 'deliveries', deliveryId), newDelivery);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    }

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, ...matchUpdates } : m))
    );
    setDeliveries((prev) => [newDelivery, ...prev]);

    logAudit(
      'match',
      matchId,
      'RECORD_DELIVERY',
      `Ov ${formatOvers(updatedOvers, updatedBalls)}: ${totalDeliveryRuns} runs${isWicket ? ' (WICKET!)' : ''}`
    );
  };

  // Umpire: Undo Last Delivery
  const undoLastDelivery = async (matchId: string) => {
    const matchDeliveries = deliveries.filter((d) => d.matchId === matchId && !d.isUndone);
    if (matchDeliveries.length === 0) return;

    const last = matchDeliveries[0];
    try {
      await updateDoc(doc(db, 'matches', matchId, 'deliveries', last.id), { isUndone: true });
    } catch (err) {
      console.warn('Could not mark delivery as undone in Firestore:', err);
    }

    setDeliveries((prev) =>
      prev.map((d) => (d.id === last.id ? { ...d, isUndone: true } : d))
    );
    logAudit('match', matchId, 'UNDO_DELIVERY', `Undid delivery #${last.id}`);
  };

  // Umpire: Finalize Match Result
  const finalizeMatchResult = async (matchId: string, winnerTeamId?: string, resultString?: string) => {
    const updates = {
      status: 'completed' as const,
      winnerTeamId,
      resultString,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'matches', matchId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    }

    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, ...updates } : m))
    );
    logAudit('match', matchId, 'MATCH_FINALIZED', `Match finalized with result: "${resultString}"`);
  };

  // Lookup helpers
  const getMatchById = (id: string) => matches.find((m) => m.id === id);
  const getTeamById = (id: string) => teams.find((t) => t.id === id);
  const getPlayerById = (id: string) => players.find((p) => p.id === id);
  const getDeliveriesForMatch = (matchId: string, inningsNumber?: 1 | 2) => {
    return deliveries.filter(
      (d) => d.matchId === matchId && !d.isUndone && (inningsNumber === undefined || d.inningsNumber === inningsNumber)
    );
  };

  // Sample data fallback
  const resetToSampleData = () => {
    setTournaments([INITIAL_TOURNAMENT]);
    setTeams(INITIAL_TEAMS);
    setPlayers(INITIAL_PLAYERS);
    setVenues(INITIAL_VENUES);
    setMatches(INITIAL_MATCHES);
    setDeliveries(INITIAL_DELIVERIES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setLineups({});
  };

  const clearAllToEmptyState = () => {
    setTournaments([]);
    setTeams([]);
    setPlayers([]);
    setVenues([]);
    setMatches([]);
    setDeliveries([]);
    setAnnouncements([]);
    setAuditLogs([]);
    setLineups({});
  };

  return (
    <CricketDataContext.Provider
      value={{
        tournaments,
        currentTournament,
        teams,
        players,
        venues,
        matches,
        deliveries,
        announcements,
        auditLogs,
        currentUser,
        firebaseUser,
        isAuthReady,
        isFirebaseConnected,
        firebaseProjectId,
        standings,
        liveMatches,
        upcomingMatches,
        completedMatches,
        userRole,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logoutFirebase,
        switchRole,
        logout,
        createTournament,
        updateTournament,
        createTeam,
        updateTeam,
        scheduleMatch,
        addVenue,
        addAnnouncement,
        seedPKPLDataToFirestore,
        addPlayerToRoster,
        updatePlayer,
        removePlayerFromRoster,
        submitMatchLineup,
        getMatchLineup,
        recordToss,
        startMatch,
        startSecondInnings,
        recordDelivery,
        undoLastDelivery,
        finalizeMatchResult,
        getMatchById,
        getTeamById,
        getPlayerById,
        getDeliveriesForMatch,
        resetToSampleData,
        clearAllToEmptyState,
      }}
    >
      {children}
    </CricketDataContext.Provider>
  );
};

export const useCricket = () => {
  const context = useContext(CricketDataContext);
  if (!context) {
    throw new Error('useCricket must be used within a CricketDataProvider');
  }
  return context;
};
