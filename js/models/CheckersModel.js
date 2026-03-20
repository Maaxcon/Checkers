import { GameState } from './GameState.js';
import { MoveValidator } from './MoveValidator.js';
import { GameStorage } from '../utils/GameStorage.js'; 
import { PLAYERS } from '../constants.js';  

export class CheckersModel {
    #state;
    #history = [];

    constructor() {
        this.#state = new GameState(); 
        this.#init();
    }

    #init() {
        const savedData = GameStorage.load();
        if (savedData) {
            this.#state.restore(savedData); 
            this.#history = savedData.history || [];
            if (savedData.winner) this.#state.setWinner(savedData.winner);
            if (savedData.multiJumpPiece) {
                this.#state.setMultiJumpPiece(savedData.multiJumpPiece.row, savedData.multiJumpPiece.col);
            }
        }
    }

    get board() { return this.#state.boardMatrix; }
    get currentTurn() { return this.#state.currentTurn; }
    get multiJumpPiece() { return this.#state.multiJumpPiece; }
    get winner() { return this.#state.winner; }

    undo() {
        if (this.#history.length === 0) return; 
        const lastStateJSON = this.#history.pop();
        this.#state.restore(JSON.parse(lastStateJSON));
        this.#save();
    }

    #save() {
        GameStorage.save({
            grid: this.#state.boardMatrix,
            turn: this.#state.currentTurn,
            history: this.#history,
            winner: this.#state.winner,
            multiJumpPiece: this.#state.multiJumpPiece
        });
    }

    resetGame() {
        this.#state.reset();
        this.#history = []; 
        GameStorage.clear();
    }

    getValidMoves(row, col) {
        return MoveValidator.getValidMoves(this.#state, row, col);
    }

    movePiece(fromRow, fromCol, toRow, toCol, moveInfo) {
        if (!this.#state.multiJumpPiece) {
            this.#history.push(JSON.stringify({
                grid: this.#state.boardMatrix,
                turn: this.#state.currentTurn
            }));
        }

        const result = this.#state.executeMove(fromRow, fromCol, toRow, toCol, moveInfo);

        if (moveInfo.type === 'capture' && !result.becameKing) {
            if (MoveValidator.getCapturesForPiece(this.#state, toRow, toCol).length > 0) {
                this.#state.setMultiJumpPiece(toRow, toCol); 
                this.#save();
                return false; 
            }
        }

        this.#state.clearMultiJumpPiece();
        this.#state.switchTurn();

        const winner = MoveValidator.calculateWinner(this.#state);
        if (winner) this.#state.setWinner(winner);
        
        this.#save();
        return true; 
    }
}