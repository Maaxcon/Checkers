export class HistoryController {
    #state;
    #viewUpdater;

    constructor(state, viewUpdater) {
        this.#state = state;
        this.#viewUpdater = viewUpdater;
    }

    handleHistoryClick(from, to) {
        if (this.#state.isAnimating) return;
        this.#state.setHistoryHighlight({ from, to });
        this.#state.clearSelection();
        this.#viewUpdater.render();
    }
}
