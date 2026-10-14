# PKPL Firebase Security Specification & Attack Vectors (Dirty Dozen)

## Data Invariants
1. **Public Spectator Guarantee**: Anyone can read tournaments, matches, teams, players, lineups, deliveries, announcements, and venues without authenticating.
2. **Organizer Supremacy**: Only verified organizers (e.g., `pk2k24.in@gmail.com` or users with `role: 'organizer'`) can create tournaments, schedule fixtures, approve teams, and publish announcements.
3. **Assigned Umpire Constraint**: Only the designated umpire assigned to a match (or an organizer) can record deliveries, update match scores, or conclude match results. An unassigned umpire or non-official CANNOT score another match.
4. **Team Captain Autonomy**: Captains may only manage player rosters for their specific team and submit match-specific playing XIs and substitutes for their team.
5. **No Client-Side Delegation**: All role checks are enforced directly at the Firestore rule layer using `get()` and resource validation.

## The Dirty Dozen Payloads & Expected Verdict
1. **Unauthenticated Tournament Creation**: Spectator attempts `POST /tournaments` -> `PERMISSION_DENIED`.
2. **Ghost Umpire Scoring**: Authenticated Umpire A attempts `POST /matches/match-1/deliveries` for a match officiated by Umpire B -> `PERMISSION_DENIED`.
3. **Foreign Team Lineup Submission**: Captain of Team A attempts `SET /matches/match-1/lineups/team-b` -> `PERMISSION_DENIED`.
4. **Spectator Match Update**: Unauthenticated spectator attempts `UPDATE /matches/match-1` with modified runs -> `PERMISSION_DENIED`.
5. **Roster Hijacking**: Captain of Team A attempts `DELETE /players/player-team-b-1` -> `PERMISSION_DENIED`.
6. **Privilege Escalation**: Captain attempts `UPDATE /users/{uid}` with `{ role: 'organizer' }` -> `PERMISSION_DENIED`.
7. **Orphan Delivery Injection**: Unauthorized client attempts to bypass parent match rule -> `PERMISSION_DENIED`.
8. **Malicious Match Rescheduling**: Assigned Umpire attempts `UPDATE /matches/match-1` modifying `team1Id` or `team2Id` -> `PERMISSION_DENIED` (affectedKeys limited strictly to scoring/status fields).
9. **Announcement Defacement**: Captain attempts `POST /announcements` -> `PERMISSION_DENIED`.
10. **Venue Modification by Non-Admin**: Umpire attempts `UPDATE /venues/venue-1` -> `PERMISSION_DENIED`.
11. **Profile Impersonation**: User A attempts to create a profile under User B's UID -> `PERMISSION_DENIED`.
12. **Post-Match Result Tampering by Spectator**: Spectator attempts to override `winnerTeamId` -> `PERMISSION_DENIED`.
