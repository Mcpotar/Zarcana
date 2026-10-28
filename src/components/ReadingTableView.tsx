import React, { useState } from 'react';
import {
  Shuffle,
  Scissors,
  Eye,
  RotateCcw,
  BookmarkCheck,
  Volume2,
  VolumeX,
  Wind,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  TAROT_DECK,
  SPREADS,
  TarotCardData,
  SpreadDefinition
} from '../data/tarotDeck';
import {
  DrawnSpreadCard,
  SavedReading,
  SessionPreferences
} from '../utils/sessionStorage';
import { TarotCardArtwork, TarotCardBack } from './TarotCardArtwork';
import { soundEngine } from '../utils/sound';

interface ReadingTableViewProps {
  preferences: SessionPreferences;
  activeTableState: {
    spreadId: string;
    question: string;
    drawnCards: DrawnSpreadCard[];
    notes: string;
    deckOrder: string[];
    cutOffset: number;
  };
  onUpdateTableState: (nextState: ReadingTableViewProps['activeTableState']) => void;
  onUpdatePreferences: (prefs: Partial<SessionPreferences>) => void;
  onSaveReadingToSession: (reading: SavedReading) => void;
  onSelectCard: (
    card: TarotCardData,
    isReversed: boolean,
    positionTitle?: string,
    positionDesc?: string
  ) => void;
}

