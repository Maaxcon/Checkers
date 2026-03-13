export class MoveEngine {
    
    static getMovesForPiece(board, row, col) {
        const piece = board.getPiece(row, col);
        
        if (piece === null) {
            return []; 
        }
        
        if (piece.isKing === true) {
            return this.getKingMoves(board, row, col, piece);
        } else {
            return this.getNormalPieceMoves(board, row, col, piece);
        }
    }

    static getNormalPieceMoves(board, row, col, piece) {
        const moves = [];
        
        const directionsY = piece.moveDirections;
        const directionsX = [-1, 1];

        for (let i = 0; i < directionsY.length; i++) {
            const dirY = directionsY[i];
            
            for (let j = 0; j < directionsX.length; j++) {
                const dirX = directionsX[j];
                const newRow = row + dirY;
                const newCol = col + dirX;
                
                if (board.isValidPosition(newRow, newCol)) {
                    const targetPiece = board.getPiece(newRow, newCol);
                    if (targetPiece === null) {
                        moves.push({ r: newRow, c: newCol, type: 'move' });
                    }
                }
            }
        }

        const captureDirs = [
            {r: -1, c: -1}, 
            {r: -1, c: 1}, 
            {r: 1, c: -1}, 
            {r: 1, c: 1}
        ];
        
        for (let i = 0; i < captureDirs.length; i++) {
            const dir = captureDirs[i];
            
            const jumpRow = row + (dir.r * 2);
            const jumpCol = col + (dir.c * 2);
            const middleRow = row + dir.r;
            const middleCol = col + dir.c;

            if (board.isValidPosition(jumpRow, jumpCol)) {
                const middlePiece = board.getPiece(middleRow, middleCol);
                const targetPiece = board.getPiece(jumpRow, jumpCol);
                
                if (targetPiece === null) {
                    if (piece.isOpponent(middlePiece) === true) {
                        moves.push({ 
                            r: jumpRow, 
                            c: jumpCol, 
                            type: 'capture', 
                            capturedR: middleRow, 
                            capturedC: middleCol 
                        });
                    }
                }
            }
        }

        return moves;
    }

    static getKingMoves(board, row, col, piece) {
        const moves = [];
        const dirs = [
            {r: -1, c: -1}, 
            {r: -1, c: 1}, 
            {r: 1, c: -1}, 
            {r: 1, c: 1}
        ]; 

        for (let i = 0; i < dirs.length; i++) {
            const dir = dirs[i];
            let currentRow = row + dir.r;
            let currentCol = col + dir.c;
            let foundEnemy = null; 

            while (board.isValidPosition(currentRow, currentCol)) {
                const targetPiece = board.getPiece(currentRow, currentCol);

                if (foundEnemy === null) {
                    if (targetPiece === null) {
                        moves.push({ r: currentRow, c: currentCol, type: 'move' });
                    } else if (piece.isOpponent(targetPiece) === true) {
                        foundEnemy = { r: currentRow, c: currentCol };
                    } else {
                        break; 
                    }
                } else {
                    if (targetPiece === null) {
                        moves.push({ 
                            r: currentRow, 
                            c: currentCol, 
                            type: 'capture', 
                            capturedR: foundEnemy.r, 
                            capturedC: foundEnemy.c 
                        });
                    } else {
                        break; 
                    }
                }
                
                currentRow = currentRow + dir.r;
                currentCol = currentCol + dir.c;
            }
        }

        return moves;
    }
}