import type { HistoryHighlight, Move, Position } from '../types.ts';

export class ControllerState {
    #selectedCell: Position | null = null;
    #validMoves: Move[] = [];
    #historyHighlight: HistoryHighlight | null = null;
    #isAnimating = false;

    get selectedCell(): Position | null { return this.#selectedCell; }
    get validMoves(): Move[] { return this.#validMoves; }
    get historyHighlight(): HistoryHighlight | null { return this.#historyHighlight; }
    get isAnimating(): boolean { return this.#isAnimating; }
    findMoveTarget(row: number, col: number): Move | undefined {
        return this.#validMoves.find(move => move.row === row && move.col === col);
    }

    setAnimating(value: boolean): void {
        this.#isAnimating = value;
    }

    clearSelection(): void {
        this.#selectedCell = null;
        this.#validMoves = [];
    }

    selectCell(row: number, col: number, validMoves: Move[] = []): void {
        this.#selectedCell = { row, col };
        this.#validMoves = validMoves;
    }

    setHistoryHighlight(value: HistoryHighlight | null): void {
        this.#historyHighlight = value;
    }
}
