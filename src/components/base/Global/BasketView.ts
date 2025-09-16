import { IProductItem } from '../../../types';
import { EventEmitter } from '../Base/events';
import { ensureElement, cloneTemplate } from '../../../utils/utils';

export class BasketView {
    private basketTemplate: HTMLTemplateElement;
    private container: HTMLElement;
    private listElement: HTMLElement;
    private totalElement: HTMLElement;
    private checkoutButton: HTMLButtonElement;

    constructor(private eventEmitter: EventEmitter) {
        this.basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
        
        this.container = cloneTemplate<HTMLElement>(this.basketTemplate);
        
        this.listElement = ensureElement<HTMLElement>('.basket__list', this.container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.checkoutButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);
        
        this.setupEventListeners();
    }

    public render(): HTMLElement {
        return this.container;
    }

    private updateContent(totalPrice?: number): void {
        if (totalPrice !== undefined && this.totalElement) {
            this.totalElement.textContent = `${totalPrice} синапсов`;
        }
    }

    private updateButtonState(): void {
        if (this.checkoutButton) {
            const hasItems = this.listElement.children.length > 0;
            this.checkoutButton.disabled = !hasItems;
            
            if (this.checkoutButton.disabled) {
                this.checkoutButton.classList.add('button_disabled');
            } else {
                this.checkoutButton.classList.remove('button_disabled');
            }
        }
    }

    public setList(items: HTMLElement[], totalPrice?: number): void {
        if (this.listElement) {
            this.listElement.replaceChildren(...items);
            this.updateContent(totalPrice);
            this.updateButtonState();
        }
    }


    private setupEventListeners(): void {
        this.checkoutButton.addEventListener('click', () => {
            this.eventEmitter.emit('basket:checkout');
        });

    }
}