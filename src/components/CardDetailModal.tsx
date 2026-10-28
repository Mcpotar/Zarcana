import React, { useState, useEffect } from 'react';
import { X, Bookmark, RotateCcw } from 'lucide-react';
import { TarotCardData } from '../data/tarotDeck';
import { TarotCardArtwork } from './TarotCardArtwork';

interface CardDetailModalProps {
  card: TarotCardData | null;
  initialReversed?: boolean;
  positionLabel?: string;
  positionDescription?: string;
  isBookmarked: boolean;
  onToggleBookmark: (cardId: string) => void;
  onClose: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  initialReversed = false,
  positionLabel,
  positionDescription,
  isBookmarked,
  onToggleBookmark,
  onClose
}) => {
  const [viewReversed, setViewReversed] = useState(initialReversed);

  useEffect(() => {
    setViewReversed(initialReversed);
  }, [card, initialReversed]);

  useEffect(() => {
    if (!card) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [card, onClose]);

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 sm:p-6 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-card-title"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-stone-300 bg-[#FBF9F5] p-6 sm:p-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top utility bar */}
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="text-xs uppercase tracking-widest text-stone-500 font-mono tabular-nums">
            <span>{card.arcana} Arcana</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>{card.suit === 'Major' ? `Plate ${card.numeral}` : `${card.suit} · ${card.numeral}`}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>{card.element}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewReversed((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{viewReversed ? 'View Upright' : 'Preview Reversed'}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(card.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isBookmarked
                  ? 'border-[#78350F] bg-[#78350F] text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>{isBookmarked ? 'Saved in Study List' : 'Save to Study List'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close card monograph"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Museum Monograph Split */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12 items-start">
          {/* Left Column: Engraved Plate & Accession Metadata */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-56 sm:w-64">
              <TarotCardArtwork card={card} isReversed={viewReversed} />
            </div>
            <p className="mt-3 text-center font-serif text-xs italic text-stone-500">
              Fig. {card.number} — {card.name} ({viewReversed ? 'Reversed Orientation' : 'Upright Orientation'})
            </p>

            {/* Accession Metadata Definition List */}
            <dl className="mt-6 w-full divide-y divide-stone-200 border-t border-b border-stone-200 text-xs">
              <div className="flex justify-between py-2.5">
                <dt className="text-stone-500">Classification</dt>
                <dd className="font-medium text-stone-900">{card.arcana} Arcana · {card.suit}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-stone-500">Elemental Sphere</dt>
                <dd className="font-medium text-stone-900">{card.element}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-stone-500">Correspondence</dt>
                <dd className="font-medium text-stone-900">{card.astrology}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-stone-500">Orientation Shown</dt>
                <dd className="font-medium text-[#78350F]">{viewReversed ? 'Reversed (Inverted)' : 'Upright (Direct)'}</dd>
              </div>
            </dl>
          </div>

          {/* Right Column: Editorial Monograph & Meanings */}
          <div className="md:col-span-7 space-y-6">
            {positionLabel && (
              <div className="border-b border-stone-200 pb-4">
                <p className="text-xs uppercase tracking-widest text-[#78350F] font-medium">
                  Spread Position · {positionLabel}
                </p>
                {positionDescription && (
                  <p className="mt-1 text-sm text-stone-600">{positionDescription}</p>
                )}
              </div>
            )}

            <div>
              <h2 id="modal-card-title" className="font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
                {card.name}
              </h2>
              <p className="mt-2 text-xs text-stone-600">
                <span className="font-semibold text-stone-800">Upright Themes:</span>{' '}
                {card.uprightKeywords.join(' · ')}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                <span className="font-semibold text-stone-700">Reversed Themes:</span>{' '}
                {card.reversedKeywords.join(' · ')}
              </p>
            </div>

            <div className="space-y-4 border-t border-stone-200 pt-5">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Upright Interpretation
                </h3>
                <p className="mt-2 text-base leading-relaxed text-stone-800 max-w-prose">
                  {card.uprightMeaning}
                </p>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Reversed / Inverted Interpretation
                </h3>
                <p className="mt-2 text-base leading-relaxed text-stone-700 max-w-prose">
                  {card.reversedMeaning}
                </p>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Traditional Waite-Smith Iconography
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 max-w-prose">
                  {card.symbolism}
                </p>
              </div>

              <div className="rounded-lg border border-stone-200 bg-[#F5EFE6]/70 p-4">
                <p className="text-xs uppercase tracking-widest text-[#78350F] font-medium">
                  Contemplative Inquiry
                </p>
                <p className="mt-1.5 font-serif text-lg italic text-stone-900">
                  “{card.questionPrompt}”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
