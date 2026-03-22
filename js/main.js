import { CheckersModel } from './models/CheckersModel.js';
import { CheckersView } from './views/CheckersView.js';
import { CheckersController } from './controllers/CheckersController.js';
import { StorageService } from './services/StorageService.js';

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector(".root");
    
    const model = new CheckersModel();
    
    const savedData = StorageService.load();
    if (savedData) {
        model.loadState(savedData);
    }

    const view = new CheckersView(root);
    
    const controller = new CheckersController(model, view, StorageService);
});