export class ViewUpdater {
    #model;
    #view;
    #state;

    constructor(model, view, state) {
        this.#model = model;
        this.#view = view;
        this.#state = state;
    }

    render() {
        this.#view.renderBoard(
            this.#model.board,
            this.#state.selectedCell,
            this.#state.validMoves,
            this.#model.currentTurn,
            this.#state.historyHighlight
        );

        this.#view.historyView.render(this.#model.moveLog);
    }
}
