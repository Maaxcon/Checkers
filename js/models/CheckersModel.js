import { GameState } from './GameState.js';
import { MoveValidator } from './MoveValidator.js';
import { StorageService } from '../services/StorageService.js';
import { NotationHelper } from '../utils/NotationHelper.js'; 

export class CheckersModel {
    #state;
    #history = [];
    #selectedCell = null;
    #validMoves = [];
    
    #moveLog = []; 
    #historyHighlight = null; 

    constructor() {
        this.#state = new GameState(); 
        this.#init();
    }

    #init() {
        const savedData = StorageService.load();
        if (savedData) {
            try {
                this.#state.restore(savedData); 
                
                if (savedData.history) {
                    this.#history = savedData.history.map(stateData => {
                        const parsedData = typeof stateData === 'string' ? JSON.parse(stateData) : stateData;
                        const state = new GameState();
                        state.restore(parsedData);
                        return state;
                    });
                }
                
                if (savedData.moveLog) {
                    this.#moveLog = savedData.moveLog;
                }

                if (savedData.winner) this.#state.setWinner(savedData.winner);
                if (savedData.multiJumpPiece) {
                    this.#state.setMultiJumpPiece(savedData.multiJumpPiece.row, savedData.multiJumpPiece.col);
                }
            } catch (error) {
                this.resetGame();
            }
        }
    }

    get board() { return this.#state.boardMatrix; }
    get currentTurn() { return this.#state.currentTurn; }
    get multiJumpPiece() { return this.#state.multiJumpPiece; }
    get winner() { return this.#state.winner; }
    
    get selectedCell() { return this.#selectedCell; }
    get validMoves() { return this.#validMoves; }
    get moveLog() { return this.#moveLog; }
    get historyHighlight() { return this.#historyHighlight; }

    undo() {
        if (this.#history.length === 0) return; 
        
        this.#state = this.#history.pop();
        this.#moveLog.pop(); 
        
        this.clearSelection(); 
        this.clearHistoryHighlight();
        this.#save();
    }

    #save() {
        StorageService.save({
            grid: this.#state.boardMatrix,
            turn: this.#state.currentTurn,
            history: this.#history.map(state => state.toJSON()),
            winner: this.#state.winner,
            multiJumpPiece: this.#state.multiJumpPiece,
            moveLog: this.#moveLog
        });
    }

    resetGame() {
        this.#state.reset();
        this.#history = []; 
        this.#moveLog = [];
        this.clearSelection(); 
        this.clearHistoryHighlight();
        StorageService.clear();
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

    setHistoryHighlight(from, to) {
        this.#historyHighlight = { from, to };
        this.clearSelection(); 
    }

    clearHistoryHighlight() {
        this.#historyHighlight = null;
    }


    movePiece(fromRow, fromCol, toRow, toCol, moveInfo) {
        const isCapture = moveInfo.type === 'capture';

        if (!this.#state.multiJumpPiece) {
            this.#history.push(this.#state.clone());
            
            const moveString = NotationHelper.formatMove(fromRow, fromCol, toRow, toCol, isCapture);
            
            this.#moveLog.push({ 
                notation: moveString, 
                from: {row: fromRow, col: fromCol}, 
                to: {row: toRow, col: toCol} 
            });
        } else {
            const lastMove = this.#moveLog[this.#moveLog.length - 1];
            const toNotation = NotationHelper.toNotation(toRow, toCol);
            
            lastMove.notation += `x${toNotation}`;
            lastMove.to = {row: toRow, col: toCol};
        }

        const result = this.#state.executeMove(fromRow, fromCol, toRow, toCol, moveInfo);

        if (isCapture && !result.becameKing) {
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