import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
        <h1 className="font-scoreboard text-3xl font-bold tracking-wider uppercase text-white mb-1">
          CONTACT TOURNAMENT ORGANIZERS
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Get in touch with the Pedda Kannali Premier League Governing Council for team enquiries, volunteer opportunities, and media coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            PKPL Governing Council Headquarters
          </h2>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Physical Address:</strong>
                Pedda Kannali Sports Complex, Near Sri Venugopala Swamy Temple, Pedda Kannali Village, Tirupati District, Andhra Pradesh - 517561
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Official Email:</strong>
                committee@pkpl.org / contact@pkpl.org
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Organizing Secretary Phone:</strong>
                +91 98480 54321 / +91 94401 98765
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1 text-slate-600">
            <strong className="text-slate-900 block">Match Day Emergency Umpiring Hotline:</strong>
            <p>For urgent scheduling alerts, ground conditions, or rain delays, umpires and team captains should directly message the Match Referee desk.</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h2 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Send an Inquiry to the Committee
          </h2>

          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-sm">Thank You for Reaching Out!</h3>
              <p className="text-xs text-emerald-700">
                Your message has been received by the PKPL Organizing Committee. We will get back to you shortly.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                className="mt-2 text-xs font-semibold text-emerald-900 underline cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. S. Venkat"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Inquiry Type</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Team Registration / Spectator Pass / Ground Booking"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
