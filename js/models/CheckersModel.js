import { GameState } from './GameState.js';
import { MoveValidator } from './MoveValidator.js';
import { GAME_SETTINGS } from '../constants.js';

export class CheckersModel {
    #state;
    #history = [];

    constructor() {
        this.#state = new GameState(); 
        this.#loadFromStorage();
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
        this.#saveToStorage();
    }

    #saveToStorage() {
        const saveData = {
            grid: this.#state.boardMatrix,
            turn: this.#state.currentTurn,
            history: this.#history,
            winner: this.#state.winner,
            multiJumpPiece: this.#state.multiJumpPiece
        };
        localStorage.setItem(GAME_SETTINGS.STORAGE_KEY, JSON.stringify(saveData));
    }

    #loadFromStorage() {
        const savedJSON = localStorage.getItem(GAME_SETTINGS.STORAGE_KEY);
        
        if (savedJSON) {
            try {
                const data = JSON.parse(savedJSON);
                this.#state.restore(data); 
                this.#history = data.history || [];
                
                if (data.winner) this.#state.setWinner(data.winner);
                if (data.multiJumpPiece) this.#state.setMultiJumpPiece(data.multiJumpPiece.row, data.multiJumpPiece.col);
            } catch (e) {
                console.error("Помилка завантаження збереження", e);
                localStorage.removeItem(GAME_SETTINGS.STORAGE_KEY); 
            }
        }
    }



    resetGame() {
        this.#state.reset();
        this.#history = []; 
        localStorage.removeItem(GAME_SETTINGS.STORAGE_KEY);
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

                this.#saveToStorage();
                return false; 
            }
        }

     
        this.#state.clearMultiJumpPiece();
        this.#state.switchTurn();

        const winner = MoveValidator.calculateWinner(this.#state);
        if (winner) {
            this.#state.setWinner(winner);
        }
        this.#saveToStorage();
        return true; 
    }
}