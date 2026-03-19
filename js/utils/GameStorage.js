import { GAME_SETTINGS } from '../constants.js';

export class GameStorage {
    static save(data) {
        try {
            localStorage.setItem(GAME_SETTINGS.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Save error:", e);
        }
    }

    static load() {
        const json = localStorage.getItem(GAME_SETTINGS.STORAGE_KEY);
        if (!json) return null;
        try {
            return JSON.parse(json);
        } catch (e) {
            console.error("Load error:", e);
            this.clear();
            return null;
        }
    }

    static clear() {
        localStorage.removeItem(GAME_SETTINGS.STORAGE_KEY);
    }
}