import { PLAYERS, BOARD } from '../constants.js';
import { MoveEngine } from './MoveEngine.js';

export class MoveValidator {
    
    static isCurrentPlayerPiece(gameState, piece) {
        if (piece === null) {
            return false;
        }
        if (piece.player === gameState.currentTurn) {
            return true; 
        } else {
            return false;
        }
    }

    static getCapturesForPiece(gameState, row, col) {
        const allMoves = MoveEngine.getMovesForPiece(gameState.board, row, col);
        return allMoves.filter(move => move.type === 'capture');
    }

    static playerHasAnyCaptures(gameState) {
        for (let r = 0; r < BOARD.ROWS; r++) {
            for (let c = 0; c < BOARD.COLS; c++) {
                
                const piece = gameState.board.getPiece(r, c);

                if (this.isCurrentPlayerPiece(gameState, piece)) {
                    const captures = this.getCapturesForPiece(gameState, r, c)
                    if (captures.length > 0) {
                        return true; 
                    }
                }

            }
        }
        return false;
    }

    
    static getValidMoves(gameState, row, col) {
    
        if (gameState.winner) return []; 
        const piece = gameState.board.getPiece(row, col);
        if (!this.isCurrentPlayerPiece(gameState, piece)) return []; 

    
        const lockedPiece = gameState.multiJumpPiece;
        if (lockedPiece) {
            const isClickingAnotherPiece = (lockedPiece.r !== row || lockedPiece.c !== col);
            if (isClickingAnotherPiece) {
                return []; 
            }
        }
      
        const allMoves = MoveEngine.getMovesForPiece(gameState.board, row, col);
      
        if (this.playerHasAnyCaptures(gameState)) {
            return allMoves.filter(move => move.type === 'capture');
        }

        
        return allMoves;
    }

    static calculateWinner(gameState) {
        for (let r = 0; r < BOARD.ROWS; r++) {
            for (let c = 0; c < BOARD.COLS; c++) {
                
                const piece = gameState.board.getPiece(r, c);

                if (this.isCurrentPlayerPiece(gameState, piece)) {
                    const validMoves = this.getValidMoves(gameState, r, c);
                    
                   
                    if (validMoves.length > 0) {
                        return null; 
                    }
                }

            }
        }

       
        if (gameState.currentTurn === PLAYERS.LIGHT) {
            return PLAYERS.DARK;
        } else {
            return PLAYERS.LIGHT;
        }
    }
}