import { BOARD, PLAYERS, CSS } from '../../constants.ts';
import { AnimationHelper } from '../../utils/AnimationHelper.ts';
import type { Player } from '../../constants.ts';
import type { BoardGrid, HistoryHighlight, Move, Position } from '../../types.ts';

export class BoardView {
    #boardElement!: HTMLDivElement;
    #onSquareClick: ((row: number, col: number) => void) | null = null;
    #onDragStart: ((row: number, col: number) => void) | null = null;
    #onDrop: ((row: number, col: number) => void) | null = null;

    constructor() {
        this.#createBoard();
        this.#initDragAndDrop();
    }

    get element(): HTMLDivElement {
        return this.#boardElement;
    }

    setInteractive(isInteractive: boolean): void {
        this.#boardElement.style.pointerEvents = isInteractive ? "auto" : "none";
    }

    bindSquareClick(handler: (row: number, col: number) => void): void { this.#onSquareClick = handler; }
    bindDragStart(handler: (row: number, col: number) => void): void { this.#onDragStart = handler; }
    bindDrop(handler: (row: number, col: number) => void): void { this.#onDrop = handler; }

    updateKeyboardCursor(cursor: Position | null): void {
        const oldFocused = this.#boardElement.querySelector('.is-keyboard-focused');
        if (oldFocused) oldFocused.classList.remove('is-keyboard-focused');

        if (cursor) {
            const index = cursor.row * BOARD.COLS + cursor.col;
            const cell = this.#boardElement.children[index] as HTMLElement | undefined;
            cell?.classList.add('is-keyboard-focused');
        }
    }

    renderBoard(
        boardData: BoardGrid,
        selectedCell: Position | null = null,
        validMoves: Move[] = [],
        currentPlayer: Player = PLAYERS.LIGHT,
        historyHighlight: HistoryHighlight | null = null
    ): void {
        void currentPlayer;
        for (let row = 0; row < BOARD.ROWS; row++) {
            for (let col = 0; col < BOARD.COLS; col++) {
                const cellIndex = row * BOARD.COLS + col;
                const cell = this.#boardElement.children[cellIndex] as HTMLElement | undefined;
                if (!cell) continue;

                const isHighlighted = validMoves.some(move => move.row === row && move.col === col);
                const isSelected = selectedCell !== null && selectedCell.row === row && selectedCell.col === col;

                const isHistoryPoint = historyHighlight && (
                    (row === historyHighlight.from.row && col === historyHighlight.from.col) ||
                    (row === historyHighlight.to.row && col === historyHighlight.to.col)
                );

                cell.classList.toggle(CSS.HIGHLIGHT, isHighlighted);
                cell.classList.toggle(CSS.SELECTED, isSelected);
                cell.classList.toggle('is-history-highlight', !!isHistoryPoint);

                const pieceObj = boardData[row][col];
                let checker = cell.querySelector(`.${CSS.CHECKER}`) as HTMLDivElement | null;

                if (pieceObj !== null) {
                    if (!checker) {
                        checker = document.createElement('div');
                        checker.setAttribute('draggable', 'true');
                        cell.appendChild(checker);
                    }

                    checker.className = `${CSS.CHECKER} ${pieceObj.player === PLAYERS.LIGHT ? CSS.CHECKER_LIGHT : CSS.CHECKER_DARK}`;
                    if (pieceObj.isKing) checker.classList.add(CSS.CHECKER_KING);

                } else {
                    if (checker) {
                        checker.remove();
                    }
                }
            }
        }
    }

    animateMove(fromRow: number, fromCol: number, toRow: number, toCol: number, onAnimationComplete: () => void): void {
        const piece = this.#boardElement.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"] .${CSS.CHECKER}`) as HTMLElement | null;
        const target = this.#boardElement.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`) as HTMLElement | null;
        if (piece && target) AnimationHelper.movePiece(piece, target, onAnimationComplete);
        else onAnimationComplete();
    }

    hideSelectionAndHighlights(): void {
        this.#boardElement.querySelectorAll(`.${CSS.SELECTED}, .${CSS.HIGHLIGHT}`).forEach(el => {
            el.classList.remove(CSS.SELECTED, CSS.HIGHLIGHT);
        });
    }

    #createBoard(): void {
        this.#boardElement = document.createElement("div");
        this.#boardElement.className = CSS.BOARD;

        this.#boardElement.style.gridTemplateColumns = `repeat(${BOARD.COLS}, var(--square-size))`;
        this.#boardElement.style.gridTemplateRows = `repeat(${BOARD.ROWS}, var(--square-size))`;

        for (let row = 0; row < BOARD.ROWS; row++) {
            for (let col = 0; col < BOARD.COLS; col++) {
                const cell = document.createElement('div');
                cell.classList.add(CSS.CELL);
                cell.classList.add((row + col) % 2 === 0 ? CSS.CELL_WHITE : CSS.CELL_BLACK);
                cell.dataset.row = row.toString();
                cell.dataset.col = col.toString();
                this.#boardElement.append(cell);
            }
        }

        this.#boardElement.onclick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const cell = target?.closest<HTMLElement>(`.${CSS.CELL}`);
            if (!cell) return;
            const rowValue = cell.dataset.row;
            const colValue = cell.dataset.col;
            if (rowValue === undefined || colValue === undefined) return;
            this.#onSquareClick?.(parseInt(rowValue, 10), parseInt(colValue, 10));
        };
    }

    #initDragAndDrop(): void {
        this.#boardElement.addEventListener('dragstart', (event: DragEvent) => {
            const target = event.target as HTMLElement | null;
            const checker = target?.closest<HTMLElement>(`.${CSS.CHECKER}`);
            if (!checker) { event.preventDefault(); return; }

            const cell = checker.closest<HTMLElement>(`.${CSS.CELL}`);
            if (!cell) return;
            const rowValue = cell.dataset.row;
            const colValue = cell.dataset.col;
            if (rowValue === undefined || colValue === undefined) return;
            const row = parseInt(rowValue, 10);
            const col = parseInt(colValue, 10);

            if (!event.dataTransfer) return;
            event.dataTransfer.setData('application/json', JSON.stringify({ row, col }));
            event.dataTransfer.effectAllowed = 'move';

            this.#onDragStart?.(row, col);
        });

        this.#boardElement.addEventListener('dragover', (event: DragEvent) => {
            const target = event.target as HTMLElement | null;
            const cell = target?.closest<HTMLElement>(`.${CSS.CELL}`);
            if (cell && cell.classList.contains(CSS.HIGHLIGHT)) {
                event.preventDefault();
                if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = 'move';
                }
            }
        });

        this.#boardElement.addEventListener('drop', (event: DragEvent) => {
            event.preventDefault();
            const target = event.target as HTMLElement | null;
            const cell = target?.closest<HTMLElement>(`.${CSS.CELL}`);
            if (!cell || !cell.classList.contains(CSS.HIGHLIGHT)) return;

            const rowValue = cell.dataset.row;
            const colValue = cell.dataset.col;
            if (rowValue === undefined || colValue === undefined) return;
            const targetRow = parseInt(rowValue, 10);
            const targetCol = parseInt(colValue, 10);

            this.#onDrop?.(targetRow, targetCol);
        });
    }

}
