import { BOARD, PLAYERS, CSS } from '../constants.js';

export class CheckersView {
    #root;
    #boardElement;
    #onSquareClick; 
    #onRestartClick; 
    winMessage;
    winTextElement;

    constructor(rootElement) {
        this.#root = rootElement;
        this.#createLayout();
    }

    #createLayout() {
        this.#root.innerHTML = ''; 
        
        const section = document.createElement("main");
        section.classList.add("game-section");
        
        const title = document.createElement("h2");
        title.classList.add("game-section__title");
        title.textContent = "Checkers";
        
        this.#boardElement = document.createElement("div");
        this.#boardElement.classList.add(CSS.BOARD);

        this.winMessage = document.createElement("div");
        this.winMessage.classList.add("win-message");
        this.winMessage.style.display = "none"; 

        this.winTextElement = document.createElement("h3");

        const restartButton = document.createElement("button");
        restartButton.textContent = "Play Again";
        restartButton.classList.add("btn-restart");
        restartButton.addEventListener('click', () => {
            if (this.#onRestartClick) this.#onRestartClick();
        });

        this.winMessage.append(this.winTextElement, restartButton);
        section.append(title, this.#boardElement, this.winMessage);
        this.#root.append(section);

        this.#boardElement.addEventListener('click', (e) => this.#handleClick(e));
    }

    bindSquareClick(handler) {
        this.#onSquareClick = handler;
    }

    bindRestartClick(handler) {
        this.#onRestartClick = handler;
    }

    #handleClick(e) {
        const cell = e.target.closest(`.${CSS.CELL}`);
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (this.#onSquareClick) {
            this.#onSquareClick(row, col);
        }
    }

    hideSelectionAndHighlights() {
        const highlighted = this.#boardElement.querySelectorAll(`.${CSS.HIGHLIGHT}`);
        const selected = this.#boardElement.querySelectorAll(`.${CSS.SELECTED}`);
        highlighted.forEach(el => el.classList.remove(CSS.HIGHLIGHT));
        selected.forEach(el => el.classList.remove(CSS.SELECTED));
    }

    animateMove(fromR, fromC, toR, toC, onComplete) {
        const startCell = this.#boardElement.querySelector(`[data-row="${fromR}"][data-col="${fromC}"]`);
        const endCell = this.#boardElement.querySelector(`[data-row="${toR}"][data-col="${toC}"]`);
        
        if (!startCell || !endCell) { onComplete(); return; }

        const piece = startCell.querySelector(`.${CSS.CHECKER}`);
        if (!piece) { onComplete(); return; }

        const startRect = piece.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();

        const clone = piece.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.top = `${startRect.top}px`;
        clone.style.left = `${startRect.left}px`;
        clone.style.margin = '0';
        clone.style.zIndex = '1000';
        clone.style.pointerEvents = 'none'; 
        document.body.appendChild(clone);
        
        piece.style.opacity = '0'; 

        const deltaX = endRect.left - startRect.left + (endRect.width - startRect.width) / 2;
        const deltaY = endRect.top - startRect.top + (endRect.height - startRect.height) / 2;

        const animation = clone.animate([
            { transform: 'translate(0, 0)' },
            { transform: `translate(${deltaX}px, ${deltaY}px)` }
        ], { duration: 300, easing: 'ease-in-out' });

        animation.onfinish = () => { clone.remove(); onComplete(); };
    }

    renderBoard(boardData, selectedCell = null, validMoves = []) {
        this.#boardElement.innerHTML = ''; 

        this.#boardElement.style.gridTemplateColumns = `repeat(${BOARD.COLS}, var(--square-size))`;
        this.#boardElement.style.gridTemplateRows = `repeat(${BOARD.ROWS}, var(--square-size))`;

        for (let r = 0; r < BOARD.ROWS; r++) {
            for (let c = 0; c < BOARD.COLS; c++) {
                const cellValue = boardData[r][c];
                const cell = document.createElement('div');
                
                cell.classList.add(CSS.CELL);
                cell.classList.add((r + c) % 2 === 0 ? CSS.CELL_WHITE : CSS.CELL_BLACK);
                
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (cellValue !== PLAYERS.EMPTY) {
                    const checker = document.createElement('button');
                    checker.classList.add(CSS.CHECKER);
                    
                    if (cellValue === PLAYERS.LIGHT || cellValue === PLAYERS.LIGHT_KING) checker.classList.add(CSS.CHECKER_LIGHT);
                    if (cellValue === PLAYERS.DARK || cellValue === PLAYERS.DARK_KING) checker.classList.add(CSS.CHECKER_DARK);
                    
                    if (cellValue === PLAYERS.LIGHT_KING || cellValue === PLAYERS.DARK_KING) {
                        checker.classList.add(CSS.CHECKER_KING);
                    }
                    
                    if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
                        checker.classList.add(CSS.SELECTED);
                    }
                    cell.append(checker);
                }

                const isMoveTarget = validMoves.find(m => m.r === r && m.c === c);
                if (isMoveTarget) { cell.classList.add(CSS.HIGHLIGHT); }

                this.#boardElement.append(cell);
            }
        }
    }

    showWinner(winnerId) {
        const winnerName = winnerId === PLAYERS.LIGHT ? "White" : "Black";
        this.winTextElement.textContent = `${winnerName} Wins!`;
        this.winMessage.style.display = "flex"; 
        this.#boardElement.style.opacity = "0.5"; 
        this.#boardElement.style.pointerEvents = "none"; 
    }

    hideWinner() {
        this.winMessage.style.display = "none";
        this.#boardElement.style.opacity = "1";
        this.#boardElement.style.pointerEvents = "auto";
    }
}