export function fisherYatesShuffle(ids: string[]): string[] {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const ReadingTableView: React.FC<ReadingTableViewProps> = ({
  preferences,
  activeTableState,
  onUpdateTableState,
  onUpdatePreferences,
  onSaveReadingToSession,
  onSelectCard
}) => {
  const [isShufflingAnim, setIsShufflingAnim] = useState(false);
  const [justSavedId, setJustSavedId] = useState<string | null>(null);

  const currentSpread: SpreadDefinition =
    SPREADS.find((s) => s.id === activeTableState.spreadId) || SPREADS[1];

  const { drawnCards, question, notes, deckOrder, cutOffset } = activeTableState;

  const remainingDeckCount = TAROT_DECK.length - drawnCards.length;
  const allPositionsFilled = drawnCards.length >= currentSpread.cardCount;
  const anyUnrevealed = drawnCards.some((c) => !c.isRevealed);
  const allRevealed = allPositionsFilled && !anyUnrevealed;

  const handleSelectSpread = (newSpreadId: string) => {
    if (newSpreadId === activeTableState.spreadId) return;
    soundEngine.playShuffle(preferences.soundEnabled);
    onUpdateTableState({
      spreadId: newSpreadId,
      question: activeTableState.question,
      drawnCards: [],
      notes: '',
      deckOrder: fisherYatesShuffle(TAROT_DECK.map((c) => c.id)),
      cutOffset: 0
    });
    setJustSavedId(null);
  };

  const handleShuffleDeck = () => {
    soundEngine.playShuffle(preferences.soundEnabled);
    setIsShufflingAnim(true);
    setTimeout(() => setIsShufflingAnim(false), 180);

    // Keep already-drawn cards or shuffle fresh if table is clear
    const drawnIds = new Set(drawnCards.map((d) => d.cardId));
    const availableIds = TAROT_DECK.map((c) => c.id).filter((id) => !drawnIds.has(id));
    const newlyShuffled = [... Array.from(drawnIds), ...fisherYatesShuffle(availableIds)];

    onUpdateTableState({
      ...activeTableState,
      deckOrder: newlyShuffled,
      cutOffset: 0
    });
  };

  const handleCutDeck = () => {
    soundEngine.playDeal(preferences.soundEnabled);
    const drawnIds = new Set(drawnCards.map((d) => d.cardId));
    const remainingIds = deckOrder.filter((id) => !drawnIds.has(id));
    if (remainingIds.length < 4) return;

    const pivot = Math.floor(remainingIds.length * (0.25 + Math.random() * 0.5));
    const cutRemaining = [...remainingIds.slice(pivot), ...remainingIds.slice(0, pivot)];

    onUpdateTableState({
      ...activeTableState,
      deckOrder: [...Array.from(drawnIds), ...cutRemaining],
      cutOffset: pivot
    });
  };

  const handleDrawCardAtPosition = (targetPositionIndex?: number) => {
    if (drawnCards.length >= currentSpread.cardCount) return;

    // Find the position to fill
    const occupiedIndices = new Set(drawnCards.map((c) => c.positionIndex));
    let posIndex = targetPositionIndex;
    if (posIndex === undefined || occupiedIndices.has(posIndex)) {
      const nextPos = currentSpread.positions.find((p) => !occupiedIndices.has(p.index));
      if (!nextPos) return;
      posIndex = nextPos.index;
    }

    const posMeta = currentSpread.positions[posIndex];
    if (!posMeta) return;

    const drawnIds = new Set(drawnCards.map((c) => c.cardId));
    const nextCardId =
      deckOrder.find((id) => !drawnIds.has(id)) ||
      TAROT_DECK.find((c) => !drawnIds.has(c.id))?.id;

    if (!nextCardId) return;

    soundEngine.playDeal(preferences.soundEnabled);
    const isReversed = preferences.allowReversals
      ? Math.random() < preferences.reversalProbability
      : false;

    const newDrawnCard: DrawnSpreadCard = {
      positionIndex: posIndex,
      positionTitle: posMeta.title,
      positionSubtitle: posMeta.subtitle,
      cardId: nextCardId,
      isReversed,
      isRevealed: false
    };

    const nextDrawn = [...drawnCards, newDrawnCard].sort(
      (a, b) => a.positionIndex - b.positionIndex
    );

    onUpdateTableState({
      ...activeTableState,
      drawnCards: nextDrawn
    });
    setJustSavedId(null);
  };

  const handleFlipCard = (positionIndex: number) => {
    soundEngine.playFlip(preferences.soundEnabled);
    const updated = drawnCards.map((item) =>
      item.positionIndex === positionIndex ? { ...item, isRevealed: true } : item
    );
    onUpdateTableState({
      ...activeTableState,
      drawnCards: updated
    });
  };

  const handleRevealAll = () => {
    soundEngine.playFlip(preferences.soundEnabled);
    // If not all cards are drawn yet, draw the rest and reveal all at once
    const occupiedIndices = new Set(drawnCards.map((c) => c.positionIndex));
    const drawnIds = new Set(drawnCards.map((c) => c.cardId));
    const availableQueue = deckOrder.filter((id) => !drawnIds.has(id));

    const completeList: DrawnSpreadCard[] = [...drawnCards].map((c) => ({
      ...c,
      isRevealed: true
    }));

    let queueCursor = 0;
    for (const pos of currentSpread.positions) {
      if (!occupiedIndices.has(pos.index)) {
        const cardId = availableQueue[queueCursor++] || TAROT_DECK[pos.index].id;
        const isReversed = preferences.allowReversals
          ? Math.random() < preferences.reversalProbability
          : false;
        completeList.push({
          positionIndex: pos.index,
          positionTitle: pos.title,
          positionSubtitle: pos.subtitle,
          cardId,
          isReversed,
          isRevealed: true
        });
      }
    }

    completeList.sort((a, b) => a.positionIndex - b.positionIndex);
    onUpdateTableState({
      ...activeTableState,
      drawnCards: completeList
    });
  };

  const handleResetTable = () => {
    soundEngine.playShuffle(preferences.soundEnabled);
    onUpdateTableState({
      ...activeTableState,
      drawnCards: [],
      notes: '',
      deckOrder: fisherYatesShuffle(TAROT_DECK.map((c) => c.id)),
      cutOffset: 0
    });
    setJustSavedId(null);
  };

  const handleSaveReading = () => {
    if (drawnCards.length === 0) return;
    const revealedCards = drawnCards.map((c) => ({ ...c, isRevealed: true }));
    const newReading: SavedReading = {
      id: `reading-${Date.now()}`,
      timestamp: new Date().toISOString(),
      spreadId: currentSpread.id,
      spreadName: currentSpread.name,
      question: question.trim(),
      cards: revealedCards,
      notes: notes.trim()
    };
    onSaveReadingToSession(newReading);
    setJustSavedId(newReading.id);
  };

  const revealedCardsList = drawnCards.filter((c) => c.isRevealed);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Editorial Intro & Spread Selector */}
      <div className="border-b border-stone-200 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500">
              Rider-Waite-Smith 78-Card Standard · Free & Ad-Free Reading Sanctuary
            </p>
            <h1
              className="mt-1.5 font-serif text-3xl sm:text-5xl font-semibold text-stone-900"
              style={{ textWrap: 'balance' }}
            >
              The Reading Table
            </h1>
          </div>

          {/* Toggles: Reversals, Sound Effects & Ambient Atmosphere */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onUpdatePreferences({ allowReversals: !preferences.allowReversals })
              }
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                preferences.allowReversals
                  ? 'border-stone-800 bg-stone-900 text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              Reversals: {preferences.allowReversals ? 'Enabled' : 'Upright Only'}
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdatePreferences({ soundEnabled: !preferences.soundEnabled })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
            >
              {preferences.soundEnabled ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-[#78350F]" />
                  <span>Sound: On</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-stone-400" />
                  <span>Sound: Muted</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const nextAmbient = !preferences.ambientEnabled;
                soundEngine.setAmbientAtmosphere(nextAmbient);
                onUpdatePreferences({ ambientEnabled: nextAmbient });
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                preferences.ambientEnabled
                  ? 'border-[#78350F] bg-[#78350F] text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Wind
                className={`h-3.5 w-3.5 ${
                  preferences.ambientEnabled ? 'text-white' : 'text-stone-500'
                }`}
              />
              <span>
                Ambient Atmosphere: {preferences.ambientEnabled ? 'On' : 'Off'}
              </span>
            </button>
          </div>
        </div>

        {/* Spread Selection Segmented Bar */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium text-stone-500">
            Select Classical Spread Layout:
          </p>
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-stone-200/75 p-1.5">
            {SPREADS.map((spread) => {
              const active = spread.id === currentSpread.id;
              return (
                <button
                  key={spread.id}
                  type="button"
                  onClick={() => handleSelectSpread(spread.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {spread.name} ({spread.cardCount})
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 text-xs text-stone-600">
            <span className="font-semibold text-stone-800">{currentSpread.category}:</span>{' '}
            {currentSpread.description}
          </p>
        </div>
      </div>

      {/* Question Input & Physical Deck Controls Bar */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12 items-center">
        <div className="lg:col-span-5">
          <label htmlFor="reading-question" className="sr-only">
            Focal Question or Intention
          </label>
          <input
            id="reading-question"
            type="text"
            value={question}
            onChange={(e) =>
              onUpdateTableState({
                ...activeTableState,
                question: e.target.value
              })
            }
            placeholder="Optional: Enter a question or intention for this draw..."
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#78350F] focus:outline-none"
          />
        </div>

        <div className="lg:col-span-7 flex flex-wrap items-center justify-start lg:justify-end gap-2.5">
          <button
            type="button"
            onClick={handleShuffleDeck}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-800 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>Shuffle Deck</span>
          </button>

          <button
            type="button"
            onClick={handleCutDeck}
            disabled={remainingDeckCount < 4}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-800 hover:bg-stone-100 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
          >
            <Scissors className="h-3.5 w-3.5" />
            <span>Cut Deck{cutOffset > 0 ? ` (${cutOffset})` : ''}</span>
          </button>

          {!allPositionsFilled && (
            <button
              type="button"
              onClick={() => handleDrawCardAtPosition()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#78350F] px-4 py-2 text-xs font-medium text-white hover:bg-[#622B0C] transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                Draw Card ({drawnCards.length + 1} of {currentSpread.cardCount})
              </span>
            </button>
          )}

          {(!allPositionsFilled || anyUnrevealed) && (
            <button
              type="button"
              onClick={handleRevealAll}
              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{allPositionsFilled ? 'Flip All Cards' : 'Deal & Reveal All'}</span>
            </button>
          )}

          {drawnCards.length > 0 && (
            <button
              type="button"
              onClick={handleResetTable}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Table</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tactile Table Surface */}
      <div className="mt-6 rounded-2xl border border-stone-800 bg-[#121926] p-6 sm:p-10 text-stone-100 shadow-sm">
        {/* Table Top HUD Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4 text-xs text-stone-400">
          <div className="font-mono tabular-nums">
            <span>Deck Remaining: {remainingDeckCount} / 78 Cards</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>
              Positions Drawn: {drawnCards.length} / {currentSpread.cardCount}
            </span>
          </div>

          <div>
            {!allPositionsFilled ? (
              <span>Click the deck stack or any empty slot below to draw a card</span>
            ) : anyUnrevealed ? (
              <span className="text-[#E6C280]">Click each face-down card to turn it over</span>
            ) : (
              <span className="text-[#E6C280]">
                All cards revealed — click any plate to inspect its full monograph
              </span>
            )}
          </div>
        </div>

        {/* Table Grid: Left Deck Stack + Right Spread Positions */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Deck Pile Column */}
          <div className="lg:col-span-3 flex flex-col items-center border-b border-stone-800 pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
            <p className="mb-3 text-xs uppercase tracking-widest text-stone-400 font-mono">
              The 78-Card Deck
            </p>

            <button
              type="button"
              onClick={() => handleDrawCardAtPosition()}
              disabled={allPositionsFilled}
              aria-label="Draw next card from deck"
              className={`group relative w-36 sm:w-40 transition-transform duration-150 focus:outline-none ${
                isShufflingAnim ? 'scale-95 rotate-1' : 'hover:-translate-y-1'
              } ${allPositionsFilled ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
            >
              {/* Stacked Deck Depth Effect */}
              <div className="absolute -right-1.5 -bottom-1.5 inset-0 rounded-lg border border-stone-700 bg-[#0D131F]" />
              <div className="relative">
                <TarotCardBack />
              </div>
            </button>

            <p className="mt-4 text-center text-xs text-stone-400 font-mono tabular-nums">
              {remainingDeckCount} cards in stack
            </p>

            {!allPositionsFilled && (
              <button
                type="button"
                onClick={() => handleDrawCardAtPosition()}
                className="mt-3 text-xs font-medium text-[#E6C280] hover:underline whitespace-nowrap shrink-0"
              >
                Tap deck to deal position #{drawnCards.length + 1}
              </button>
            )}
          </div>

          {/* Spread Positions Canvas */}
          <div className="lg:col-span-9">
            <div
              className={`grid gap-6 ${
                currentSpread.cardCount === 1
                  ? 'grid-cols-1 max-w-xs mx-auto'
                  : currentSpread.cardCount === 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
              }`}
            >
              {currentSpread.positions.map((pos) => {
                const drawn = drawnCards.find((d) => d.positionIndex === pos.index);
                const cardData = drawn
                  ? TAROT_DECK.find((c) => c.id === drawn.cardId) || null
                  : null;

                return (
                  <div
                    key={pos.index}
                    className="flex flex-col items-center rounded-xl border border-stone-800/90 bg-[#172030] p-4"
                  >
                    {/* Position Header */}
                    <div className="w-full text-center mb-3">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-[#E6C280]">
                        {pos.title}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate">
                        {pos.subtitle}
                      </p>
                    </div>

                    {/* Slot Content: Empty / Face-Down / Revealed */}
                    {!drawn ? (
                      <button
                        type="button"
                        onClick={() => handleDrawCardAtPosition(pos.index)}
                        style={{ aspectRatio: '2 / 3.3' }}
                        className="flex w-36 sm:w-40 flex-col items-center justify-center rounded-lg border border-dashed border-stone-700 bg-[#111824] p-4 text-center text-stone-400 hover:border-[#C69C6D] hover:text-stone-200 transition-colors"
                      >
                        <span className="font-serif text-2xl text-stone-500">
                          {pos.index + 1}
                        </span>
                        <span className="mt-2 text-xs font-medium">
                          Draw Here
                        </span>
                      </button>
                    ) : !drawn.isRevealed ? (
                      <button
                        type="button"
                        onClick={() => handleFlipCard(pos.index)}
                        className="group relative w-36 sm:w-40 transition-transform duration-150 hover:-translate-y-1 focus:outline-none"
                        aria-label={`Reveal card for ${pos.title}`}
                      >
                        <TarotCardBack />
                        <span className="mt-2.5 block text-center text-xs font-medium text-[#E6C280] group-hover:underline">
                          Click to Turn Over
                        </span>
                      </button>
                    ) : (
                      cardData && (
                        <button
                          type="button"
                          onClick={() =>
                            onSelectCard(
                              cardData,
                              drawn.isReversed,
                              pos.title,
                              pos.description
                            )
                          }
                          className="group flex flex-col items-center text-center focus:outline-none"
                        >
                          <div className="w-36 sm:w-40 transition-transform duration-150 group-hover:-translate-y-1">
                            <TarotCardArtwork
                              card={cardData}
                              isReversed={drawn.isReversed}
                            />
                          </div>
                          <p className="mt-3 font-serif text-lg font-semibold text-stone-100 group-hover:text-[#E6C280] transition-colors">
                            {cardData.name}
                          </p>
                          <p className="text-[11px] text-stone-400">
                            {drawn.isReversed ? 'Reversed' : 'Upright'} · {cardData.element}
                          </p>
                          <p className="mt-1 text-[11px] text-[#E6C280] group-hover:underline">
                            Inspect Plate
                          </p>
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reading Synthesis & Session Archiving Section */}
      {revealedCardsList.length > 0 && (
        <div className="mt-10 rounded-xl border border-stone-200 bg-white p-6 sm:p-10">
          <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#78350F] font-medium">
                Reading Interpretation & Synthesis
              </p>
              <h2 className="mt-1 font-serif text-3xl font-semibold text-stone-900">
                {question ? `“${question}”` : currentSpread.name}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveReading}
                className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-xs font-medium text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
              >
                <BookmarkCheck className="h-4 w-4" />
                <span>
                  {justSavedId ? 'Saved to Session Journal' : 'Save Reading to Session'}
                </span>
              </button>
            </div>
          </div>

          {/* Positional Card-by-Card Reading Narrative */}
          <div className="mt-8 divide-y divide-stone-200">
            {revealedCardsList.map((drawn) => {
              const card = TAROT_DECK.find((c) => c.id === drawn.cardId);
              const pos = currentSpread.positions[drawn.positionIndex];
              if (!card || !pos) return null;

              const activeKeywords = drawn.isReversed
                ? card.reversedKeywords
                : card.uprightKeywords;
              const activeMeaning = drawn.isReversed
                ? card.reversedMeaning
                : card.uprightMeaning;

              return (
                <div
                  key={drawn.positionIndex}
                  className="py-6 first:pt-0 last:pb-0 grid grid-cols-1 gap-6 md:grid-cols-12 items-start"
                >
                  <div className="md:col-span-3 flex flex-col sm:flex-row md:flex-col items-start gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectCard(card, drawn.isReversed, pos.title, pos.description)
                      }
                      className="w-28 shrink-0 transition-transform duration-150 hover:-translate-y-1"
                    >
                      <TarotCardArtwork card={card} isReversed={drawn.isReversed} />
                    </button>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-[#78350F]">
                        {pos.title}
                      </p>
                      <p className="text-xs text-stone-500">{pos.subtitle}</p>
                    </div>
                  </div>

                  <div className="md:col-span-9 space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-serif text-2xl font-semibold text-stone-900">
                        {card.name}{' '}
                        <span className="text-base font-normal text-stone-500">
                          ({drawn.isReversed ? 'Reversed' : 'Upright'})
                        </span>
                      </h3>
                      <span className="text-xs text-stone-500 font-mono">
                        {card.arcana} Arcana · {card.element} · {card.astrology}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500">
                      { pos.description }
                    </p>

                    <p className="text-xs font-medium text-stone-700">
                      Key Themes: {activeKeywords.join(' · ')}
                    </p>

                    <p className="text-base leading-relaxed text-stone-800 max-w-prose">
                      {activeMeaning}
                    </p>

                    <div className="pt-1 flex items-center justify-between gap-4">
                      <p className="font-serif text-sm italic text-stone-600">
                        Prompt: “{card.questionPrompt}”
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          onSelectCard(card, drawn.isReversed, pos.title, pos.description)
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#78350F] hover:underline whitespace-nowrap shrink-0"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Full Plate Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Personal Reflection Notes Input before or after saving */}
          {allRevealed && (
            <div className="mt-8 border-t border-stone-200 pt-6 space-y-3">
              <label
                htmlFor="table-reading-notes"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600"
              >
                Personal Synthesis & Journal Notes for This Spread
              </label>
              <textarea
                id="table-reading-notes"
                rows={3}
                value={notes}
                onChange={(e) => {
                  onUpdateTableState({
                    ...activeTableState,
                    notes: e.target.value
                  });
                  setJustSavedId(null);
                }}
                placeholder="Write how these cards connect to your question, intuition, or next step..."
                className="w-full rounded-lg border border-stone-300 bg-[#FBF9F5] p-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#78350F] focus:bg-white focus:outline-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-stone-500">
                  Your notes and spread are saved locally in your browser session with no sign-up or external tracking.
                </span>
                <button
                  type="button"
                  onClick={handleSaveReading}
                  className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                >
                  <BookmarkCheck className="h-4 w-4" />
                  <span>
                    {justSavedId ? 'Saved in Session Journal' : 'Save Reading & Notes'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
