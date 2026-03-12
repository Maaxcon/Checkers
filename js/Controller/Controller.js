export class CheckersController {
    #model;
    #view;
    #selectedCell;
    #validMoves;
    #isAnimating;

    constructor(model, view) {
        this.#model = model;
        this.#view = view;
        this.#selectedCell = null;
        this.#validMoves = [];
        this.#isAnimating = false;

        this.#view.bindSquareClick((row, col) => this.#handleSquareClick(row, col));
        this.#view.bindRestartClick(() => this.#handleRestartGame());
        
        this.#updateView();
    }

    #handleSquareClick(row, col) {
        if (this.#isAnimating) return; 
        if (this.#model.winner) return; 

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
                    this.#clearSelection();
                }

                this.#updateView();
                this.#isAnimating = false;

                if (this.#model.winner) {
                    this.#view.showWinner(this.#model.winner);
                }
            });
            return;
        }

        if (this.#model.multiJumpPiece) { return; }

        const board = this.#model.board;
        const clickedValue = board[row][col];
        
        const isCurrentLight = this.#model.currentTurn === 1 && (clickedValue === 1 || clickedValue === 3);
        const isCurrentDark = this.#model.currentTurn === 2 && (clickedValue === 2 || clickedValue === 4);

        if (isCurrentLight || isCurrentDark) {
            this.#selectedCell = { r: row, c: col };
            this.#validMoves = this.#model.getValidMoves(row, col);
            this.#updateView();
            return;
        }

        this.#clearSelection();
        this.#updateView();
    }

    #clearSelection() {
        this.#selectedCell = null;
        this.#validMoves = [];
    }

    #updateView() {
        this.#view.renderBoard(this.#model.board, this.#selectedCell, this.#validMoves);
    }

    #handleRestartGame() {
        this.#model.resetGame(); 
        this.#clearSelection();  
        this.#view.hideWinner(); 
        this.#updateView();      
    }
}