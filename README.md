# PKPL — Pedda Kannali Premier League

Official tournament management, live ball-by-ball scoring, and spectator portal for the **Pedda Kannali Premier League (PKPL)**.

Exclusively dedicated to cricket. Fully responsive across desktop computers, tablets, and mobile devices.

---

## 🏏 Table of Contents
1. [Core Features & Architecture](#core-features--architecture)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Cricket Scoring Engine & NRR Rules](#cricket-scoring-engine--nrr-rules)
4. [Public Spectator Experience](#public-spectator-experience)
5. [Technology Stack](#technology-stack)
6. [Local Development & Build](#local-development--build)
7. [Firebase Configuration Guide](#firebase-configuration-guide)
8. [Firestore Security Rules](#firestore-security-rules)
9. [Testing Checklist](#testing-checklist)

---

## 1. Core Features & Architecture

- **Public Spectator Portal**: Zero registration, no logins, no mandatory email entry. Anyone can open the web app to view live scores, scorecards, fixtures, teams, and tournament standings in real time.
- **Dedicated Cricket Tournament Model**: Exclusively cricket (T20, T10, custom overs). No multi-sport clutter.
- **Ball-by-Ball Live Scoring Touch Console**: Designed for field umpires using tablets/mobile phones with big, clear touch targets:
  - Standard runs: 0 (Dot), 1, 2, 3, 4 (Boundary), 6 (Maximum)
  - Extras: Wide (+1), No-Ball (+1 / Free Hit), Bye, Leg-Bye
  - Dismissals: Bowled, Caught, LBW, Run Out, Stumped, Hit Wicket, Retired Hurt
  - Fielder credit, strike rotation on odd runs, end-of-over strike rotation, and next-bowler transitions.
  - Safe audit-preserved Undo delivery.
- **Dynamic Net Run Rate (NRR) Standings**: Computed mathematically from recorded match figures:
  $$\text{NRR} = \left(\frac{\text{Runs Scored}}{\text{Overs Faced}}\right) - \left(\frac{\text{Runs Conceded}}{\text{Overs Bowled}}\right)$$
  *(All-out innings count as full allotted overs per ICC / PKPL standards).*
- **Franchise Captain Management**: Team rosters with stable unique IDs, jersey numbers, bowling/batting styles, and independent match Playing XI submissions.
- **Organizer Dashboard**: Fixture scheduling, team approvals, venue management, announcements, and immutable audit logs.

---

## 2. User Roles & Permissions

| Role | Access Required | Capabilities |
| :--- | :--- | :--- |
| **Public Spectator** | **None** (Anonymous read-only) | View live scores, scorecards, fixtures, standings, stats, announcements |
| **Tournament Organizer** | Authorized Login | Create tournaments, approve teams, schedule matches, assign umpires, publish announcements |
| **Field Umpire** | Authorized Login | Coin toss, lineup verification, live ball-by-ball scoring, innings break, finalize results |
| **Team Captain** | Authorized Login | Add/edit squad players, manage jersey numbers, submit match-specific Playing XI (11 players) |

---

## 3. Cricket Scoring Engine & NRR Rules

### Scoring Rules
- **Legal Delivery vs Extras**: Wides and No-Balls do not advance the legal ball counter. Byes and Leg-Byes do advance the legal ball counter.
- **Bowler Figures**: Byes and Leg-Byes do not count against the bowler's runs conceded. Wides and No-Balls are charged to the bowler.
- **Strike Rotation**:
  - Odd runs (1, 3, 5) swap striker and non-striker ends.
  - Even runs (0, 2, 4, 6) keep the same batter on strike.
  - End of over (6 legal balls) switches bowling end and swaps striker.
- **Wickets**: Fall of wickets records score, wicket number, over, and dismissed player.

---

## 4. Public Spectator Experience

Public routes available without login:
- `/`: Home page with live hero, match tickers, points table preview, leaderboard, bulletins.
- `/live`: Real-time live match center with active partnerships, live CRR/RRR, and ball-by-ball feed.
- `/fixtures`: Complete scheduled match calendar with team and venue filters.
- `/results`: Completed match results, winning margins, and Player of the Match awards.
- `/points-table`: Standings with NRR, form guide, and top-4 playoff qualification indicators.
- `/teams`: Franchise roster directory with captain details and home grounds.
- `/players`: Player directory with search, role filters, and batting/bowling statistics.
- `/stats`: Orange Cap (top run scorers) and Purple Cap (top wicket takers) leaderboards.
- `/announcements`: Official committee notifications and playing condition updates.
- `/about`: PKPL cricket constitution and stadium specifications.
- `/contact`: Organizing council headquarters and match referee hotline.

---

## 5. Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Routing**: React Router v7 (`react-router-dom`)
- **Build Tool**: Vite
- **Data Persistence & Real-Time**: Firestore real-time subscriptions & reactive state with localStorage offline resilience.

---

## 6. Local Development & Build

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/example/pkpl-cricket.git
cd pkpl-cricket

# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Run TypeScript lint check
npm run lint

# Build production bundle
npm run build
```

---

## 7. Firebase Configuration Guide

When integrating with Firebase Authentication and Cloud Firestore:

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Firestore Database** in production mode.
3. Enable **Authentication** (Google Sign-In / Email Link).
4. Copy your web app credentials into `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 8. Firestore Security Rules

Deploy these rules to enforce read-only public access while strictly protecting administrative, scoring, and captain actions:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }

    // Public Collections: Anonymous Read Allowed
    match /tournaments/{tourneyId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /teams/{teamId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /players/{playerId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /fixtures/{matchId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /scoringEvents/{eventId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false; // Preserves immutable delivery history
    }

    match /announcements/{annId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Lineups: Public read once submitted, write restricted to team captain
    match /matchLineups/{lineupId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 9. Testing Checklist

- [x] **Spectator Incognito Test**: Open app in an anonymous/incognito session. All public pages (Home, Live, Fixtures, Results, Points Table, Teams, Players, Stats, Announcements, About, Contact) load without requesting login.
- [x] **Live Scoring Test**: Enter Umpire Dashboard, record coin toss, score legal deliveries (0, 1, 2, 4, 6), score extras (wides, no-balls), and record wicket dismissals. Live scoreboard updates immediately.
- [x] **Strike Rotation Test**: Odd runs switch active striker; end of over switches bowler and striker.
- [x] **Audit Trail & Undo Test**: Click "Undo Last Ball". Delivery is reverted while preserving audit history.
- [x] **Standings Engine Test**: Standings and Net Run Rate (NRR) recalculate automatically from recorded match scores.
- [x] **Captain Lineup Test**: Captain can add players to roster and submit a strict 11-player Playing XI for upcoming matches.
- [x] **Organizer Console Test**: Organizer can schedule fixtures, assign umpires, add venues, and publish tournament bulletins.
- [x] **Compilation & Lint Test**: `npm run build` and `npm run lint` pass with 0 errors.
