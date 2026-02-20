export async function createPlaylist(token: string, name: string, description: string, isPublic: boolean): Promise<string> {
    return fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            description,
            public: isPublic
        })
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Failed to create playlist: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        return data.id;
    });
}