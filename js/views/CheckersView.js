import { BOARD, PLAYERS, CSS } from '../constants.js';
import { AnimationHelper } from '../utils/AnimationHelper.js';
import { HistoryView } from './HistoryView.js';
import { TimerView } from './TimerView.js';

export class CheckersView {
    #root; 
    #boardElement; 
    #winMessage; 
    #winText;
    
    #historyView; 
    #timerView; 

    #onSquareClick; 
    #onRestartClick; 
    #onUndoClick;
    #onDragStart; 
    #onDrop;      
    #keyboardCursor = null;

    constructor(root) {
        this.#root = root;
        this.#createLayout();
        this.#initDragAndDrop();
        this.#initKeyboardNavigation();
    }

    get historyView() {
        return this.#historyView;
    }

    get timerView() {
        return this.#timerView;
    }

    #createLayout() {
        this.#root.innerHTML = '';
        
        const gameContainer = document.createElement("div");
        gameContainer.className = "game-container"; 

        const main = document.createElement("main");
        main.className = "game-section"; 
        
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

        this.#winMessage = document.createElement("div");
        this.#winMessage.className = "win-message";
        this.#winMessage.style.display = "none";
        this.#winText = document.createElement("h3");
        this.#winText.className = "win-title";

      
        const undoBtn = document.createElement("button");
        undoBtn.textContent = "Undo ↩";
        undoBtn.className = "btn-undo"; 
        undoBtn.onclick = () => this.#onUndoClick?.();

        const btn = document.createElement("button");
        btn.textContent = "Play Again";
        btn.className = "btn-restart";
        btn.onclick = () => this.#onRestartClick?.();

        this.#winMessage.append(this.#winText, btn);
        main.append(undoBtn, this.#boardElement, this.#winMessage);

        this.#timerView = new TimerView(main);

        gameContainer.append(main);
        
        this.#historyView = new HistoryView(gameContainer);

        this.#root.append(gameContainer);

        this.#boardElement.onclick = (e) => {
            this.#keyboardCursor = null; 
            this.#updateKeyboardVisuals();
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

            setTimeout(() => checker.style.opacity = '0.5', 0);
            
            this.#onDragStart?.(row, col);
        });

        this.#boardElement.addEventListener('dragend', (e) => { 
            const checker = e.target.closest(`.${CSS.CHECKER}`);
            if (checker) checker.style.opacity = '1';
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


    #initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '];
            
            if (!validKeys.includes(e.key)) return;
            

            e.preventDefault();

            if (!this.#keyboardCursor) {
                this.#keyboardCursor = { row: 3, col: 3 };
            } else {
                switch (e.key) {
                    case 'ArrowUp':
                        this.#keyboardCursor.row = Math.max(0, this.#keyboardCursor.row - 1);
                        break;
                    case 'ArrowDown':
                        this.#keyboardCursor.row = Math.min(BOARD.ROWS - 1, this.#keyboardCursor.row + 1);
                        break;
                    case 'ArrowLeft':
                        this.#keyboardCursor.col = Math.max(0, this.#keyboardCursor.col - 1);
                        break;
                    case 'ArrowRight':
                        this.#keyboardCursor.col = Math.min(BOARD.COLS - 1, this.#keyboardCursor.col + 1);
                        break;
                    case 'Enter':
                    case ' ':
                        this.#onSquareClick?.(this.#keyboardCursor.row, this.#keyboardCursor.col);
                        break;
                }
            }
            this.#updateKeyboardVisuals();
        });
    }

    #updateKeyboardVisuals() {
        const oldFocused = this.#boardElement.querySelector('.is-keyboard-focused');
        if (oldFocused) oldFocused.classList.remove('is-keyboard-focused');

        if (this.#keyboardCursor) {
            const index = this.#keyboardCursor.row * BOARD.COLS + this.#keyboardCursor.col;
            const cell = this.#boardElement.children[index];
            if (cell) cell.classList.add('is-keyboard-focused');
        }
    }

    bindUndoClick(handler) { this.#onUndoClick = handler; }
    bindSquareClick(handler) { this.#onSquareClick = handler; }
    bindRestartClick(handler) { this.#onRestartClick = handler; }
    bindDragStart(handler) { this.#onDragStart = handler; }
    bindDrop(handler) { this.#onDrop = handler; }

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

    showWinner(id) {
        this.#winText.textContent = id === "TIMEOUT" ? "Time's up!" : `${id === PLAYERS.LIGHT ? "White" : "Black"} Wins!`;
        this.#winMessage.style.display = "flex";
        this.#boardElement.style.pointerEvents = "none";
    }

    hideWinner() {
        this.#winMessage.style.display = "none";
        this.#boardElement.style.pointerEvents = "auto";
    }
}