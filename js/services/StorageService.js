import { GAME_SETTINGS } from '../constants.js';

export class StorageService {
    static save(data) {
            localStorage.setItem(GAME_SETTINGS.STORAGE_KEY, JSON.stringify(data));
    }

    static load() {
        const json = localStorage.getItem(GAME_SETTINGS.STORAGE_KEY);
        if (!json) return null;
        try {
            return JSON.parse(json);
        } catch (error) {
            this.clear();
            return null;
        }
    }

    static clear() {
        localStorage.removeItem(GAME_SETTINGS.STORAGE_KEY);
    }
}
