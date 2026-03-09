import { playUri } from "./PlayerApi";

export {};
    
export const togglePlay = async (playerRef: any) => {
        if (!playerRef.current) return;
        await playerRef.current.togglePlay();
    };

export const next = async (playerRef: any) => {
        if (!playerRef.current) return;
        await playerRef.current.nextTrack();
    };

export const prev = async (playerRef: any) => {

        if (!playerRef.current) return;
        await playerRef.current.previousTrack();
    };

export const demoPlay = async (
    accessToken: string | null, 
    Track_Uri: string,
    deviceId: string | null 
) => {
        if (!deviceId) return;
        await playUri(accessToken, deviceId, Track_Uri);
    };