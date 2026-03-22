export class TimerController {
    #model;
    #view;
    #persistState;

    constructor(model, view, persistState) {
        this.#model = model;
        this.#view = view;
        this.#persistState = persistState;

        this.#model.bindTimerTick((times) => {
            this.#view.timerView.render(times, this.#model.currentTurn);
            this.#persistState();
        });
    }

    renderInitial() {
        this.#view.timerView.render(this.#model.timerTimes, this.#model.currentTurn);
    }

    startIfNeeded() {
        this.#model.startGame();
    }
}
