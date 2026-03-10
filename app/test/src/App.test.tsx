import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('./script/auth', () => ({
  redirectToAuthCodeFlow: jest.fn(),
  exchangeCodeForTokens: jest.fn(),
  getUserProfile: jest.fn(),
}));

jest.mock('./script/spotifyApi', () => ({
  getTracks: jest.fn(),
  clearTrackData: jest.fn(),
}));

jest.mock('./script/tinder-playlist', () => ({
  PlaylistCreator: () => <div data-testid="playlist-creator">PlaylistCreator</div>,
}));

jest.mock('./script/moodProfiles', () => ({
  moods: [
    { id: 'happy' },
    { id: 'sad' },
    { id: 'energetic' },
  ],
  getMoodById: (id: string) => ({ id, genres: [] }),
}));

jest.mock('wouter', () => ({
  Route: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLocation: () => ['/', jest.fn()],
}));



import App from './App';
import { exchangeCodeForTokens, getUserProfile } from './script/auth';

const mockExchangeCode = exchangeCodeForTokens as jest.MockedFunction<typeof exchangeCodeForTokens>;
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;



async function renderAuthenticatedApp() {
  mockExchangeCode.mockResolvedValue({ accessToken: 'mock-token', expiresAt: 10000 });
  mockGetUserProfile.mockResolvedValue({ display_name: 'Test User' });
  window.history.replaceState({}, '', '/?code=mock-code');
  render(<App />);
  await waitFor(() => screen.getByText('Test User'));
}



import { redirectToAuthCodeFlow } from './script/auth';

const mockRedirect = redirectToAuthCodeFlow as jest.MockedFunction<typeof redirectToAuthCodeFlow>;

describe('idle state', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/'); // clear url
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Connect with Spotify button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Connect with Spotify/i })).toBeInTheDocument();
  });

  it('clicking the button calls redirectToAuthCodeFlow', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Connect with Spotify/i }));
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });
});



describe('mood chips', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
    jest.clearAllMocks();
  });

  it('renders a chip for each mood', async () => {
    await renderAuthenticatedApp();
    expect(screen.getByRole('button', { name: /happy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sad/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /energetic/i })).toBeInTheDocument();
  });

  it('clicking a chip marks it as active', async () => {
    await renderAuthenticatedApp();
    const chip = screen.getByRole('button', { name: /happy/i });
    fireEvent.click(chip);
    expect(chip).toHaveClass('active');
  });

  it('clicking an active chip removes the active state', async () => {
    await renderAuthenticatedApp();
    const chip = screen.getByRole('button', { name: /happy/i });
    fireEvent.click(chip);
    fireEvent.click(chip);
    expect(chip).not.toHaveClass('active');
  });

  it('selecting one chip does not affect others', async () => {
    await renderAuthenticatedApp();
    fireEvent.click(screen.getByRole('button', { name: /happy/i }));
    expect(screen.getByRole('button', { name: /sad/i })).not.toHaveClass('active');
    expect(screen.getByRole('button', { name: /energetic/i })).not.toHaveClass('active');
  });

  it('multiple chips can be active at the same time', async () => {
    await renderAuthenticatedApp();
    fireEvent.click(screen.getByRole('button', { name: /happy/i }));
    fireEvent.click(screen.getByRole('button', { name: /sad/i }));
    expect(screen.getByRole('button', { name: /happy/i })).toHaveClass('active');
    expect(screen.getByRole('button', { name: /sad/i })).toHaveClass('active');
  });
});