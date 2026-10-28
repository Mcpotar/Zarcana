export interface DrawnSpreadCard {
  positionIndex: number;
  positionTitle: string;
  positionSubtitle: string;
  cardId: string;
  isReversed: boolean;
  isRevealed: boolean;
}

export interface SavedReading {
  id: string;
  timestamp: string;
  spreadId: string;
  spreadName: string;
  question: string;
  cards: DrawnSpreadCard[];
  notes: string;
}

export interface DailyDrawEntry {
  date: string; // YYYY-MM-DD
  cardId: string;
  isReversed: boolean;
  reflection: string;
  timestamp: string;
}

export interface SessionPreferences {
  allowReversals: boolean;
  reversalProbability: number; // 0.35 default
  soundEnabled: boolean;
  ambientEnabled: boolean;
  defaultSpreadId: string;
}

export interface UserTarotSession {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  preferences: SessionPreferences;
  readings: SavedReading[];
  dailyDraws: Record<string, DailyDrawEntry>;
  bookmarkedCardIds: string[];
  activeTableState: {
    spreadId: string;
    question: string;
    drawnCards: DrawnSpreadCard[];
    notes: string;
    deckOrder: string[];
    cutOffset: number;
  } | null;
}

const STORAGE_KEY = 'arcana_archive_user_session_v1';

function generateSessionId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ARC-${new Date().getFullYear()}-${suffix}`;
}

export function createDefaultSession(): UserTarotSession {
  const now = new Date().toISOString();
  return {
    sessionId: generateSessionId(),
    createdAt: now,
    updatedAt: now,
    preferences: {
      allowReversals: true,
      reversalProbability: 0.3,
      soundEnabled: true,
      ambientEnabled: false,
      defaultSpreadId: 'three-time'
    },
    readings: [],
    dailyDraws: {},
    bookmarkedCardIds: ['major-00', 'major-02', 'major-17'],
    activeTableState: null
  };
}

export function loadUserSession(): UserTarotSession {
  if (typeof window === 'undefined') {
    return createDefaultSession();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = createDefaultSession();
      saveUserSession(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<UserTarotSession>;
    const defaults = createDefaultSession();
    return {
      sessionId: parsed.sessionId || defaults.sessionId,
      createdAt: parsed.createdAt || defaults.createdAt,
      updatedAt: parsed.updatedAt || defaults.updatedAt,
      preferences: {
        ...defaults.preferences,
        ...(parsed.preferences || {})
      },
      readings: Array.isArray(parsed.readings) ? parsed.readings : [],
      dailyDraws: parsed.dailyDraws && typeof parsed.dailyDraws === 'object' ? parsed.dailyDraws : {},
      bookmarkedCardIds: Array.isArray(parsed.bookmarkedCardIds)
        ? parsed.bookmarkedCardIds
        : defaults.bookmarkedCardIds,
      activeTableState: parsed.activeTableState || null
    };
  } catch {
    return createDefaultSession();
  }
}

export function saveUserSession(session: UserTarotSession): UserTarotSession {
  const updated: UserTarotSession = {
    ...session,
    updatedAt: new Date().toISOString()
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors gracefully
    }
  }
  return updated;
}

export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
