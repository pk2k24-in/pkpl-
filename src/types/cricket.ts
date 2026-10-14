export type UserRole = 'organizer' | 'umpire' | 'captain' | 'spectator';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  teamId?: string; // For captains
  umpireId?: string; // For umpires
  phone?: string;
  createdAt: string;
}

export type PlayerRole = 'batter' | 'bowler' | 'all-rounder' | 'wicketkeeper-batter';
export type BattingStyle = 'Right-hand bat' | 'Left-hand bat';
export type BowlingStyle = 
  | 'Right-arm fast' 
  | 'Right-arm medium' 
  | 'Left-arm fast' 
  | 'Left-arm medium' 
  | 'Right-arm off-break' 
  | 'Right-arm leg-break' 
  | 'Left-arm orthodox' 
  | 'Left-arm unorthodox'
  | 'None';

export interface PlayerStats {
  matches: number;
  innings: number;
  runs: number;
  highestScore: number;
  average: number;
  strikeRate: number;
  fifties: number;
  hundreds: number;
  wickets: number;
  bowlingAverage: number;
  economyRate: number;
  bestBowling: string;
  catches: number;
  stumpings: number;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  jerseyNumber?: number;
  role: PlayerRole;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  isActive: boolean;
  avatarUrl?: string;
  stats: PlayerStats;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string; // e.g. "PKR", "KCC"
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  captainId: string;
  captainName: string;
  contactEmail: string;
  contactPhone?: string;
  description: string;
  establishedYear?: number;
  homeGround?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type TournamentFormat = 'League' | 'Knockout' | 'Group Stage + Knockout';
export type MatchFormat = 'T10' | 'T20' | '15 Overs' | 'Custom';
export type TournamentStatus = 'draft' | 'published' | 'ongoing' | 'completed';

export interface TournamentRules {
  oversPerInnings: number;
  playingXISize: number;
  maxBowlerOvers: number;
  powerplayOvers: number;
  pointsForWin: number;
  pointsForTie: number;
  pointsForNoResult: number;
  allowSubstitutes: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  season: string; // e.g. "Season 4 - 2026"
  logo?: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  format: TournamentFormat;
  matchFormat: MatchFormat;
  status: TournamentStatus;
  participatingTeamIds: string[];
  rules: TournamentRules;
  totalTeams: number;
  bannerUrl?: string;
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string;
  pitchType: 'Turf' | 'Matting' | 'Astro-Turf' | 'Concrete';
  boundarySizeMeters: number;
  capacity?: number;
}

export type MatchStatus = 
  | 'draft'
  | 'scheduled'
  | 'lineup_submitted'
  | 'ready'
  | 'live'
  | 'innings_break'
  | 'completed'
  | 'postponed'
  | 'cancelled';

export interface LineupPlayer {
  playerId: string;
  name: string;
  jerseyNumber?: number;
  role: PlayerRole;
  isCaptain?: boolean;
  isWicketkeeper?: boolean;
}

export interface MatchLineup {
  id: string;
  matchId: string;
  teamId: string;
  playingXI: LineupPlayer[];
  substitutes: LineupPlayer[];
  submittedAt: string;
  submittedBy: string;
  isLocked: boolean;
}

export interface TossRecord {
  winnerTeamId: string;
  winnerTeamName: string;
  decision: 'bat' | 'bowl';
  recordedAt: string;
  umpireId: string;
  umpireName: string;
}

export type ExtraType = 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'penalty';
export type WicketType = 
  | 'bowled' 
  | 'caught' 
  | 'lbw' 
  | 'run-out' 
  | 'stumped' 
  | 'hit-wicket' 
  | 'retired-hurt';

export interface DeliveryEvent {
  id: string;
  matchId: string;
  inningsNumber: 1 | 2;
  overNumber: number; // 0-indexed (0 = 1st over)
  ballInOver: number; // 1-indexed count in over including extras
  legalBallNumber: number; // 1..6 legal balls in current over
  strikerId: string;
  strikerName: string;
  nonStrikerId: string;
  nonStrikerName: string;
  bowlerId: string;
  bowlerName: string;
  batterRuns: number;
  extraType?: ExtraType;
  extraRuns: number;
  totalRuns: number;
  isLegalDelivery: boolean;
  isWicket: boolean;
  wicketType?: WicketType;
  dismissedBatterId?: string;
  dismissedBatterName?: string;
  fielderId?: string;
  fielderName?: string;
  commentary: string;
  timestamp: string;
  recordedByUid: string;
  isUndone?: boolean;
}

export interface BatterInningsStats {
  playerId: string;
  name: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal?: {
    type: WicketType;
    bowlerName?: string;
    fielderName?: string;
  };
  isBatting: boolean;
  isStriker?: boolean;
}

export interface BowlerInningsStats {
  playerId: string;
  name: string;
  overs: number; // complete overs
  balls: number; // balls in current over (0..5)
  maidens: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
  dots: number;
  economyRate: number;
  isCurrentBowler: boolean;
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  overs: string; // e.g. "4.3"
  playerOutName: string;
}

export interface ExtrasSummary {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  penalty: number;
  total: number;
}

export interface InningsData {
  inningsNumber: 1 | 2;
  battingTeamId: string;
  battingTeamName: string;
  bowlingTeamId: string;
  bowlingTeamName: string;
  totalRuns: number;
  wickets: number;
  overs: number; // complete overs
  balls: number; // legal balls in current over (0..5)
  isCompleted: boolean;
  extras: ExtrasSummary;
  batters: BatterInningsStats[];
  bowlers: BowlerInningsStats[];
  fallOfWickets: FallOfWicket[];
  target?: number;
  requiredRunRate?: number;
  currentRunRate: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  matchNumber: number;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  team1Short: string;
  team2Short: string;
  team1Logo?: string;
  team2Logo?: string;
  team1Color: string;
  team2Color: string;
  date: string;
  time: string;
  venue: string;
  overs: number;
  format: MatchFormat;
  status: MatchStatus;
  umpireId: string;
  umpireName: string;
  umpireEmail?: string;
  toss?: TossRecord;
  currentInningsNumber: 1 | 2;
  innings1?: InningsData;
  innings2?: InningsData;
  resultString?: string;
  winnerTeamId?: string;
  playerOfTheMatch?: {
    playerId: string;
    name: string;
    teamName: string;
    performanceText: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StandingsRow {
  teamId: string;
  teamName: string;
  teamShort: string;
  teamLogo?: string;
  teamColor: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
  netRunRate: number;
  form: ('W' | 'L' | 'T' | 'NR')[];
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  author: string;
  category: 'Tournament Update' | 'Schedule Change' | 'Rules' | 'Venue' | 'General';
  isPinned: boolean;
}

export interface AuditLogItem {
  id: string;
  entityType: 'match' | 'tournament' | 'lineup' | 'scoring' | 'team' | 'venue' | 'announcement' | 'player';
  entityId: string;
  action: string;
  performedBy: string;
  userRole: UserRole;
  timestamp: string;
  details: string;
}
