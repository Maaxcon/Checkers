export class TimerController {
    #model;
    #view;
    #persistState;
    #lastPersistAt = 0;
    #persistIntervalMs = 3000;

    constructor(model, view, persistState) {
        this.#model = model;
        this.#view = view;
        this.#persistState = persistState;

        this.#model.bindTimerTick((times) => {
            this.#view.timerView.render(times, this.#model.currentTurn);
            this.#maybePersist();
        });
    }

    renderInitial() {
        this.#view.timerView.render(this.#model.timerTimes, this.#model.currentTurn);
    }

    startIfNeeded() {
        this.#model.startGame();
    }

    #maybePersist() {
        const now = Date.now();
        if (now - this.#lastPersistAt >= this.#persistIntervalMs) {
            this.#persistState();
            this.#lastPersistAt = now;
        }
    }
}
