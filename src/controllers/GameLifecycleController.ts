import type { CheckersModel } from '../models/CheckersModel.ts';
import type { CheckersView } from '../views/CheckersView.ts';
import type { ControllerState } from './ControllerState.ts';
import type { ViewUpdater } from './ViewUpdater.ts';
import type { TimerController } from './TimerController.ts';
import type { StorageProvider } from '../types.ts';

export class GameLifecycleController {
    #model: CheckersModel;
    #view: CheckersView;
    #storage: StorageProvider;
    #state: ControllerState;
    #viewUpdater: ViewUpdater;
    #persistState: () => void;
    #timerController: TimerController;

    constructor(
        model: CheckersModel,
        view: CheckersView,
        storage: StorageProvider,
        state: ControllerState,
        viewUpdater: ViewUpdater,
        persistState: () => void,
        timerController: TimerController
    ) {
        this.#model = model;
        this.#view = view;
        this.#storage = storage;
        this.#state = state;
        this.#viewUpdater = viewUpdater;
        this.#persistState = persistState;
        this.#timerController = timerController;

        this.#model.bindGameOver((winner, reason) => {
            this.#persistState();
            this.#view.showWinner(winner, reason);
        });
    }

    handleUndo(): void {
        if (this.#state.isAnimating) return;

        const wasGameOver = this.#model.winner !== null;

        this.#model.undo();
        this.#persistState();

        this.#state.clearSelection();
        this.#state.setHistoryHighlight(null);
        this.#viewUpdater.render();

        if (!this.#model.winner) {
            this.#view.hideWinner();
            if (wasGameOver) {
                this.#timerController.startIfNeeded();
            }
        }
    }

    handleRestartGame(): void {
        if (this.#state.isAnimating) return;

        this.#model.resetGame();
        this.#storage.clear();

        this.#state.clearSelection();
        this.#state.setHistoryHighlight(null);

        this.#view.hideWinner();
        this.#viewUpdater.render();

        this.#timerController.renderInitial();
        this.#timerController.startIfNeeded();
    }
}
