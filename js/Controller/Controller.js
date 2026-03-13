export class CheckersController {
    #model; #view; #selectedCell; #validMoves; #isAnimating;

    constructor(model, view) {
        this.#model = model;
        this.#view = view;
        this.#selectedCell = null;
        this.#validMoves = [];
        this.#isAnimating = false;

        this.#view.bindSquareClick((r, c) => this.#handleSquareClick(r, c));
        this.#view.bindRestartClick(() => this.#handleRestartGame());
        this.#updateView();
    }

    #handleSquareClick(row, col) {
        if (this.#isAnimating || this.#model.winner) return;

        const moveTarget = this.#validMoves.find(m => m.r === row && m.c === col);
        
        if (moveTarget && this.#selectedCell) {
            this.#isAnimating = true;
            this.#view.hideSelectionAndHighlights(); 

            this.#view.animateMove(this.#selectedCell.r, this.#selectedCell.c, row, col, () => {
                const turnComplete = this.#model.movePiece(this.#selectedCell.r, this.#selectedCell.c, row, col, moveTarget);
                if (!turnComplete) {
                    this.#selectedCell = { r: row, c: col };
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
            this.#selectedCell = { r: row, c: col };
            this.#validMoves = this.#model.getValidMoves(row, col);
        } else {
            this.#selectedCell = null;
            this.#validMoves = [];
        }
        this.#updateView();
    }

    #updateView() {
        this.#view.renderBoard(this.#model.board, this.#selectedCell, this.#validMoves);
    }

    #handleRestartGame() {
        this.#model.resetGame();
        this.#selectedCell = null;
        this.#validMoves = [];
        this.#view.hideWinner();
        this.#updateView();
    }
}