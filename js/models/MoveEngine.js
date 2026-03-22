import { GAME_SETTINGS } from '../constants.js';

export class MoveEngine {
    
    static getMovesForPiece(board, row, col) {
        const piece = board.getPiece(row, col);
        
        if (piece === null) return []; 
        
        if (piece.isKing) {
            return this.getKingMoves(board, row, col, piece);
        } else {
            return this.getNormalPieceMoves(board, row, col, piece);
        }
    }

    static getNormalPieceMoves(board, row, col, piece) {
        const moves = [];
        const directionsY = piece.moveDirections;
        const directionsX = [-1, 1];

        for (let dirIndex = 0; dirIndex < directionsY.length; dirIndex++) {
            const directionY = directionsY[dirIndex];
            
            for (let offsetIndex = 0; offsetIndex < directionsX.length; offsetIndex++) {
                const directionX = directionsX[offsetIndex];
                const newRow = row + directionY;
                const newCol = col + directionX;
                
                if (board.isValidPosition(newRow, newCol)) {
                    const targetPiece = board.getPiece(newRow, newCol);
                    if (targetPiece === null) {
                        moves.push({ row: newRow, col: newCol, type: 'move' });
                    }
                }
            }
        }

        const captureDirections = [
            {rowOffset: -1, colOffset: -1}, 
            {rowOffset: -1, colOffset: 1}, 
            {rowOffset: 1, colOffset: -1}, 
            {rowOffset: 1, colOffset: 1}
        ];
        
        for (let dirIndex = 0; dirIndex < captureDirections.length; dirIndex++) {
            const direction = captureDirections[dirIndex];
            
            const jumpRow = row + (direction.rowOffset * GAME_SETTINGS.JUMP_DISTANCE);
            const jumpCol = col + (direction.colOffset * GAME_SETTINGS.JUMP_DISTANCE);
            const middleRow = row + direction.rowOffset;
            const middleCol = col + direction.colOffset;

            if (board.isValidPosition(jumpRow, jumpCol)) {
                const middlePiece = board.getPiece(middleRow, middleCol);
                const targetPiece = board.getPiece(jumpRow, jumpCol);
                
                if (targetPiece === null) {
                    if (piece.isOpponent(middlePiece)) {
                        moves.push({ 
                            row: jumpRow, 
                            col: jumpCol, 
                            type: 'capture', 
                            capturedRow: middleRow, 
                            capturedCol: middleCol 
                        });
                    }
                }
            }
        }

        return moves;
    }

    static getKingMoves(board, row, col, piece) {
        const moves = [];
        const directions = [
            {rowOffset: -1, colOffset: -1}, 
            {rowOffset: -1, colOffset: 1}, 
            {rowOffset: 1, colOffset: -1}, 
            {rowOffset: 1, colOffset: 1}
        ]; 

        for (let dirIndex = 0; dirIndex < directions.length; dirIndex++) {
            const direction = directions[dirIndex];
            let currentRow = row + direction.rowOffset;
            let currentCol = col + direction.colOffset;
            let foundEnemy = null; 

            while (board.isValidPosition(currentRow, currentCol)) {
                const targetPiece = board.getPiece(currentRow, currentCol);

                if (foundEnemy === null) {
                    if (targetPiece === null) {
                        moves.push({ row: currentRow, col: currentCol, type: 'move' });
                    } else if (piece.isOpponent(targetPiece)) {
                        foundEnemy = { row: currentRow, col: currentCol };
                    } else {
                        break; 
                    }
                } else {
                    if (targetPiece === null) {
                        moves.push({ 
                            row: currentRow, 
                            col: currentCol, 
                            type: 'capture', 
                            capturedRow: foundEnemy.row, 
                            capturedCol: foundEnemy.col 
                        });
                    } else {
                        break; 
                    }
                }
                
                currentRow = currentRow + direction.rowOffset;
                currentCol = currentCol + direction.colOffset;
            }
        }

        return moves;
    }
}
