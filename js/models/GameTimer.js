import { PLAYERS, GAME_SETTINGS } from '../constants.js';

export class GameTimer {
    #timeLight;
    #timeDark;
    #intervalId = null;
    #activePlayer;
    
    #onTick = () => {};
    #onTimeOut = () => {};

    constructor() {
        this.#timeLight = GAME_SETTINGS.INITIAL_TIME_SECONDS;
        this.#timeDark = GAME_SETTINGS.INITIAL_TIME_SECONDS;
    }

    bindTick(callback) {
        this.#onTick = callback;
    }

    bindTimeOut(callback) {
        this.#onTimeOut = callback;
    }

    get currentTimes() {
        return {
            [PLAYERS.LIGHT]: this.#formatTime(this.#timeLight),
            [PLAYERS.DARK]: this.#formatTime(this.#timeDark)
        };
    }

    loadState(timerData) {
        if (timerData && typeof timerData.light === 'number') {
            this.#timeLight = timerData.light;
            this.#timeDark = timerData.dark;
        }
        if (timerData && typeof timerData.activePlayer === 'number') {
            this.#activePlayer = timerData.activePlayer;
        }
    }

    exportState() {
        return {
            light: this.#timeLight,
            dark: this.#timeDark,
            activePlayer: this.#activePlayer
        };
    }

    reset() {
        this.stop();
        this.#timeLight = GAME_SETTINGS.INITIAL_TIME_SECONDS;
        this.#timeDark = GAME_SETTINGS.INITIAL_TIME_SECONDS;
        this.#activePlayer = PLAYERS.LIGHT;
        this.#update();
    }

    start(player) {
        this.#activePlayer = player;
        if (this.#intervalId) return;
        this.#intervalId = setInterval(() => this.#tick(), 1000);
    }

    stop() {
        if (this.#intervalId) {
            clearInterval(this.#intervalId);
            this.#intervalId = null;
        }
    }

    switchTurn(newPlayer) {
        this.#activePlayer = newPlayer;
    }

    #tick() {
        if (this.#activePlayer === PLAYERS.LIGHT) {
            this.#timeLight--;
            if (this.#timeLight <= 0) this.#triggerTimeOut(PLAYERS.DARK); 
        } else {
            this.#timeDark--;
            if (this.#timeDark <= 0) this.#triggerTimeOut(PLAYERS.LIGHT);
        }
        
        this.#update();
    }

    #triggerTimeOut(winner) {
        this.stop();
        this.#onTimeOut(winner);
    }

    #update() {
        this.#onTick(this.currentTimes);
    }

    #formatTime(seconds) {
        const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${secs}`;
    }
}
