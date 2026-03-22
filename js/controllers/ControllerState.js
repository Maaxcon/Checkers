export class ControllerState {
    #selectedCell = null;
    #validMoves = [];
    #historyHighlight = null;
    #isAnimating = false;

    get selectedCell() { return this.#selectedCell; }
    get validMoves() { return this.#validMoves; }
    get historyHighlight() { return this.#historyHighlight; }
    get isAnimating() { return this.#isAnimating; }
    findMoveTarget(row, col) {
        return this.#validMoves.find(m => m.row === row && m.col === col);
    }

    setAnimating(value) {
        this.#isAnimating = value;
    }

    clearSelection() {
        this.#selectedCell = null;
        this.#validMoves = [];
    }

    selectCell(row, col, validMoves = []) {
        this.#selectedCell = { row, col };
        this.#validMoves = validMoves;
    }

    setHistoryHighlight(value) {
        this.#historyHighlight = value;
    }
}
