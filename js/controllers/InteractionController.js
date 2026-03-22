import { BOARD } from '../constants.js';

export class InteractionController {
    #model;
    #view;
    #state;
    #viewUpdater;
    #persistState;
    #keyboardCursor = null;
    #keyboardHandler = null;

    constructor(model, view, state, viewUpdater, persistState) {
        this.#model = model;
        this.#view = view;
        this.#state = state;
        this.#viewUpdater = viewUpdater;
        this.#persistState = persistState;
        this.#initKeyboard();
    }

    handleDragStart(row, col) {
        if (this.#state.isAnimating || this.#model.winner) return;

        this.resetKeyboardCursor();
        this.#state.setHistoryHighlight(null);

        if (this.#model.multiJumpPiece) {
            const locked = this.#model.multiJumpPiece;
            if (locked.row !== row || locked.col !== col) return;
        }

        const piece = this.#model.board[row][col];
        if (piece && piece.player === this.#model.currentTurn) {
            const hasGlobalCaptures = this.#model.getPlayerMoveStatus().hasCaptures;
            this.#state.selectCell(row, col, this.#model.getValidMoves(row, col, hasGlobalCaptures));
            this.#viewUpdater.render();
        }
    }

    handleInteraction(row, col) {
        if (this.#state.isAnimating || this.#model.winner) return;

        this.resetKeyboardCursor();
        this.#state.setHistoryHighlight(null);

        const moveTarget = this.#state.findMoveTarget(row, col);

        if (moveTarget && this.#state.selectedCell) {
            this.#state.setAnimating(true);
            this.#view.hideSelectionAndHighlights();

            const fromRow = this.#state.selectedCell.row;
            const fromCol = this.#state.selectedCell.col;

            this.#view.animateMove(fromRow, fromCol, row, col, () => {
                const turnEnded = this.#model.movePiece(fromRow, fromCol, row, col, moveTarget);
                this.#persistState();

                if (!turnEnded) {
                    const hasGlobalCaptures = this.#model.getPlayerMoveStatus().hasCaptures;
                    this.#state.selectCell(row, col, this.#model.getValidMoves(row, col, hasGlobalCaptures));
                } else {
                    this.#state.clearSelection();
                }

                this.#viewUpdater.render();
                this.#state.setAnimating(false);
            });
            return;
        }

        if (this.#model.multiJumpPiece) {
            const locked = this.#model.multiJumpPiece;
            if (locked.row !== row || locked.col !== col) return;
        }

        const piece = this.#model.board[row][col];
        if (piece && piece.player === this.#model.currentTurn) {
            const hasGlobalCaptures = this.#model.getPlayerMoveStatus().hasCaptures;
            this.#state.selectCell(row, col, this.#model.getValidMoves(row, col, hasGlobalCaptures));
        } else {
            this.#state.clearSelection();
        }

        this.#viewUpdater.render();
    }

    resetKeyboardCursor() {
        this.#keyboardCursor = null;
        this.#view.updateKeyboardCursor(null);
    }

    destroy() {
        if (this.#keyboardHandler) {
            document.removeEventListener('keydown', this.#keyboardHandler);
            this.#keyboardHandler = null;
        }
    }

    #initKeyboard() {
        this.#keyboardHandler = (e) => this.#handleKeyDown(e);
        document.addEventListener('keydown', this.#keyboardHandler);
    }

    #handleKeyDown(e) {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '];
        if (!keys.includes(e.key)) return;
        e.preventDefault();

        if (!this.#keyboardCursor) {
            this.#keyboardCursor = { row: 3, col: 3 };
        } else {
            if (e.key === 'ArrowUp') this.#keyboardCursor.row = Math.max(0, this.#keyboardCursor.row - 1);
            if (e.key === 'ArrowDown') this.#keyboardCursor.row = Math.min(BOARD.ROWS - 1, this.#keyboardCursor.row + 1);
            if (e.key === 'ArrowLeft') this.#keyboardCursor.col = Math.max(0, this.#keyboardCursor.col - 1);
            if (e.key === 'ArrowRight') this.#keyboardCursor.col = Math.min(BOARD.COLS - 1, this.#keyboardCursor.col + 1);
            if (e.key === 'Enter' || e.key === ' ') {
                this.handleInteraction(this.#keyboardCursor.row, this.#keyboardCursor.col);
                return;
            }
        }
        this.#view.updateKeyboardCursor(this.#keyboardCursor);
    }
}
