import type { ControllerState } from './ControllerState.ts';
import type { ViewUpdater } from './ViewUpdater.ts';
import type { Position } from '../types.ts';

export class HistoryController {
    #state: ControllerState;
    #viewUpdater: ViewUpdater;
    #resetKeyboardCursor: (() => void) | null;

    constructor(state: ControllerState, viewUpdater: ViewUpdater, resetKeyboardCursor: (() => void) | null) {
        this.#state = state;
        this.#viewUpdater = viewUpdater;
        this.#resetKeyboardCursor = resetKeyboardCursor;
    }

    handleHistoryClick(from: Position, to: Position): void {
        if (this.#state.isAnimating) return;
        if (this.#resetKeyboardCursor) {
            this.#resetKeyboardCursor();
        }
        this.#state.setHistoryHighlight({ from, to });
        this.#state.clearSelection();
        this.#viewUpdater.render();
    }
}
