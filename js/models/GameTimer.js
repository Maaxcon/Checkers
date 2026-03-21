import { PLAYERS, GAME_SETTINGS } from '../constants.js';

export class GameTimer {
    #timeLight;
    #timeDark;
    #intervalId = null;
    #onTick;
    #onTimeOut;
    #activePlayer;

    constructor(onTick, onTimeOut) {
        this.#onTick = onTick;
        this.#onTimeOut = onTimeOut;
        

        if (!this.#loadState()) {
            this.#timeLight = GAME_SETTINGS.INITIAL_TIME_SECONDS;
            this.#timeDark = GAME_SETTINGS.INITIAL_TIME_SECONDS;
        }
        
        this.#update(); 
    }

    reset() {
        this.stop();
        this.#timeLight = GAME_SETTINGS.INITIAL_TIME_SECONDS;
        this.#timeDark = GAME_SETTINGS.INITIAL_TIME_SECONDS;
        this.#activePlayer = PLAYERS.LIGHT;
        this.#saveState(); 
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
        this.#saveState(); 
    }

    #tick() {
        if (this.#activePlayer === PLAYERS.LIGHT) {
            this.#timeLight--;
            if (this.#timeLight <= 0) this.#triggerTimeOut(PLAYERS.DARK);
        } else {
            this.#timeDark--;
            if (this.#timeDark <= 0) this.#triggerTimeOut(PLAYERS.LIGHT);
        }
        
        this.#saveState(); 
        this.#update();
    }

    #triggerTimeOut(winner) {
        this.stop();
        this.#onTimeOut(winner);
    }

    #update() {
        this.#onTick({
            [PLAYERS.LIGHT]: this.formatTime(this.#timeLight),
            [PLAYERS.DARK]: this.formatTime(this.#timeDark)
        });
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    #saveState() {
        try {
            localStorage.setItem('checkers_timer', JSON.stringify({
                light: this.#timeLight,
                dark: this.#timeDark
            }));
        } catch (e) {
            
        }
    }

    #loadState() {
        try {
            const saved = localStorage.getItem('checkers_timer');
            if (saved) {
                const data = JSON.parse(saved);
                this.#timeLight = data.light;
                this.#timeDark = data.dark;
                return true;
            }
        } catch (e) {
           
        }
        return false;
    }
}