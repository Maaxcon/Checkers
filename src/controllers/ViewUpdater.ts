import type { CheckersModel } from '../models/CheckersModel.ts';
import type { CheckersView } from '../views/CheckersView.ts';
import type { ControllerState } from './ControllerState.ts';

export class ViewUpdater {
    #model: CheckersModel;
    #view: CheckersView;
    #state: ControllerState;

    constructor(model: CheckersModel, view: CheckersView, state: ControllerState) {
        this.#model = model;
        this.#view = view;
        this.#state = state;
    }

    render(): void {
        this.#view.renderBoard(
            this.#model.board,
            this.#state.selectedCell,
            this.#state.validMoves,
            this.#model.currentTurn,
            this.#state.historyHighlight
        );
                        
        this.#view.historyView.render(this.#model.moveLog);
    }
}
