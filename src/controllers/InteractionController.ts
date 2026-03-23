import { BOARD } from '../constants.ts';
import type { CheckersModel } from '../models/CheckersModel.ts';
import type { CheckersView } from '../views/CheckersView.ts';
import type { ControllerState } from './ControllerState.ts';
import type { ViewUpdater } from './ViewUpdater.ts';
import type { Position } from '../types.ts';

export class InteractionController {
    #model: CheckersModel;
    #view: CheckersView;
    #state: ControllerState;
    #viewUpdater: ViewUpdater;
    #persistState: () => void;
    #keyboardCursor: Position | null = null;
    #keyboardHandler: ((event: KeyboardEvent) => void) | null = null;

    constructor(model: CheckersModel, view: CheckersView, state: ControllerState, viewUpdater: ViewUpdater, persistState: () => void) {
        this.#model = model;
        this.#view = view;
        this.#state = state;
        this.#viewUpdater = viewUpdater;
        this.#persistState = persistState;
        this.#initKeyboard();
    }

    handleDragStart(row: number, col: number): void {
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

    handleInteraction(row: number, col: number): void {
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

    resetKeyboardCursor(): void {
        this.#keyboardCursor = null;
        this.#view.updateKeyboardCursor(null);
    }

    destroy(): void {
        if (this.#keyboardHandler) {
            document.removeEventListener('keydown', this.#keyboardHandler);
            this.#keyboardHandler = null;
        }
    }

    #initKeyboard(): void {
        this.#keyboardHandler = (event) => this.#handleKeyDown(event);
        document.addEventListener('keydown', this.#keyboardHandler);
    }

    #handleKeyDown(event: KeyboardEvent): void {
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '];
        if (!keys.includes(event.key)) return;
        event.preventDefault();

        if (!this.#keyboardCursor) {
            this.#keyboardCursor = { row: 3, col: 3 };
        } else {
            if (event.key === 'ArrowUp') this.#keyboardCursor.row = Math.max(0, this.#keyboardCursor.row - 1);
            if (event.key === 'ArrowDown') this.#keyboardCursor.row = Math.min(BOARD.ROWS - 1, this.#keyboardCursor.row + 1);
            if (event.key === 'ArrowLeft') this.#keyboardCursor.col = Math.max(0, this.#keyboardCursor.col - 1);
            if (event.key === 'ArrowRight') this.#keyboardCursor.col = Math.min(BOARD.COLS - 1, this.#keyboardCursor.col + 1);
            if (event.key === 'Enter' || event.key === ' ') {
                this.handleInteraction(this.#keyboardCursor.row, this.#keyboardCursor.col);
                return;
            }
        }
        this.#view.updateKeyboardCursor(this.#keyboardCursor);
    }
}
