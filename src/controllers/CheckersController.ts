import { ControllerState } from './ControllerState.ts';
import { ViewUpdater } from './ViewUpdater.ts';
import { InteractionController } from './InteractionController.ts';
import { HistoryController } from './HistoryController.ts';
import { GameLifecycleController } from './GameLifecycleController.ts';
import { TimerController } from './TimerController.ts';
import type { CheckersModel } from '../models/CheckersModel.ts';
import type { CheckersView } from '../views/CheckersView.ts';
import type { StorageProvider } from '../types.ts';

export class CheckersController {
    #model: CheckersModel;
    #view: CheckersView;
    #storage: StorageProvider;
    #state: ControllerState;
    #viewUpdater: ViewUpdater;
    #interactionController: InteractionController;
    #historyController: HistoryController;
    #gameLifecycleController: GameLifecycleController;
    #timerController: TimerController;

    constructor(model: CheckersModel, view: CheckersView, storage: StorageProvider) {
        this.#model = model;
        this.#view = view;
        this.#storage = storage;

        const persistState = () => {
            this.#storage.save(this.#model.exportState());
        };

        this.#state = new ControllerState();
        this.#viewUpdater = new ViewUpdater(this.#model, this.#view, this.#state);

        this.#timerController = new TimerController(this.#model, this.#view, persistState);

        this.#interactionController = new InteractionController(
            this.#model,
            this.#view,
            this.#state,
            this.#viewUpdater,
            persistState
        );

        this.#historyController = new HistoryController(
            this.#state,
            this.#viewUpdater,
            () => this.#interactionController.resetKeyboardCursor()
        );

        this.#gameLifecycleController = new GameLifecycleController(
            this.#model,
            this.#view,
            this.#storage,
            this.#state,
            this.#viewUpdater,
            persistState,
            this.#timerController
        );

        this.#view.bindSquareClick((row, col) => this.#interactionController.handleInteraction(row, col));
        this.#view.bindDrop((row, col) => this.#interactionController.handleInteraction(row, col));
        this.#view.bindDragStart((row, col) => this.#interactionController.handleDragStart(row, col));
        this.#view.bindRestartClick(() => this.#gameLifecycleController.handleRestartGame());
        this.#view.bindUndoClick(() => this.#gameLifecycleController.handleUndo());

        this.#view.historyView.bindClick((from, to) => this.#historyController.handleHistoryClick(from, to));

        this.#viewUpdater.render();

        this.#timerController.renderInitial();
        this.#timerController.startIfNeeded();
    }

    destroy(): void {
        this.#interactionController.destroy();
    }
}
