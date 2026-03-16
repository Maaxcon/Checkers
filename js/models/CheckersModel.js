import { GameState } from './GameState.js';
import { MoveValidator } from './MoveValidator.js';

export class CheckersModel {
    #state;
    #history = [];

    constructor() {
        this.#state = new GameState(); 
    }

    get board() { return this.#state.boardMatrix; }
    get currentTurn() { return this.#state.currentTurn; }
    get multiJumpPiece() { return this.#state.multiJumpPiece; }
    get winner() { return this.#state.winner; }

    undo() {
        if (this.#history.length === 0) return; 

        const lastStateJSON = this.#history.pop();
        const savedData = JSON.parse(lastStateJSON);

        this.#state.restore(savedData);
    }

    resetGame() {
        this.#state.reset();
        this.#history = []; 
    }

    getValidMoves(row, col) {
        return MoveValidator.getValidMoves(this.#state, row, col);
    }

    movePiece(fromRow, fromCol, toRow, toCol, moveInfo) {
        if (!this.#state.multiJumpPiece) {
            const snapshot = JSON.stringify({
                grid: this.#state.boardMatrix,
                turn: this.#state.currentTurn
            });
            this.#history.push(snapshot);
        }

   
        const result = this.#state.executeMove(fromRow, fromCol, toRow, toCol, moveInfo);

        if (moveInfo.type === 'capture' && !result.becameKing) {
            if (MoveValidator.getCapturesForPiece(this.#state, toRow, toCol).length > 0) {
                this.#state.setMultiJumpPiece(toRow, toCol); 
                return false; 
            }
        }

     
        this.#state.clearMultiJumpPiece();
        this.#state.switchTurn();

        const winner = MoveValidator.calculateWinner(this.#state);
        if (winner) {
            this.#state.setWinner(winner);
        }

        return true; 
    }
}