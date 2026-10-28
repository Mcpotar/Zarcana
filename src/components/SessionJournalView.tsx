import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, Check, FileText } from 'lucide-react';
import { TAROT_DECK, TarotCardData } from '../data/tarotDeck';
import {
  UserTarotSession,
  SavedReading
} from '../utils/sessionStorage';
import { TarotCardArtwork } from './TarotCardArtwork';

interface SessionJournalViewProps {
  session: UserTarotSession;
  onUpdateReadingNotes: (readingId: string, notes: string) => void;
  onDeleteReading: (readingId: string) => void;
  onImportSession: (imported: UserTarotSession) => void;
  onResetSession: () => void;
  onSelectCard: (card: TarotCardData, isReversed: boolean, positionTitle?: string) => void;
  onNavigateToTable: () => void;
}

export const SessionJournalView: React.FC<SessionJournalViewProps> = ({
  session,
  onUpdateReadingNotes,
  onDeleteReading,
  onImportSession,
  onResetSession,
  onSelectCard,
  onNavigateToTable
}) => {
  const [editingReadingId, setEditingReadingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(session, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `arcana-session-${session.sessionId.toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result || '{}')) as UserTarotSession;
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.readings)) {
          setImportStatus({
            type: 'error',
            message: 'Invalid session file format. Please choose a valid Arcana Archive JSON export.'
          });
          return;
        }
        onImportSession(parsed);
        setImportStatus({
          type: 'success',
          message: `Restored session ${parsed.sessionId || ''} with ${parsed.readings.length} readings.`
        });
      } catch {
        setImportStatus({
          type: 'error',
          message: 'Could not parse JSON file. Ensure it is an unmodified session export.'
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startEditing = (reading: SavedReading) => {
    setEditingReadingId(reading.id);
    setNoteDraft(reading.notes);
  };

  const saveEditing = (readingId: string) => {
    onUpdateReadingNotes(readingId, noteDraft);
    setEditingReadingId(null);
  };

  const dailyDrawCount = Object.keys(session.dailyDraws).length;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      {/* Header & Session Portability Controls */}
      <div className="border-b border-stone-200 pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 font-mono tabular-nums">
              Private Local Storage · Session {session.sessionId}
            </p>
            <h1
              className="mt-2 font-serif text-4xl sm:text-5xl font-semibold text-stone-900"
              style={{ textWrap: 'balance' }}
            >
              Session Reading Journal
            </h1>
            <p className="mt-3 max-w-2xl text-base text-stone-600 leading-relaxed">
              Your spreads, personal reflections, and study bookmarks are saved directly in your browser’s local storage with zero accounts, tracking, or external servers. Export a JSON backup anytime to move your session across devices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-800 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Session JSON</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-800 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import Session JSON</span>
            </button>

            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear Session</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5">
                <span className="text-xs font-medium text-red-800 whitespace-nowrap">Erase local data?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetSession();
                    setConfirmClear(false);
                  }}
                  className="rounded bg-red-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-800 whitespace-nowrap shrink-0"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="rounded bg-white px-2.5 py-1 text-xs font-medium text-stone-700 border border-stone-300 hover:bg-stone-100 whitespace-nowrap shrink-0"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {importStatus && (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-xs font-medium ${
              importStatus.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-red-300 bg-red-50 text-red-900'
            }`}
          >
            {importStatus.message}
          </div>
        )}

        {/* 4-Column Session Summary Strip */}
        <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-stone-200 bg-white p-5 sm:grid-cols-4">
          <div>
            <p className="text-xs text-stone-500">Session Identifier</p>
            <p className="mt-1 font-mono text-base font-medium text-stone-900 tabular-nums">
              {session.sessionId}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Saved Spread Readings</p>
            <p className="mt-1 font-mono text-base font-medium text-stone-900 tabular-nums">
              {session.readings.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Daily Draws Logged</p>
            <p className="mt-1 font-mono text-base font-medium text-stone-900 tabular-nums">
              {dailyDrawCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Study List Cards</p>
            <p className="mt-1 font-mono text-base font-medium text-stone-900 tabular-nums">
              {session.bookmarkedCardIds.length} / 78
            </p>
          </div>
        </div>
      </div>

      {/* Saved Readings List */}
      {session.readings.length === 0 ? (
        <div className="mt-10 rounded-xl border border-stone-200 bg-white p-12 text-center">
          <FileText className="mx-auto h-8 w-8 text-stone-400" />
          <h2 className="mt-4 font-serif text-2xl font-semibold text-stone-900">
            No spread readings saved in this session yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
            Draw cards on the Reading Table and click “Save to Session” to archive your spread layouts and personal reflections here.
          </p>
          <button
            type="button"
            onClick={onNavigateToTable}
            className="mt-6 rounded-lg bg-stone-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            Go to Reading Table
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {session.readings.map((reading) => {
            const formattedDate = new Date(reading.timestamp).toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <article
                key={reading.id}
                className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8"
              >
                <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs text-stone-500 font-mono tabular-nums">
                      <span>{formattedDate}</span>
                      <span className="mx-2" aria-hidden="true">·</span>
                      <span>{reading.spreadName}</span>
                      <span className="mx-2" aria-hidden="true">·</span>
                      <span>{reading.cards.length} {reading.cards.length === 1 ? 'Card' : 'Cards'}</span>
                    </div>
                    <h2 className="mt-1 font-serif text-2xl font-semibold text-stone-900">
                      {reading.question ? `“${reading.question}”` : reading.spreadName}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => startEditing(reading)}
                      className="text-xs font-medium text-[#78350F] hover:underline whitespace-nowrap shrink-0"
                    >
                      {reading.notes ? 'Edit Journal Note' : 'Add Journal Note'}
                    </button>
                    <span className="text-stone-300" aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => onDeleteReading(reading.id)}
                      className="text-xs text-stone-500 hover:text-red-700 transition-colors whitespace-nowrap shrink-0"
                    >
                      Delete Entry
                    </button>
                  </div>
                </div>

                {/* Cards Drawn Grid */}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {reading.cards.map((drawn) => {
                    const cardData = TAROT_DECK.find((c) => c.id === drawn.cardId);
                    if (!cardData) return null;
                    return (
                      <button
                        key={drawn.positionIndex}
                        type="button"
                        onClick={() =>
                          onSelectCard(cardData, drawn.isReversed, drawn.positionTitle)
                        }
                        className="group flex flex-col items-center text-left focus:outline-none"
                      >
                        <div className="w-28 sm:w-32 transition-transform duration-150 group-hover:-translate-y-1">
                          <TarotCardArtwork card={cardData} isReversed={drawn.isReversed} />
                        </div>
                        <p className="mt-2.5 text-center text-[11px] uppercase tracking-wider text-stone-500">
                          {drawn.positionTitle}
                        </p>
                        <p className="text-center font-serif text-base font-semibold text-stone-900 group-hover:text-[#78350F]">
                          {cardData.name}
                        </p>
                        <p className="text-center text-[11px] text-stone-500">
                          {drawn.isReversed ? 'Reversed' : 'Upright'}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Journal Note Section */}
                {editingReadingId === reading.id ? (
                  <div className="mt-6 border-t border-stone-200 pt-4 space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Personal Reading Notes
                    </label>
                    <textarea
                      rows={3}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Record your synthesis, impressions, or follow-up reflections..."
                      className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] p-3 text-sm text-stone-900 focus:border-[#78350F] focus:bg-white focus:outline-none"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingReadingId(null)}
                        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 whitespace-nowrap shrink-0"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEditing(reading.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-stone-800 whitespace-nowrap shrink-0"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  reading.notes && (
                    <div className="mt-6 border-t border-stone-200 pt-4">
                      <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
                        Personal Reflection
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-stone-700 max-w-prose whitespace-pre-line">
                        {reading.notes}
                      </p>
                    </div>
                  )
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
