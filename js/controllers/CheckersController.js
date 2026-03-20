export class CheckersController {
    #model; 
    #view; 
    #isAnimating;

    constructor(model, view) {
        this.#model = model;
        this.#view = view;
        this.#isAnimating = false;

        this.#view.bindSquareClick((row, col) => this.#handleSquareClick(row, col));
        this.#view.bindRestartClick(() => this.#handleRestartGame());
        this.#view.bindUndoClick(() => this.#handleUndo());
        this.#updateView();
    }

    #handleUndo() {
        if(this.#isAnimating) return;
        this.#model.undo();
        this.#updateView();
    }

    #handleSquareClick(row, col) {
        if (this.#isAnimating || this.#model.winner) return;

        const currentSelection = this.#model.selectedCell;
        const moveTarget = this.#model.validMoves.find(m => m.row === row && m.col === col);
        
        if (moveTarget && currentSelection) {
            this.#isAnimating = true;
            this.#view.hideSelectionAndHighlights(); 

            this.#view.animateMove(currentSelection.row, currentSelection.col, row, col, () => {
                this.#model.movePiece(currentSelection.row, currentSelection.col, row, col, moveTarget);
                
                this.#updateView();
                this.#isAnimating = false;
                if (this.#model.winner) this.#view.showWinner(this.#model.winner);
            });
            return;
        }

        this.#model.selectSquare(row, col);
        this.#updateView();
    }

    #updateView() {
        this.#view.renderBoard(
            this.#model.board, 
            this.#model.selectedCell, 
            this.#model.validMoves, 
            this.#model.currentTurn
        );
    }

    #handleRestartGame() {
        if (this.#isAnimating) return;
        this.#model.resetGame();
        this.#view.hideWinner();
        this.#updateView();
    }
}