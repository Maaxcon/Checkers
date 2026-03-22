export class HistoryController {
    #state;
    #viewUpdater;
    #resetKeyboardCursor;

    constructor(state, viewUpdater, resetKeyboardCursor) {
        this.#state = state;
        this.#viewUpdater = viewUpdater;
        this.#resetKeyboardCursor = resetKeyboardCursor;
    }

    handleHistoryClick(from, to) {
        if (this.#state.isAnimating) return;
        if (this.#resetKeyboardCursor) {
            this.#resetKeyboardCursor();
        }
        this.#state.setHistoryHighlight({ from, to });
        this.#state.clearSelection();
        this.#viewUpdater.render();
    }
}
