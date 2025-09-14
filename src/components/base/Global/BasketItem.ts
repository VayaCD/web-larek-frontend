import { IProductItem } from '../../../types';
import { ensureElement } from '../../../utils/utils';

export class BasketItem {
    private element: HTMLElement;
    private indexElement: HTMLElement;
    private titleElement: HTMLElement;
    private priceElement: HTMLElement;
    private deleteButton: HTMLButtonElement;
    private product: IProductItem | null = null;
    private index: number = 0;
    private onDelete: ((productId: string) => void) | null = null;

    constructor() {
        const template = document.querySelector('#card-basket') as HTMLTemplateElement;
        this.element = template.content.querySelector('.basket__item').cloneNode(true) as HTMLElement;
        
        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.element);
        this.titleElement = ensureElement<HTMLElement>('.card__title', this.element);
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.element);
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.element);
        
        this.setupEventListeners();
    }

    updateData(product: IProductItem, index: number, onDelete: (productId: string) => void): void {
        this.product = product;
        this.index = index;
        this.onDelete = onDelete;
        this.render();
    }

    private render(): void {
        if (!this.product) return;
        
        this.indexElement.textContent = (this.index + 1).toString();
        this.titleElement.textContent = this.product.title;
        this.priceElement.textContent = `${this.product.price} синапсов`;
    }

    private setupEventListeners(): void {
        this.deleteButton.addEventListener('click', () => {
            if (this.product && this.onDelete) {
                this.onDelete(this.product.id);
            }
        });
    }

    public getElement(): HTMLElement {
        return this.element;
    }
}