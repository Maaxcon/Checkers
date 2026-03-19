export class CheckersController {
    #model; #view; #selectedCell; #validMoves; #isAnimating;

    constructor(model, view) {
        this.#model = model;
        this.#view = view;
        this.#selectedCell = null;
        this.#validMoves = [];
        this.#isAnimating = false;

        this.#view.bindSquareClick((row, col) => this.#handleSquareClick(row, col));
        this.#view.bindRestartClick(() => this.#handleRestartGame());
        this.#view.bindUndoClick(() => this.#handleUndo());
        this.#updateView();
        
    }


    #handleUndo() {
        if(this.#isAnimating) return;
        this.#model.undo();
        this.#selectedCell = null;
        this.#validMoves = [];
        
        this.#updateView();
}

    #handleSquareClick(row, col) {
        if (this.#isAnimating || this.#model.winner) return;

        const moveTarget = this.#validMoves.find(m => m.row === row && m.col === col);
        
        if (moveTarget && this.#selectedCell) {
            this.#isAnimating = true;
            this.#view.hideSelectionAndHighlights(); 

            this.#view.animateMove(this.#selectedCell.row, this.#selectedCell.col, row, col, () => {
                const turnComplete = this.#model.movePiece(this.#selectedCell.row, this.#selectedCell.col, row, col, moveTarget);
                if (!turnComplete) {
                    this.#selectedCell = { row: row, col: col };
                    this.#validMoves = this.#model.getValidMoves(row, col); 
                } else {
                    this.#selectedCell = null;
                    this.#validMoves = [];
                }
                this.#updateView();
                this.#isAnimating = false;
                if (this.#model.winner) this.#view.showWinner(this.#model.winner);
            });
            return;
        }

        if (this.#model.multiJumpPiece) return;

        const piece = this.#model.board[row][col];
        if (piece !== null && piece.player === this.#model.currentTurn) {
            this.#selectedCell = { row: row, col: col };
            this.#validMoves = this.#model.getValidMoves(row, col);
        } else {
            this.#selectedCell = null;
            this.#validMoves = [];
        }
        this.#updateView();
    }

    #updateView() {
        this.#view.renderBoard(this.#model.board, this.#selectedCell, this.#validMoves, this.#model.currentTurn);
    }

    #handleRestartGame() {
        if (this.#isAnimating) return;
        this.#model.resetGame();
        this.#selectedCell = null;
        this.#validMoves = [];
        this.#view.hideWinner();
        this.#updateView();
        
    }
}