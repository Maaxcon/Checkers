import { CheckersModel } from './models/CheckersModel.ts';
import { CheckersView } from './views/CheckersView.ts';
import { CheckersController } from './controllers/CheckersController.ts';
import { StorageService } from './services/StorageService.ts';

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector<HTMLElement>(".root");
    if (!root) {
        throw new Error("Root element not found");
    }
    
    const model = new CheckersModel();
    
    const savedData = StorageService.load();
    if (savedData) {
        model.loadState(savedData);
    }

    const view = new CheckersView(root);
    
    new CheckersController(model, view, StorageService);
});
