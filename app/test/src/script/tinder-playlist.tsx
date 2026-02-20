import { Link } from 'wouter';

export function PlaylistCreator() {
  return (
    <div className="playlist-creator">
      <h1>Playlist Creator</h1>
      <p>This is a placeholder page for creating playlists.</p>
      <Link href="/callback">
        <a className="btn btn-secondary">Back to Home</a>
      </Link>
    </div>
  );
}