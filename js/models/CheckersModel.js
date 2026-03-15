import { GameState } from './GameState.js';
import { MoveValidator } from './MoveValidator.js';

export class CheckersModel {
    #state;

    constructor() {
        this.#state = new GameState(); 
    }

    get board() { return this.#state.boardMatrix; }
    get currentTurn() { return this.#state.currentTurn; }
    get multiJumpPiece() { return this.#state.multiJumpPiece; }
    get winner() { return this.#state.winner; }

    resetGame() {
        this.#state.reset();
    }

    getValidMoves(row, col) {
        return MoveValidator.getValidMoves(this.#state, row, col);
    }

    movePiece(fromRow, fromCol, toRow, toCol, moveInfo) {
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