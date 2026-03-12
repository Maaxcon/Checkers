import { PLAYERS } from '../constants.js';

export class MoveEngine {
    
    static isOpponent(piece1, piece2) {
        if (piece1 === PLAYERS.EMPTY || piece2 === PLAYERS.EMPTY) return false;
        const isPiece1Light = piece1 === PLAYERS.LIGHT || piece1 === PLAYERS.LIGHT_KING;
        const isPiece2Light = piece2 === PLAYERS.LIGHT || piece2 === PLAYERS.LIGHT_KING;
        return isPiece1Light !== isPiece2Light;
    }

    static getMovesForPiece(board, row, col) {
        const piece = board.getPiece(row, col);
        const isKing = piece === PLAYERS.LIGHT_KING || piece === PLAYERS.DARK_KING;
        
        if (isKing) {
            return this.#getKingMoves(board, row, col, piece);
        } else {
            return this.#getNormalPieceMoves(board, row, col, piece);
        }
    }

    static #getNormalPieceMoves(board, row, col, piece) {
        const moves = [];
        const isLight = piece === PLAYERS.LIGHT;
        const forwardDir = isLight ? -1 : 1;
        
        const moveDirs = [{r: forwardDir, c: -1}, {r: forwardDir, c: 1}];
        moveDirs.forEach(dir => {
            const newR = row + dir.r;
            const newC = col + dir.c;
            if (board.isValidPosition(newR, newC) && board.getPiece(newR, newC) === PLAYERS.EMPTY) {
                moves.push({ r: newR, c: newC, type: 'move' });
            }
        });

        const captureDirs = [{r: -1, c: -1}, {r: -1, c: 1}, {r: 1, c: -1}, {r: 1, c: 1}];
        captureDirs.forEach(dir => {
            const jumpR = row + dir.r * 2;
            const jumpC = col + dir.c * 2;
            const midR = row + dir.r;
            const midC = col + dir.c;

            if (board.isValidPosition(jumpR, jumpC)) {
                const midPiece = board.getPiece(midR, midC);
                const targetPiece = board.getPiece(jumpR, jumpC);
                if (this.isOpponent(piece, midPiece) && targetPiece === PLAYERS.EMPTY) {
                    moves.push({ r: jumpR, c: jumpC, type: 'capture', capturedR: midR, capturedC: midC });
                }
            }
        });

        return moves;
    }

    static #getKingMoves(board, row, col, piece) {
        const moves = [];
        const dirs = [{r: -1, c: -1}, {r: -1, c: 1}, {r: 1, c: -1}, {r: 1, c: 1}]; 

        dirs.forEach(dir => {
            let currR = row + dir.r;
            let currC = col + dir.c;
            let foundEnemy = null; 

            while (board.isValidPosition(currR, currC)) {
                const targetPiece = board.getPiece(currR, currC);

                if (!foundEnemy) {
                    if (targetPiece === PLAYERS.EMPTY) {
                        moves.push({ r: currR, c: currC, type: 'move' });
                    } else if (this.isOpponent(piece, targetPiece)) {
                        foundEnemy = { r: currR, c: currC };
                    } else {
                        break;
                    }
                } else {
                    if (targetPiece === PLAYERS.EMPTY) {
                        moves.push({ 
                            r: currR, c: currC, type: 'capture', 
                            capturedR: foundEnemy.r, capturedC: foundEnemy.c 
                        });
                    } else {
                        break; 
                    }
                }
                currR += dir.r;
                currC += dir.c;
            }
        });

        return moves;
    }
}