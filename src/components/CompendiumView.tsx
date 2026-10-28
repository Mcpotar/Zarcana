import React, { useState, useMemo } from 'react';
import { Search, Bookmark } from 'lucide-react';
import { TAROT_DECK, TarotCardData, SuitType } from '../data/tarotDeck';
import { TarotCardArtwork } from './TarotCardArtwork';

interface CompendiumViewProps {
  bookmarkedCardIds: string[];
  onToggleBookmark: (cardId: string) => void;
  onSelectCard: (card: TarotCardData) => void;
}

type FilterOption = 'ALL' | SuitType | 'BOOKMARKED';

export const CompendiumView: React.FC<CompendiumViewProps> = ({
  bookmarkedCardIds,
  onToggleBookmark,
  onSelectCard
}) => {
  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = useMemo(() => {
    return TAROT_DECK.filter((card) => {
      if (filter === 'BOOKMARKED' && !bookmarkedCardIds.includes(card.id)) {
        return false;
      }
      if (filter !== 'ALL' && filter !== 'BOOKMARKED' && card.suit !== filter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = card.name.toLowerCase().includes(q);
        const matchKeywords =
          card.uprightKeywords.some((k) => k.toLowerCase().includes(q)) ||
          card.reversedKeywords.some((k) => k.toLowerCase().includes(q));
        const matchElement = card.element.toLowerCase().includes(q);
        const matchAstrology = card.astrology.toLowerCase().includes(q);
        return matchName || matchKeywords || matchElement || matchAstrology;
      }
      return true;
    });
  }, [filter, searchQuery, bookmarkedCardIds]);

  const filterButtons: Array<{ id: FilterOption; label: string; count: number }> = [
    { id: 'ALL', label: 'All 78 Cards', count: 78 },
    { id: 'Major', label: 'Major Arcana', count: 22 },
    { id: 'Wands', label: 'Suit of Wands', count: 14 },
    { id: 'Cups', label: 'Suit of Cups', count: 14 },
    { id: 'Swords', label: 'Suit of Swords', count: 14 },
    { id: 'Pentacles', label: 'Suit of Pentacles', count: 14 },
    { id: 'BOOKMARKED', label: 'Study List', count: bookmarkedCardIds.length }
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="border-b border-stone-200 pb-8">
        <p className="text-xs uppercase tracking-widest text-stone-500">
          Complete Rider-Waite-Smith Reference · 22 Major & 56 Minor Arcana
        </p>
        <h1
          className="mt-2 font-serif text-4xl sm:text-5xl font-semibold text-stone-900"
          style={{ textWrap: 'balance' }}
        >
          The 78-Card Archival Compendium
        </h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600 leading-relaxed">
          Explore the complete classical deck. Filter by Major Arcana or the four elemental suits, search by theme or astrological correspondence, and select any plate to inspect its full upright and reversed monograph.
        </p>

        {/* Controls Bar: Segmented Filter Buttons + Search Input */}
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-200/75 p-1">
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 font-sans ${
                  filter === btn.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {btn.label} ({btn.count})
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search card, keyword, element..."
              aria-label="Search tarot cards"
              className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#78350F] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-6 flex items-center justify-between text-xs text-stone-500 font-mono tabular-nums">
        <span>Showing {filteredCards.length} of 78 archival plates</span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-[#78350F] hover:underline font-sans whitespace-nowrap shrink-0"
          >
            Clear search filter
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 ? (
        <div className="mt-10 rounded-xl border border-stone-200 bg-white p-12 text-center">
          <p className="font-serif text-2xl text-stone-800">No matching cards found</p>
          <p className="mt-2 text-sm text-stone-500">
            Try clearing your search query or switching back to All 78 Cards.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter('ALL');
              setSearchQuery('');
            }}
            className="mt-5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredCards.map((card) => {
            const isSaved = bookmarkedCardIds.includes(card.id);
            return (
              <article
                key={card.id}
                className="group flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-400"
              >
                <div>
                  {/* Top quiet text kicker + bookmark button */}
                  <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                    <span className="font-mono tabular-nums">
                      {card.suit === 'Major' ? `Major · ${card.numeral}` : `${card.suit} · ${card.numeral}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleBookmark(card.id)}
                      aria-label={isSaved ? `Remove ${card.name} from study list` : `Save ${card.name} to study list`}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                        isSaved ? 'text-[#78350F]' : 'text-stone-400 hover:text-stone-700'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Card Artwork Button */}
                  <button
                    type="button"
                    onClick={() => onSelectCard(card)}
                    className="mt-3 block w-full text-left focus:outline-none"
                  >
                    <div className="mx-auto w-40 transition-transform duration-150 group-hover:-translate-y-1">
                      <TarotCardArtwork card={card} />
                    </div>

                    <h2 className="mt-4 font-serif text-2xl font-semibold text-stone-900 group-hover:text-[#78350F] transition-colors">
                      {card.name}
                    </h2>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                      <span>{card.element}</span>
                      <span aria-hidden="true">·</span>
                      <span>{card.astrology}</span>
                    </div>

                    <p className="mt-2.5 text-xs text-stone-600 leading-relaxed">
                      {card.uprightKeywords.join(' · ')}
                    </p>

                    <p className="mt-2 line-clamp-2 text-xs text-stone-500 leading-relaxed">
                      {card.uprightMeaning}
                    </p>
                  </button>
                </div>

                <div className="mt-4 border-t border-stone-100 pt-3">
                  <button
                    type="button"
                    onClick={() => onSelectCard(card)}
                    className="text-xs font-medium text-[#78350F] hover:underline whitespace-nowrap shrink-0"
                  >
                    Read Full Monograph
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
