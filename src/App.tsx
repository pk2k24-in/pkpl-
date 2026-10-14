import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CricketDataProvider } from './context/CricketDataContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Spectator Pages
import { HomePage } from './pages/public/HomePage';
import { LiveMatchesPage } from './pages/public/LiveMatchesPage';
import { FixturesPage } from './pages/public/FixturesPage';
import { ResultsPage } from './pages/public/ResultsPage';
import { PointsTablePage } from './pages/public/PointsTablePage';
import { TeamsPage } from './pages/public/TeamsPage';
import { TeamDetailsPage } from './pages/public/TeamDetailsPage';
import { PlayersPage } from './pages/public/PlayersPage';
import { PlayerProfilePage } from './pages/public/PlayerProfilePage';
import { StatsPage } from './pages/public/StatsPage';
import { AnnouncementsPage } from './pages/public/AnnouncementsPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { MatchDetailsPage } from './pages/public/MatchDetailsPage';

// Authorized Role Portals & Auth
import { LoginPage } from './pages/auth/LoginPage';
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { UmpireDashboard } from './pages/umpire/UmpireDashboard';
import { CaptainDashboard } from './pages/captain/CaptainDashboard';

export default function App() {
  return (
    <CricketDataProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            <Routes>
              {/* Public Spectator Routes (No login required) */}
              <Route path="/" element={<HomePage />} />
              <Route path="/live" element={<LiveMatchesPage />} />
              <Route path="/fixtures" element={<FixturesPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/points-table" element={<PointsTablePage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/:teamId" element={<TeamDetailsPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/players/:playerId" element={<PlayerProfilePage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/match/:matchId" element={<MatchDetailsPage />} />

              {/* Staff Login & Authorized Role Dashboards */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/organizer" element={<OrganizerDashboard />} />
              <Route path="/umpire" element={<UmpireDashboard />} />
              <Route path="/captain" element={<CaptainDashboard />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </CricketDataProvider>
  );
}
