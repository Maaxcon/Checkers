import { GameState } from './GameState.js';
import { MoveValidator } from './MoveValidator.js';
import { GameStorage } from '../utils/GameStorage.js'; 

export class CheckersModel {
    #state;
    #history = [];
    #selectedCell = null;
    #validMoves = [];

    constructor() {
        this.#state = new GameState(); 
        this.#init();
    }

    #init() {
        const savedData = GameStorage.load();
        if (savedData) {
            this.#state.restore(savedData); 
            if (savedData.history) {
                this.#history = savedData.history.map(stateData => {
                    const state = new GameState();
                    state.restore(stateData);
                    return state;
                });
            }
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
    
    get selectedCell() { return this.#selectedCell; }
    get validMoves() { return this.#validMoves; }

    undo() {
        if (this.#history.length === 0) return; 
        
        this.#state = this.#history.pop();
        
        this.clearSelection(); 
        this.#save();
    }

    #save() {
        GameStorage.save({
            grid: this.#state.boardMatrix,
            turn: this.#state.currentTurn,
            history: this.#history.map(state => state.toJSON()),
            winner: this.#state.winner,
            multiJumpPiece: this.#state.multiJumpPiece
        });
    }

    resetGame() {
        this.#state.reset();
        this.#history = []; 
        this.clearSelection(); 
        GameStorage.clear();
    }

    getValidMoves(row, col) {
        return MoveValidator.getValidMoves(this.#state, row, col);
    }

    selectSquare(row, col) {
        if (this.#state.multiJumpPiece) return;

        const piece = this.board[row][col];
        
        if (piece !== null && piece.player === this.currentTurn) {
            this.#selectedCell = { row, col };
            this.#validMoves = this.getValidMoves(row, col);
        } else {
            this.clearSelection();
        }
    }

    clearSelection() {
        this.#selectedCell = null;
        this.#validMoves = [];
    }

    movePiece(fromRow, fromCol, toRow, toCol, moveInfo) {
        if (!this.#state.multiJumpPiece) {
            this.#history.push(this.#state.clone());
        }

        const result = this.#state.executeMove(fromRow, fromCol, toRow, toCol, moveInfo);

        if (moveInfo.type === 'capture' && !result.becameKing) {
            if (MoveValidator.getCapturesForPiece(this.#state, toRow, toCol).length > 0) {
                this.#state.setMultiJumpPiece(toRow, toCol); 
                
                this.#selectedCell = { row: toRow, col: toCol };
                this.#validMoves = this.getValidMoves(toRow, toCol);
                
                this.#save();
                return false; 
            }
        }

        this.#state.clearMultiJumpPiece();
        this.#state.switchTurn();
        this.clearSelection(); 

        const winner = MoveValidator.calculateWinner(this.#state);
        if (winner) this.#state.setWinner(winner);
        
        this.#save();
        return true; 
    }
}