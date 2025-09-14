import { EventEmitter } from '../Base/events';
import { IProductItem } from '../../../types';

export class HeaderView {
    private basketCounter: HTMLElement;
    private basketButton: HTMLButtonElement;

    constructor(private eventEmitter: EventEmitter) {
        this.basketCounter = document.querySelector('.header__basket-counter') as HTMLElement;
        this.basketButton = document.querySelector('.header__basket') as HTMLButtonElement;
        
        if (!this.basketCounter || !this.basketButton) {
            throw new Error('Header elements not foundd');
        }
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.basketButton.addEventListener('click', () => {
            this.eventEmitter.emit('header:basket-click');
        });
    }

    public updateBasketCounter(count: number): void {
        this.basketCounter.textContent = count.toString();
        this.basketButton.disabled = count === 0;
        
        if (this.basketButton.disabled) {
            this.basketButton.classList.add('button_disabled');
        } else {
            this.basketButton.classList.remove('button_disabled');
        }
    }
}
