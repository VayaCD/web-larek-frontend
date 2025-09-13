import { EventEmitter } from '../Base/events';
import { IProductItem } from '../../../types';

export class HeaderView {
    private basketCounter: HTMLElement;
    private basketButton: HTMLButtonElement;

    constructor(private eventEmitter: EventEmitter) {
        this.basketCounter = document.querySelector('.header__basket-counter') as HTMLElement;
        this.basketButton = document.querySelector('.header__basket') as HTMLButtonElement;
        
        if (!this.basketCounter || !this.basketButton) {
            throw new Error('Header elements not found');
        }

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.basketButton.addEventListener('click', () => {
            this.eventEmitter.emit('header:basket-click');
        });

        // Слушаем обновления корзины для автоматического обновления счетчика
        this.eventEmitter.on('basket:update', (data: { items: IProductItem[]; total: number }) => {
            this.updateBasketCounter(data.items.length);
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
