import { BOARD, PLAYERS, CSS } from '../../constants.js';
import { AnimationHelper } from '../../utils/AnimationHelper.js';

export class BoardView {
    #boardElement;
    #onSquareClick;
    #onDragStart;
    #onDrop;

    constructor() {
        this.#createBoard();
        this.#initDragAndDrop();
    }

    get element() {
        return this.#boardElement;
    }

    setInteractive(isInteractive) {
        this.#boardElement.style.pointerEvents = isInteractive ? "auto" : "none";
    }

    bindSquareClick(handler) { this.#onSquareClick = handler; }
    bindDragStart(handler) { this.#onDragStart = handler; }
    bindDrop(handler) { this.#onDrop = handler; }

    updateKeyboardCursor(cursor) {
        const oldFocused = this.#boardElement.querySelector('.is-keyboard-focused');
        if (oldFocused) oldFocused.classList.remove('is-keyboard-focused');

        if (cursor) {
            const index = cursor.row * BOARD.COLS + cursor.col;
            const cell = this.#boardElement.children[index];
            cell?.classList.add('is-keyboard-focused');
        }
    }

    renderBoard(boardData, selectedCell = null, validMoves = [], currentPlayer = PLAYERS.LIGHT, historyHighlight = null) {
        for (let row = 0; row < BOARD.ROWS; row++) {
            for (let col = 0; col < BOARD.COLS; col++) {
                const cellIndex = row * BOARD.COLS + col;
                const cell = this.#boardElement.children[cellIndex];

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
                let checker = cell.querySelector(`.${CSS.CHECKER}`);

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

    animateMove(fromRow, fromCol, toRow, toCol, onAnimationComplete) {
        const piece = this.#boardElement.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"] .${CSS.CHECKER}`);
        const target = this.#boardElement.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
        if (piece && target) AnimationHelper.movePiece(piece, target, onAnimationComplete);
        else onAnimationComplete();
    }

    hideSelectionAndHighlights() {
        this.#boardElement.querySelectorAll(`.${CSS.SELECTED}, .${CSS.HIGHLIGHT}`).forEach(el => {
            el.classList.remove(CSS.SELECTED, CSS.HIGHLIGHT);
        });
    }

    #createBoard() {
        this.#boardElement = document.createElement("div");
        this.#boardElement.className = CSS.BOARD;

        this.#boardElement.style.gridTemplateColumns = `repeat(${BOARD.COLS}, var(--square-size))`;
        this.#boardElement.style.gridTemplateRows = `repeat(${BOARD.ROWS}, var(--square-size))`;

        for (let row = 0; row < BOARD.ROWS; row++) {
            for (let col = 0; col < BOARD.COLS; col++) {
                const cell = document.createElement('div');
                cell.classList.add(CSS.CELL);
                cell.classList.add((row + col) % 2 === 0 ? CSS.CELL_WHITE : CSS.CELL_BLACK);
                cell.dataset.row = row;
                cell.dataset.col = col;
                this.#boardElement.append(cell);
            }
        }

        this.#boardElement.onclick = (e) => {
            const cell = e.target.closest(`.${CSS.CELL}`);
            if (cell) this.#onSquareClick?.(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
        };
    }

    #initDragAndDrop() {
        this.#boardElement.addEventListener('dragstart', (e) => {
            const checker = e.target.closest(`.${CSS.CHECKER}`);
            if (!checker) { e.preventDefault(); return; }

            const cell = checker.closest(`.${CSS.CELL}`);
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            e.dataTransfer.setData('application/json', JSON.stringify({ row, col }));
            e.dataTransfer.effectAllowed = 'move';

            this.#onDragStart?.(row, col);
        });

        this.#boardElement.addEventListener('dragover', (e) => {
            const cell = e.target.closest(`.${CSS.CELL}`);
            if (cell && cell.classList.contains(CSS.HIGHLIGHT)) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }
        });

        this.#boardElement.addEventListener('drop', (e) => {
            e.preventDefault();
            const cell = e.target.closest(`.${CSS.CELL}`);
            if (!cell || !cell.classList.contains(CSS.HIGHLIGHT)) return;

            const targetRow = parseInt(cell.dataset.row);
            const targetCol = parseInt(cell.dataset.col);

            this.#onDrop?.(targetRow, targetCol);
        });
    }

}
