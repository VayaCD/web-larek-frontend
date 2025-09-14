import { IProductItem } from '../../../types';
import { ensureElement } from '../../../utils/utils';

export class BasketItem {
    private element: HTMLElement;
    private indexElement: HTMLElement;
    private titleElement: HTMLElement;
    private priceElement: HTMLElement;
    private deleteButton: HTMLButtonElement;

    constructor() {
        const template = document.querySelector('#card-basket') as HTMLTemplateElement;
        this.element = template.content.querySelector('.basket__item').cloneNode(true) as HTMLElement;
        
        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.element);
        this.titleElement = ensureElement<HTMLElement>('.card__title', this.element);
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.element);
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.element);
        
        this.setupEventListeners();
    }

    public render(): HTMLElement {
        return this.element;
    }

    public setContent(product: IProductItem, index: number): void {
        this.indexElement.textContent = (index + 1).toString();
        this.titleElement.textContent = product.title;
        this.titleElement.setAttribute('data-product-id', product.id);
        this.priceElement.textContent = `${product.price} синапсов`;
    }

    private setupEventListeners(): void {
        this.deleteButton.addEventListener('click', () => {
            const productId = this.titleElement.getAttribute('data-product-id');
            if (productId) {
                const event = new CustomEvent('basket:remove', {
                    detail: { productId },
                    bubbles: true
                });
                this.element.dispatchEvent(event);
            }
        });
    }

    public getElement(): HTMLElement {
        return this.element;
    }
}