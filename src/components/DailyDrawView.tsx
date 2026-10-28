import React, { useState } from 'react';
import { RotateCcw, Sparkles, Check } from 'lucide-react';
import { TAROT_DECK, TarotCardData } from '../data/tarotDeck';
import { DailyDrawEntry, getTodayDateKey } from '../utils/sessionStorage';
import { TarotCardArtwork, TarotCardBack } from './TarotCardArtwork';
import { soundEngine } from '../utils/sound';

interface DailyDrawViewProps {
  dailyDraws: Record<string, DailyDrawEntry>;
  allowReversals: boolean;
  reversalProbability: number;
  soundEnabled: boolean;
  onSaveDailyDraw: (entry: DailyDrawEntry) => void;
  onSelectCard: (card: TarotCardData, isReversed: boolean) => void;
}

export const DailyDrawView: React.FC<DailyDrawViewProps> = ({
  dailyDraws,
  allowReversals,
  reversalProbability,
  soundEnabled,
  onSaveDailyDraw,
  onSelectCard
}) => {
  const todayKey = getTodayDateKey();
  const todayEntry = dailyDraws[todayKey] || null;

  const [reflectionDraft, setReflectionDraft] = useState(todayEntry?.reflection || '');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleDrawToday = () => {
    soundEngine.playFlip(soundEnabled);
    const randomIndex = Math.floor(Math.random() * TAROT_DECK.length);
    const chosen = TAROT_DECK[randomIndex];
    const isReversed = allowReversals ? Math.random() < reversalProbability : false;

    const newEntry: DailyDrawEntry = {
      date: todayKey,
      cardId: chosen.id,
      isReversed,
      reflection: '',
      timestamp: new Date().toISOString()
    };
    setReflectionDraft('');
    onSaveDailyDraw(newEntry);
  };

  const handleRedrawToday = () => {
    soundEngine.playShuffle(soundEnabled);
    handleDrawToday();
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todayEntry) return;
    onSaveDailyDraw({
      ...todayEntry,
      reflection: reflectionDraft
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const todayCard = todayEntry ? TAROT_DECK.find((c) => c.id === todayEntry.cardId) || null : null;
  const pastEntries = (Object.values(dailyDraws) as DailyDrawEntry[])
    .filter((entry) => entry.date !== todayKey)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="border-b border-stone-200 pb-8">
        <p className="text-xs uppercase tracking-widest text-stone-500 font-mono tabular-nums">
          Daily Contemplation · {todayKey}
        </p>
        <h1
          className="mt-2 font-serif text-4xl sm:text-5xl font-semibold text-stone-900"
          style={{ textWrap: 'balance' }}
        >
          Daily Card of the Day
        </h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600 leading-relaxed">
          Draw a single focal card each day to anchor your reflection. Your daily draw and personal notes are stored privately in your browser session.
        </p>
      </div>

      {/* Main Today Section */}
      {!todayEntry || !todayCard ? (
        <div className="mt-10 grid grid-cols-1 gap-10 rounded-xl border border-stone-200 bg-white p-8 sm:p-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 flex flex-col items-center">
            <button
              type="button"
              onClick={handleDrawToday}
              className="group relative w-56 transition-transform duration-150 hover:-translate-y-1.5 focus:outline-none"
              aria-label="Draw today's card"
            >
              <TarotCardBack />
            </button>
            <p className="mt-3 text-xs text-stone-500">
              Click the deck back to reveal your card for {todayKey}
            </p>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs uppercase tracking-widest text-[#78350F] font-medium">
              Unrevealed Daily Plate
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
              Pause, take a breath, and draw today’s card
            </h2>
            <p className="text-base text-stone-600 leading-relaxed max-w-prose">
              Rather than predicting fixed events, a daily tarot draw acts as a mirror for attention—offering one symbolic lens through which to observe your habits, conversations, and choices today.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDrawToday}
                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                <span>Draw Today’s Card</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 rounded-xl border border-stone-200 bg-white p-8 sm:p-12 lg:grid-cols-12 items-start">
          {/* Left: Today's Drawn Card */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <button
              type="button"
              onClick={() => onSelectCard(todayCard, todayEntry.isReversed)}
              className="w-56 sm:w-64 transition-transform duration-150 hover:-translate-y-1 focus:outline-none"
            >
              <TarotCardArtwork card={todayCard} isReversed={todayEntry.isReversed} />
            </button>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectCard(todayCard, todayEntry.isReversed)}
                className="text-xs font-medium text-[#78350F] hover:underline whitespace-nowrap shrink-0"
              >
                Inspect Full Monograph
              </button>
              <span className="text-stone-300" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={handleRedrawToday}
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Redraw</span>
              </button>
            </div>
          </div>

          {/* Right: Interpretation & Daily Reflection Journal */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <div className="text-xs text-stone-500 font-mono tabular-nums">
                <span>{todayEntry.date}</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>{todayCard.arcana} Arcana</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>{todayEntry.isReversed ? 'Reversed Orientation' : 'Upright Orientation'}</span>
              </div>

              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
                {todayCard.name}
              </h2>

              <p className="mt-2 text-xs text-stone-600">
                {(todayEntry.isReversed ? todayCard.reversedKeywords : todayCard.uprightKeywords).join(' · ')}
              </p>
            </div>

            <div className="border-t border-stone-200 pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {todayEntry.isReversed ? 'Reversed Counsel for Today' : 'Upright Counsel for Today'}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-stone-800 max-w-prose">
                {todayEntry.isReversed ? todayCard.reversedMeaning : todayCard.uprightMeaning}
              </p>
            </div>

            <div className="rounded-lg border border-stone-200 bg-[#FBF9F5] p-4">
              <p className="text-xs uppercase tracking-widest text-[#78350F] font-medium">
                Today’s Question Prompt
              </p>
              <p className="mt-1 font-serif text-lg italic text-stone-900">
                “{todayCard.questionPrompt}”
              </p>
            </div>

            <form onSubmit={handleSaveReflection} className="space-y-3 border-t border-stone-200 pt-5">
              <label htmlFor="daily-reflection" className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Personal Daily Note (Saved to Local Session)
              </label>
              <textarea
                id="daily-reflection"
                rows={3}
                value={reflectionDraft}
                onChange={(e) => setReflectionDraft(e.target.value)}
                placeholder="Write a brief note on how this card relates to your day..."
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] p-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#78350F] focus:bg-white focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Stored locally in your browser—no account required.
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                >
                  {savedNotice ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Saved to Session</span>
                    </>
                  ) : (
                    <span>Save Reflection</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Previous Daily Draws */}
      {pastEntries.length > 0 && (
        <div className="mt-14 border-t border-stone-200 pt-10">
          <h2 className="font-serif text-2xl font-semibold text-stone-900">
            Previous Daily Draws in This Session
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastEntries.map((entry) => {
              const card = TAROT_DECK.find((c) => c.id === entry.cardId);
              if (!card) return null;
              return (
                <div
                  key={entry.date}
                  className="flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-4"
                >
                  <button
                    type="button"
                    onClick={() => onSelectCard(card, entry.isReversed)}
                    className="w-16 shrink-0"
                  >
                    <TarotCardArtwork card={card} isReversed={entry.isReversed} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-stone-500 font-mono tabular-nums">
                      {entry.date} · {entry.isReversed ? 'Reversed' : 'Upright'}
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelectCard(card, entry.isReversed)}
                      className="mt-1 font-serif text-lg font-semibold text-stone-900 hover:text-[#78350F] text-left"
                    >
                      {card.name}
                    </button>
                    {entry.reflection && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-stone-600">
                        “{entry.reflection}”
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
