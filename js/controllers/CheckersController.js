import { GameTimer } from '../models/GameTimer.js';

export class CheckersController {
    #model; 
    #view; 
    #isAnimating;
    #timer; 

    constructor(model, view) {
        this.#model = model;
        this.#view = view;
        this.#isAnimating = false;

        this.#timer = new GameTimer(
            (times) => this.#view.timerView.render(times, this.#model.currentTurn),
            (winner) => {
                this.#view.showWinner(winner); 
            }
        );

        this.#view.bindSquareClick((row, col) => this.#handleInteraction(row, col));
        this.#view.bindDrop((row, col) => this.#handleInteraction(row, col)); 
        this.#view.bindDragStart((row, col) => this.#handleDragStart(row, col)); 
        this.#view.bindRestartClick(() => this.#handleRestartGame());
        this.#view.bindUndoClick(() => this.#handleUndo());
        
        this.#view.historyView.bindClick((from, to) => this.#handleHistoryClick(from, to));
        
        this.#updateView();

        if (!this.#model.winner) {
            this.#timer.start(this.#model.currentTurn);
        }
    }

    #handleHistoryClick(from, to) {
        if (this.#isAnimating) return;
        this.#model.setHistoryHighlight(from, to);
        this.#updateView();
    }

    #handleUndo() {
        if(this.#isAnimating) return;
        this.#model.undo();
        this.#updateView();
        
        if (!this.#model.winner) {
            this.#view.hideWinner();
            this.#timer.start(this.#model.currentTurn);
            this.#timer.switchTurn(this.#model.currentTurn);
        }
    }

    #handleDragStart(row, col) {
        if (this.#isAnimating || this.#model.winner) return;
        
        this.#model.clearHistoryHighlight(); 
        this.#model.selectSquare(row, col);
        this.#updateView();
    }

    #handleInteraction(row, col) {
        if (this.#isAnimating || this.#model.winner) return;
        
        this.#model.clearHistoryHighlight(); 

        const currentSelection = this.#model.selectedCell;
        const moveTarget = this.#model.validMoves.find(m => m.row === row && m.col === col);
        
        if (moveTarget && currentSelection) {
            this.#isAnimating = true;
            this.#view.hideSelectionAndHighlights(); 

            this.#view.animateMove(currentSelection.row, currentSelection.col, row, col, () => {
                this.#model.movePiece(currentSelection.row, currentSelection.col, row, col, moveTarget);
                
                this.#updateView();
                this.#isAnimating = false;
                
                if (this.#model.winner) {
                    this.#view.showWinner(this.#model.winner);
                    this.#timer.stop(); 
                } else {
                    this.#timer.switchTurn(this.#model.currentTurn);
                }
            });
            return;
        }

        this.#model.selectSquare(row, col);
        this.#updateView();
    }

    #updateView() {
        this.#view.renderBoard(
            this.#model.board, 
            this.#model.selectedCell, 
            this.#model.validMoves, 
            this.#model.currentTurn,
            this.#model.historyHighlight
        );
        
        this.#view.historyView.render(this.#model.moveLog);
    }

    #handleRestartGame() {
        if (this.#isAnimating) return;
        this.#model.resetGame();
        this.#view.hideWinner();
        this.#updateView();

        this.#timer.reset();
        this.#timer.start(this.#model.currentTurn);
    }
}