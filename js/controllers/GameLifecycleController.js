export class GameLifecycleController {
    #model;
    #view;
    #storage;
    #state;
    #viewUpdater;
    #persistState;
    #timerController;

    constructor(model, view, storage, state, viewUpdater, persistState, timerController) {
        this.#model = model;
        this.#view = view;
        this.#storage = storage;
        this.#state = state;
        this.#viewUpdater = viewUpdater;
        this.#persistState = persistState;
        this.#timerController = timerController;

        this.#model.bindGameOver((winner) => {
            this.#persistState();
            this.#view.showWinner(winner);
        });
    }

    handleUndo() {
        if (this.#state.isAnimating) return;

        const wasGameOver = this.#model.winner !== null;

        this.#model.undo();
        this.#persistState();

        this.#state.clearSelection();
        this.#state.setHistoryHighlight(null);
        this.#viewUpdater.render();

        if (!this.#model.winner) {
            this.#view.hideWinner();
            if (wasGameOver) {
                this.#timerController.startIfNeeded();
            }
        }
    }

    handleRestartGame() {
        if (this.#state.isAnimating) return;

        this.#model.resetGame();
        this.#storage.clear();

        this.#state.clearSelection();
        this.#state.setHistoryHighlight(null);

        this.#view.hideWinner();
        this.#viewUpdater.render();

        this.#timerController.renderInitial();
        this.#timerController.startIfNeeded();
    }
}
