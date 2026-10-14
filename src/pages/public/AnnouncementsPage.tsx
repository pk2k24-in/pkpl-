import React from 'react';
import { Megaphone, Pin, Calendar, Tag } from 'lucide-react';
import { useCricket } from '../../context/CricketDataContext';

export const AnnouncementsPage: React.FC = () => {
  const { announcements } = useCricket();

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
        <h1 className="font-scoreboard text-3xl font-bold tracking-wider uppercase text-white mb-1">
          TOURNAMENT ANNOUNCEMENTS & BULLETINS
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Official notifications from the PKPL Governing Committee, chief umpires, and tournament management.
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-2 max-w-lg mx-auto shadow-xs">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No Official Announcements Yet</h3>
          <p className="text-slate-400 leading-relaxed">
            Tournament committee bulletins, match schedules, weather notices, and umpire assignments will appear here as soon as they are published.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white border rounded-xl p-5 shadow-xs space-y-3 ${
              ann.isPinned ? 'border-amber-400/80 ring-1 ring-amber-400/30' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                {ann.isPinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    <Pin className="w-3 h-3" />
                    <span>Pinned Announcement</span>
                  </span>
                )}
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {ann.category}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3" />
                <span>Published: {ann.date}</span>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-slate-900 text-base leading-snug mb-1">
                {ann.title}
              </h2>
              <p className="text-xs text-slate-600 font-semibold mb-2">
                {ann.summary}
              </p>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-50">
              Issued by: <strong className="text-slate-600">{ann.author}</strong>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};
