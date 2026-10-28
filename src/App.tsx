/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { TAROT_DECK, TarotCardData } from './data/tarotDeck';
import {
  UserTarotSession,
  loadUserSession,
  saveUserSession,
  createDefaultSession,
  SavedReading,
  DailyDrawEntry,
  SessionPreferences
} from './utils/sessionStorage';
import {
  ReadingTableView,
  fisherYatesShuffle
} from './components/ReadingTableView';
import { DailyDrawView } from './components/DailyDrawView';
import { CompendiumView } from './components/CompendiumView';
import { SessionJournalView } from './components/SessionJournalView';
import { CardDetailModal } from './components/CardDetailModal';
import { soundEngine } from './utils/sound';

type ActiveTab = 'table' | 'daily' | 'compendium' | 'journal';

interface SelectedCardState {
  card: TarotCardData;
  isReversed: boolean;
  positionTitle?: string;
  positionDescription?: string;
}

export default function App() {
  const [session, setSession] = useState<UserTarotSession>(() => loadUserSession());
  const [activeTab, setActiveTab] = useState<ActiveTab>('table');
  const [selectedModalCard, setSelectedModalCard] = useState<SelectedCardState | null>(null);

  // Ensure activeTableState is initialized with a shuffled 78-card deck
  const activeTableState = session.activeTableState || {
    spreadId: session.preferences.defaultSpreadId || 'three-time',
    question: '',
    drawnCards: [],
    notes: '',
    deckOrder: fisherYatesShuffle(TAROT_DECK.map((c) => c.id)),
    cutOffset: 0
  };

  useEffect(() => {
    saveUserSession(session);
  }, [session]);

  useEffect(() => {
    const shouldPlayAmbient =
      activeTab === 'table' && Boolean(session.preferences.ambientEnabled);
    soundEngine.setAmbientAtmosphere(shouldPlayAmbient);
    return () => {
      if (!shouldPlayAmbient) {
        soundEngine.setAmbientAtmosphere(false);
      }
    };
  }, [activeTab, session.preferences.ambientEnabled]);

  useEffect(() => {
    return () => {
      soundEngine.setAmbientAtmosphere(false);
    };
  }, []);

  const handleUpdateTableState = (
    nextTableState: NonNullable<UserTarotSession['activeTableState']>
  ) => {
    setSession((prev) => ({
      ...prev,
      activeTableState: nextTableState
    }));
  };

  const handleUpdatePreferences = (partial: Partial<SessionPreferences>) => {
    setSession((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...partial
      }
    }));
  };

  const handleSaveReadingToSession = (newReading: SavedReading) => {
    setSession((prev) => ({
      ...prev,
      readings: [newReading, ...prev.readings]
    }));
  };

  const handleSaveDailyDraw = (entry: DailyDrawEntry) => {
    setSession((prev) => ({
      ...prev,
      dailyDraws: {
        ...prev.dailyDraws,
        [entry.date]: entry
      }
    }));
  };

  const handleToggleBookmark = (cardId: string) => {
    setSession((prev) => {
      const exists = prev.bookmarkedCardIds.includes(cardId);
      const nextIds = exists
        ? prev.bookmarkedCardIds.filter((id) => id !== cardId)
        : [...prev.bookmarkedCardIds, cardId];
      return {
        ...prev,
        bookmarkedCardIds: nextIds
      };
    });
  };

  const handleUpdateReadingNotes = (readingId: string, notes: string) => {
    setSession((prev) => ({
      ...prev,
      readings: prev.readings.map((r) =>
        r.id === readingId ? { ...r, notes } : r
      )
    }));
  };

  const handleDeleteReading = (readingId: string) => {
    setSession((prev) => ({
      ...prev,
      readings: prev.readings.filter((r) => r.id !== readingId)
    }));
  };

  const handleImportSession = (imported: UserTarotSession) => {
    const defaults = createDefaultSession();
    setSession({
      sessionId: imported.sessionId || defaults.sessionId,
      createdAt: imported.createdAt || defaults.createdAt,
      updatedAt: new Date().toISOString(),
      preferences: {
        ...defaults.preferences,
        ...(imported.preferences || {})
      },
      readings: Array.isArray(imported.readings) ? imported.readings : [],
      dailyDraws:
        imported.dailyDraws && typeof imported.dailyDraws === 'object'
          ? imported.dailyDraws
          : {},
      bookmarkedCardIds: Array.isArray(imported.bookmarkedCardIds)
        ? imported.bookmarkedCardIds
        : defaults.bookmarkedCardIds,
      activeTableState: imported.activeTableState || null
    });
  };

  const handleResetSession = () => {
    const fresh = createDefaultSession();
    setSession(fresh);
  };

  const handleStartFreshReading = () => {
    soundEngine.playShuffle(session.preferences.soundEnabled);
    setActiveTab('table');
    handleUpdateTableState({
      spreadId: activeTableState.spreadId,
      question: '',
      drawnCards: [],
      notes: '',
      deckOrder: fisherYatesShuffle(TAROT_DECK.map((c) => c.id)),
      cutOffset: 0
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-stone-200 bg-[#FBF9F5]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#reading-table"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('table');
          }}
          className="font-serif text-2xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0"
        >
          Arcana Archive
        </a>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-stone-600 overflow-x-auto">
          <a
            href="#reading-table"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('table');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'table'
                ? 'text-stone-900 underline underline-offset-8 decoration-[#78350F] decoration-2'
                : 'hover:text-stone-900 hover:underline underline-offset-8'
            }`}
          >
            Reading Table
          </a>
          <a
            href="#daily-draw"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('daily');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'daily'
                ? 'text-stone-900 underline underline-offset-8 decoration-[#78350F] decoration-2'
                : 'hover:text-stone-900 hover:underline underline-offset-8'
            }`}
          >
            Daily Draw
          </a>
          <a
            href="#compendium"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('compendium');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'compendium'
                ? 'text-stone-900 underline underline-offset-8 decoration-[#78350F] decoration-2'
                : 'hover:text-stone-900 hover:underline underline-offset-8'
            }`}
          >
            78-Card Compendium
          </a>
          <a
            href="#session-journal"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('journal');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'journal'
                ? 'text-stone-900 underline underline-offset-8 decoration-[#78350F] decoration-2'
                : 'hover:text-stone-900 hover:underline underline-offset-8'
            }`}
          >
            Session Journal ({session.readings.length})
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleStartFreshReading}
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            New Reading
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'table' && (
          <ReadingTableView
            preferences={session.preferences}
            activeTableState={activeTableState}
            onUpdateTableState={handleUpdateTableState}
            onUpdatePreferences={handleUpdatePreferences}
            onSaveReadingToSession={handleSaveReadingToSession}
            onSelectCard={(card, isReversed, positionTitle, positionDescription) =>
              setSelectedModalCard({
                card,
                isReversed,
                positionTitle,
                positionDescription
              })
            }
          />
        )}

        {activeTab === 'daily' && (
          <DailyDrawView
            dailyDraws={session.dailyDraws}
            allowReversals={session.preferences.allowReversals}
            reversalProbability={session.preferences.reversalProbability}
            soundEnabled={session.preferences.soundEnabled}
            onSaveDailyDraw={handleSaveDailyDraw}
            onSelectCard={(card, isReversed) =>
              setSelectedModalCard({ card, isReversed })
            }
          />
        )}

        {activeTab === 'compendium' && (
          <CompendiumView
            bookmarkedCardIds={session.bookmarkedCardIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectCard={(card) =>
              setSelectedModalCard({ card, isReversed: false })
            }
          />
        )}

        {activeTab === 'journal' && (
          <SessionJournalView
            session={session}
            onUpdateReadingNotes={handleUpdateReadingNotes}
            onDeleteReading={handleDeleteReading}
            onImportSession={handleImportSession}
            onResetSession={handleResetSession}
            onSelectCard={(card, isReversed, positionTitle) =>
              setSelectedModalCard({ card, isReversed, positionTitle })
            }
            onNavigateToTable={() => setActiveTab('table')}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="mt-16 border-t border-stone-200 bg-[#FBF9F5] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-stone-500">
          <div>
            <span>Arcana Archive · Complete 78-Card Rider-Waite-Smith Standard</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>100% Free, Ad-Free & No Sign-Up Required</span>
          </div>
          <div className="font-mono tabular-nums">
            <span>Local Browser Session: {session.sessionId}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveTab('journal')}
              className="font-sans text-[#78350F] hover:underline whitespace-nowrap shrink-0"
            >
              Manage or Export Session Data
            </button>
          </div>
        </div>
      </footer>

      {/* Card Detail Monograph Modal */}
      <CardDetailModal
        card={selectedModalCard?.card || null}
        initialReversed={selectedModalCard?.isReversed || false}
        positionLabel={selectedModalCard?.positionTitle}
        positionDescription={selectedModalCard?.positionDescription}
        isBookmarked={
          selectedModalCard
            ? session.bookmarkedCardIds.includes(selectedModalCard.card.id)
            : false
        }
        onToggleBookmark={handleToggleBookmark}
        onClose={() => setSelectedModalCard(null)}
      />
    </div>
  );
}
