import { GAME_SETTINGS } from '../constants.js';

export class AnimationHelper {
    static movePiece(piece, endCell, onComplete) {
        const startRect = piece.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();

        const deltaX = endRect.left - startRect.left + (endRect.width - startRect.width) / 2;
        const deltaY = endRect.top - startRect.top + (endRect.height - startRect.height) / 2;

        piece.style.transition = `transform ${GAME_SETTINGS.ANIMATION_DURATION_MS}ms ease-in-out`;
        piece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        piece.style.zIndex = GAME_SETTINGS.ANIMATION_Z_INDEX;

        piece.addEventListener('transitionend', () => {
            onComplete();
        });
    }
}