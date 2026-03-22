import { PLAYERS } from '../../constants.js';

export class TimerView {
    #container;
    #lightTime;
    #darkTime;
    #lightBox;
    #darkBox;

    constructor(parent) {
        this.#createLayout(parent);
    }

    #createLayout(parent) {
        this.#container = document.createElement('div');
        this.#container.className = 'timer-container';

        this.#lightBox = document.createElement('div');
        this.#lightBox.className = 'timer-box timer-box--light';
        const lightLabel = document.createElement('span');
        lightLabel.className = 'timer-label';
        lightLabel.textContent = 'White';
        this.#lightTime = document.createElement('span');
        this.#lightTime.className = 'timer-time';
        this.#lightBox.append(lightLabel, this.#lightTime);

        this.#darkBox = document.createElement('div');
        this.#darkBox.className = 'timer-box timer-box--dark';
        const darkLabel = document.createElement('span');
        darkLabel.className = 'timer-label';
        darkLabel.textContent = 'Black';
        this.#darkTime = document.createElement('span');
        this.#darkTime.className = 'timer-time';
        this.#darkBox.append(darkLabel, this.#darkTime);

        this.#container.append(this.#lightBox, this.#darkBox);
        
        parent.prepend(this.#container);
    }


    render(times, activePlayer) {
        if (!times) return;

        this.#lightTime.textContent = times[PLAYERS.LIGHT];
        this.#darkTime.textContent = times[PLAYERS.DARK];
        this.#lightBox.classList.toggle('is-active', activePlayer === PLAYERS.LIGHT);
        this.#darkBox.classList.toggle('is-active', activePlayer === PLAYERS.DARK);
    }
}
