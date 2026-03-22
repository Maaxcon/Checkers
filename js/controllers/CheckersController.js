import { ControllerState } from './ControllerState.js';
import { ViewUpdater } from './ViewUpdater.js';
import { InteractionController } from './InteractionController.js';
import { HistoryController } from './HistoryController.js';
import { GameLifecycleController } from './GameLifecycleController.js';
import { TimerController } from './TimerController.js';

export class CheckersController {
    #model;
    #view;
    #storage;
    #state;
    #viewUpdater;
    #interactionController;
    #historyController;
    #gameLifecycleController;
    #timerController;

    constructor(model, view, storage) {
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

    destroy() {
        this.#interactionController.destroy();
    }
}
