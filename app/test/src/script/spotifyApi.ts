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

export async function getTracks(moods: string, length: number, token: string){//mood type will be changed to moodProfiles
    const response = await fetch(`https://api.spotify.com/v1/search?q=genre:${moods}&type=track&limit=${length}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    })

    const data = await response.json()
    console.log(data.tracks.items)
    //TODO: combine include and exclude arrays
    // get tracks from each genere add to array
    // filter dont include
    // shuffle array
}
