import type { CheckersModel } from '../models/CheckersModel.ts';
import type { CheckersView } from '../views/CheckersView.ts';

export class TimerController {
    #model: CheckersModel;
    #view: CheckersView;
    #persistState: () => void;
    #lastPersistAt = 0;
    #persistIntervalMs = 3000;

    constructor(model: CheckersModel, view: CheckersView, persistState: () => void) {
        this.#model = model;
        this.#view = view;
        this.#persistState = persistState;

        this.#model.bindTimerTick((times) => {
            this.#view.timerView.render(times, this.#model.currentTurn);
            this.#maybePersist();
        });
    }

    renderInitial(): void {
        this.#view.timerView.render(this.#model.timerTimes, this.#model.currentTurn);
    }

    startIfNeeded(): void {
        this.#model.startGame();
    }

    #maybePersist(): void {
        const now = Date.now();
        if (now - this.#lastPersistAt >= this.#persistIntervalMs) {
            this.#persistState();
            this.#lastPersistAt = now;
        }
    }
}
