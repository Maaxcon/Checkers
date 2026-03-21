import { BOARD } from '../constants.js';

export class NotationHelper {
    static toNotation(row, col) {
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const number = BOARD.ROWS - row; 
        return `${letters[col]}${number}`;
    }

    static formatMove(fromRow, fromCol, toRow, toCol, isCapture) {
        const fromNotation = this.toNotation(fromRow, fromCol);
        const toNotation = this.toNotation(toRow, toCol);
        const separator = isCapture ? 'x' : '-';
        
        return `${fromNotation}${separator}${toNotation}`;
    }
}