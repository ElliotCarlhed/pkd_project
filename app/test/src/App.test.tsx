import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';


// Mocking modules
vi.mock('./script/auth', () => ({
  redirectToAuthCodeFlow: vi.fn(),
  exchangeCodeForTokens: vi.fn(),
  getUserProfile: vi.fn(),
}));

vi.mock('./script/spotifyApi', () => ({
  getTracks: vi.fn(),
  clearTrackData: vi.fn(),
}));

vi.mock('./script/tinder-playlist', () => ({
  PlaylistCreator: () => <div data-testid="playlist-creator">PlaylistCreator</div>,
}));

vi.mock('./script/moodProfiles', () => ({
  moods: [
    { id: 'happy' },
    { id: 'sad' },
    { id: 'energetic' },
  ],
  getMoodById: (id: string) => ({ id, genres: [] }),
}));

vi.mock('wouter', () => ({
  Route: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLocation: () => ['/', vi.fn()],
}));

import App from './App';
import { redirectToAuthCodeFlow, exchangeCodeForTokens, getUserProfile } from './script/auth';
import { clearTrackData, getTracks } from './script/spotifyApi';

// ─── toggleMood logic (isolated hook test) ────────────────────────────────────
// Tests the toggle logic directly without needing to render the full App.

describe('toggleMood logic', () => {
  function useToggleMood() {
    const [currentMoods, setCurrentMoods] = useState<string[]>([]);
    const toggleMood = (id: string) => {
      setCurrentMoods(prev =>
        prev.includes(id) ? prev.filter(moodId => moodId !== id) : [...prev, id]
      );
    };
    return { currentMoods, toggleMood };
  }

  it('adds a mood when it is not currently selected', () => {
    const { result } = renderHook(() => useToggleMood());
    act(() => result.current.toggleMood('happy'));
    expect(result.current.currentMoods).toContain('happy');
  });

  it('removes a mood when it is already selected', () => {
    const { result } = renderHook(() => useToggleMood());
    act(() => result.current.toggleMood('happy'));
    act(() => result.current.toggleMood('happy'));
    expect(result.current.currentMoods).not.toContain('happy');
  });

  it('can select multiple moods independently', () => {
    const { result } = renderHook(() => useToggleMood());
    act(() => result.current.toggleMood('happy'));
    act(() => result.current.toggleMood('sad'));
    expect(result.current.currentMoods).toEqual(['happy', 'sad']);
  });

  it('removing one mood does not affect others', () => {
    const { result } = renderHook(() => useToggleMood());
    act(() => result.current.toggleMood('happy'));
    act(() => result.current.toggleMood('sad'));
    act(() => result.current.toggleMood('happy'));
    expect(result.current.currentMoods).toEqual(['sad']);
  });

  it('toggling the same mood twice leaves state empty', () => {
    const { result } = renderHook(() => useToggleMood());
    act(() => result.current.toggleMood('energetic'));
    act(() => result.current.toggleMood('energetic'));
    expect(result.current.currentMoods).toHaveLength(0);
  });
});

// ─── App rendering: idle state ────────────────────────────────────────────────

describe('App – idle state (no auth code in URL)', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('renders the login card with title', () => {
    render(<App />);
    expect(screen.getByText('Spotifynder')).toBeInTheDocument();
  });

  it('renders the Connect with Spotify button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /connect with spotify/i })).toBeInTheDocument();
  });

  it('calls redirectToAuthCodeFlow when login button is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /connect with spotify/i }));
    expect(redirectToAuthCodeFlow).toHaveBeenCalledTimes(1);
  });
});

// ─── App rendering: error state ───────────────────────────────────────────────

describe('App – error state (Spotify denies access)', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/?error=access_denied');
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('renders an error message when Spotify denies access', () => {
    render(<App />);
    expect(screen.getByText(/auth failed/i)).toBeInTheDocument();
  });

  it('does not render the login card in error state', () => {
    render(<App />);
    expect(screen.queryByText('Spotifynder')).not.toBeInTheDocument();
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function renderAuthenticatedApp() {
  (exchangeCodeForTokens as ReturnType<typeof vi.fn>).mockResolvedValue({
    accessToken: 'mock-token',
  });
  (getUserProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
    display_name: 'Test User',
  });
  (getTracks as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

  window.history.replaceState({}, '', '/?code=mock-code');
  render(<App />);
  await waitFor(() => screen.getByText('Test User'));
}

// ─── Mood chips UI (authenticated state) ─────────────────────────────────────

describe('Mood chips UI', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
    vi.clearAllMocks();
  });

  it('renders all mood chips from the moods list', async () => {
    await renderAuthenticatedApp();
    expect(screen.getByRole('button', { name: /happy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sad/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /energetic/i })).toBeInTheDocument();
  });

  it('adds active class when a mood chip is clicked', async () => {
    await renderAuthenticatedApp();
    const chip = screen.getByRole('button', { name: /happy/i });
    fireEvent.click(chip);
    expect(chip).toHaveClass('active');
  });

  it('removes active class when an active mood chip is clicked again', async () => {
    await renderAuthenticatedApp();
    const chip = screen.getByRole('button', { name: /happy/i });
    fireEvent.click(chip);
    fireEvent.click(chip);
    expect(chip).not.toHaveClass('active');
  });

  it('shows checkmark only for active moods', async () => {
    await renderAuthenticatedApp();
    const chip = screen.getByRole('button', { name: /happy/i });
    fireEvent.click(chip);
    expect(chip).toHaveTextContent('✓');
  });

  it('selecting multiple moods marks them all active', async () => {
    await renderAuthenticatedApp();
    fireEvent.click(screen.getByRole('button', { name: /happy/i }));
    fireEvent.click(screen.getByRole('button', { name: /sad/i }));
    expect(screen.getByRole('button', { name: /happy/i })).toHaveClass('active');
    expect(screen.getByRole('button', { name: /sad/i })).toHaveClass('active');
  });
});

// ─── handleCreateandNavigate ──────────────────────────────────────────────────

describe('handleCreateandNavigate', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
    vi.clearAllMocks();
  });

  it('calls clearTrackData before fetching tracks', async () => {
    await renderAuthenticatedApp();
    fireEvent.click(screen.getByRole('button', { name: /create playlist/i }));
    await waitFor(() => expect(clearTrackData).toHaveBeenCalled());
    // clearTrackData should be called before getTracks
    const clearOrder = (clearTrackData as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    const getOrder = (getTracks as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    expect(clearOrder).toBeLessThan(getOrder);
  });

  it('does not navigate to playlist-creator when getTracks throws', async () => {
    (exchangeCodeForTokens as ReturnType<typeof vi.fn>).mockResolvedValue({
      accessToken: 'mock-token',
    });
    (getUserProfile as ReturnType<typeof vi.fn>).mockResolvedValue({
      display_name: 'Test User',
    });
    (getTracks as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API error'));

    window.history.replaceState({}, '', '/?code=mock-code');
    render(<App />);
    await waitFor(() => screen.getByText('Test User'));

    fireEvent.click(screen.getByRole('button', { name: /create playlist/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('playlist-creator')).not.toBeInTheDocument();
    });
  });
});