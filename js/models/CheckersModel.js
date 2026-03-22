import { GameState } from './GameState.js';
import { MoveValidator } from './MoveValidator.js';
import { NotationHelper } from '../utils/NotationHelper.js'; 
import { GameTimer } from './GameTimer.js'; 
import { GAME_RESULTS } from '../constants.js';

export class CheckersModel {
    #state;
    #history = [];
    #moveLog = []; 
    #timer; 
    #onGameOverCallback = null; 

    constructor() {
        this.#state = new GameState(); 
        this.#timer = new GameTimer();
        
        this.#timer.bindTimeOut((winner) => {
            this.#notifyGameOver(winner, GAME_RESULTS.TIMEOUT);
        });
    }

    #notifyGameOver(winner, reason = null) {
        this.#state.setWinner(winner);
        this.#timer.stop();
        this.#onGameOverCallback?.(winner, reason);
    }

    loadState(savedData) {
        try {
            this.#state.restore(savedData); 
            
            if (savedData.history) {
                this.#history = savedData.history.map(historyEntry => {
                    const state = new GameState();
                    state.restore(historyEntry.state);

                    return {
                        state: state,
                        timer: historyEntry.timer || this.#timer.exportState()
                    };
                });
            }
            
            if (savedData.moveLog) {
                this.#moveLog = savedData.moveLog;
            }

            if (savedData.timer) {
                this.#timer.loadState(savedData.timer);
            }

            if (savedData.winner) this.#state.setWinner(savedData.winner);
            if (savedData.multiJumpPiece) {
                this.#state.setMultiJumpPiece(savedData.multiJumpPiece.row, savedData.multiJumpPiece.col);
            }
        } catch (error) {
            this.resetGame();
        }
    }

    exportState() {
        return {
            grid: this.#state.boardMatrix,
            turn: this.#state.currentTurn,
            history: this.#history.map(historyEntry => ({
                state: historyEntry.state.toJSON(),
                timer: historyEntry.timer
            })),
            winner: this.#state.winner,
            multiJumpPiece: this.#state.multiJumpPiece,
            moveLog: this.#moveLog,
            timer: this.#timer.exportState()
        };
    }

    get board() { return this.#state.boardMatrix; }
    get currentTurn() { return this.#state.currentTurn; }
    get multiJumpPiece() { return this.#state.multiJumpPiece; }
    get winner() { return this.#state.winner; }
    get moveLog() { return this.#moveLog; }
    get timerTimes() { return this.#timer.currentTimes; } 

    bindTimerTick(callback) {
        this.#timer.bindTick(callback);
    }

    bindGameOver(callback) {
        this.#onGameOverCallback = callback;
    }

    startGame() {
        if (!this.winner) {
            this.#timer.start(this.currentTurn);
        }
    }

    undo() {
        if (this.#history.length === 0) return; 
        
        const previous = this.#history.pop();
        
        this.#state = previous.state;
        this.#timer.loadState(previous.timer); 
        this.#moveLog.pop(); 

        if (!this.winner) {
            this.#timer.switchTurn(this.currentTurn);
        }
    }

    resetGame() {
        this.#state.reset();
        this.#history = []; 
        this.#moveLog = [];
        this.#timer.reset();
    }

    getValidMoves(row, col, hasGlobalCaptures = null) {
        return MoveValidator.getValidMoves(this.#state, row, col, hasGlobalCaptures);
    }

    getPlayerMoveStatus() {
        return MoveValidator.getPlayerMoveStatus(this.#state);
    }

    movePiece(fromRow, fromCol, toRow, toCol, moveInfo) {
        const isCapture = moveInfo.type === 'capture';

        if (!this.#state.multiJumpPiece) {
            this.#history.push({
                state: this.#state.clone(),
                timer: this.#timer.exportState()
            });
            
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
                return false; 
            }
        }

        this.#state.clearMultiJumpPiece();
        this.#state.switchTurn();

        const winner = MoveValidator.calculateWinner(this.#state);
        
        if (winner) {
            this.#notifyGameOver(winner);
        } else {
            this.#timer.switchTurn(this.currentTurn);
        }
        
        return true; 
    }
}
