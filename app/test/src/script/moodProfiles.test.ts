import {describe, it, expect} from 'vitest';
import { getMoodById, moods } from "./moodProfiles";

describe('getMoodById', () => {
    it('should return the correct mood profile for a valid ID', () => {
        const mood = getMoodById('happy');
        expect(mood).toEqual(moods[0]);
    });

    it('should return undefined for an invalid ID', () => {
        const mood = getMoodById('nonexistent');
        expect(mood).toBeUndefined();
    });
});