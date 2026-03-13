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

    movePiece(fromR, fromC, toR, toC, moveInfo) {
        const result = this.#state.executeMove(fromR, fromC, toR, toC, moveInfo);

        if (moveInfo.type === 'capture' && !result.becameKing) {
            if (MoveValidator.getCapturesForPiece(this.#state, toR, toC).length > 0) {
                this.#state.setMultiJumpPiece(toR, toC); 
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