import { BOARD, PLAYERS, CSS } from '../constants.js';
import { AnimationHelper } from '../utils/AnimationHelper.js';

export class CheckersView {
    #root; 
    #boardElement; 
    #statusTitle;
    #winMessage; 
    #winText;
    #onSquareClick; 
    #onRestartClick; 
    #onUndoClick;

    constructor(root) {
        this.#root = root;
        this.#createLayout();
        this.#initDragAndDrop();
    }

    #createLayout() {
        this.#root.innerHTML = '';
        const main = document.createElement("main");
        main.className = "game-section";
        
        this.#boardElement = document.createElement("div");
        this.#boardElement.className = CSS.BOARD;

        this.#winMessage = document.createElement("div");
        this.#winMessage.className = "win-message";
        this.#winMessage.style.display = "none";
        this.#winText = document.createElement("h3");

        this.#statusTitle = document.createElement("h2");
        this.#statusTitle.classList.add("game-section__title");

        const undoBtn = document.createElement("button");
        undoBtn.textContent = "Undo ↩";
        undoBtn.className = "btn-undo"; 
        undoBtn.onclick = () => this.#onUndoClick?.();

        const btn = document.createElement("button");
        btn.textContent = "Play Again";
        btn.className = "btn-restart";
        btn.onclick = () => this.#onRestartClick?.();

        this.#winMessage.append(this.#winText, btn);
        main.append(this.#statusTitle, undoBtn, this.#boardElement, this.#winMessage);
        this.#root.append(main);

        this.#boardElement.onclick = (e) => {
            const cell = e.target.closest(`.${CSS.CELL}`);
            if (cell) this.#onSquareClick?.(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
        };
    }

    #initDragAndDrop() {
        this.#boardElement.addEventListener('dragstart', (e) => {// коли починається перетягування один раз спрацювоує
            const checker = e.target.closest(`.${CSS.CHECKER}`);
            if (!checker) { e.preventDefault(); return; }

            const cell = checker.closest(`.${CSS.CELL}`);
            const row = cell.dataset.row;
            const col = cell.dataset.col;

            e.dataTransfer.setData('application/json', JSON.stringify({ row, col }));
            e.dataTransfer.effectAllowed = 'move';

            setTimeout(() => checker.style.opacity = '0.5', 0);
            
            setTimeout(() => {
                this.#onSquareClick?.(parseInt(row), parseInt(col));
            }, 0);
        });

        this.#boardElement.addEventListener('dragend', (e) => { // коли закінчується перетягування, на тому елементі, який перетягували
            const checker = e.target.closest(`.${CSS.CHECKER}`);
            if (checker) checker.style.opacity = '1';
        });

        this.#boardElement.addEventListener('dragover', (e) => { // постійно спрацьовує, коли перетягуємо елемент
            const cell = e.target.closest(`.${CSS.CELL}`);
            if (cell && cell.classList.contains(CSS.HIGHLIGHT)) {
                e.preventDefault(); 
                e.dataTransfer.dropEffect = 'move';
            }
        });

        this.#boardElement.addEventListener('drop', (e) => { //     коли відпускаємо перетягуваний елемент
            e.preventDefault(); 
            const cell = e.target.closest(`.${CSS.CELL}`);
            if (!cell || !cell.classList.contains(CSS.HIGHLIGHT)) return;

            const targetRow = parseInt(cell.dataset.row);
            const targetCol = parseInt(cell.dataset.col);

            this.#onSquareClick?.(targetRow, targetCol);
        });
    }

    bindUndoClick(handler) { this.#onUndoClick = handler; }
    bindSquareClick(handler) { this.#onSquareClick = handler; }
    bindRestartClick(handler) { this.#onRestartClick = handler; }

    renderBoard(boardData, selectedCell = null, validMoves = [], currentPlayer = PLAYERS.LIGHT) {
        this.#statusTitle.textContent = currentPlayer === PLAYERS.LIGHT ? "White's Turn" : "Black's Turn";
        this.#boardElement.innerHTML = ''; 

        this.#boardElement.style.gridTemplateColumns = `repeat(${BOARD.COLS}, var(--square-size))`;
        this.#boardElement.style.gridTemplateRows = `repeat(${BOARD.ROWS}, var(--square-size))`;

        for (let row = 0; row < BOARD.ROWS; row++) {
            for (let col = 0; col < BOARD.COLS; col++) {
                const pieceObj = boardData[row][col];
                const isHighlighted = validMoves.some(move => move.row === row && move.col === col);
                const isSelected = selectedCell !== null && selectedCell.row === row && selectedCell.col === col;

                const cellElement = this.#createCellElement(row, col, pieceObj, isHighlighted, isSelected);
                this.#boardElement.append(cellElement);
            }
        }
    }

    #createCellElement(row, col, pieceObj, isHighlighted, isSelected) {
        const cell = document.createElement('div');
        cell.classList.add(CSS.CELL);
        cell.classList.add((row + col) % 2 === 0 ? CSS.CELL_WHITE : CSS.CELL_BLACK);
        
        cell.dataset.row = row;
        cell.dataset.col = col;

        if (pieceObj !== null) {
            const checker = document.createElement('div');
            checker.classList.add(CSS.CHECKER);
            checker.setAttribute('draggable', 'true');

            checker.classList.add(pieceObj.player === PLAYERS.LIGHT ? CSS.CHECKER_LIGHT : CSS.CHECKER_DARK);
            if (pieceObj.isKing) checker.classList.add(CSS.CHECKER_KING);

            cell.appendChild(checker);
        }

        if (isHighlighted) cell.classList.add(CSS.HIGHLIGHT);
        if (isSelected) cell.classList.add(CSS.SELECTED);

        return cell;
    }

    animateMove(fromRow, fromCol, toRow, toCol, onAnimationComplete) {
        const piece = this.#boardElement.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"] .${CSS.CHECKER}`);
        const target = this.#boardElement.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
        if (piece && target) AnimationHelper.movePiece(piece, target, onAnimationComplete);
        else onAnimationComplete();
    }

    hideSelectionAndHighlights() {
        this.#boardElement.querySelectorAll('.is-selected, .is-highlighted').forEach(el => {
            el.classList.remove('is-selected', 'is-highlighted');
        });
    }

    showWinner(id) {
        this.#winText.textContent = `${id === PLAYERS.LIGHT ? "White" : "Black"} Wins!`;
        this.#winMessage.style.display = "flex";
        this.#boardElement.style.pointerEvents = "none";
    }

    hideWinner() {
        this.#winMessage.style.display = "none";
        this.#boardElement.style.pointerEvents = "auto";
    }
}



