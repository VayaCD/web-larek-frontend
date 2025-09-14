import { IProductItem } from '../../../types';
import { IEvents } from '../Base/events';
import { IActions } from '../../../types';

export class Card {
    private element: HTMLElement;
    private template: HTMLTemplateElement;
    private title: HTMLElement;
    private category: HTMLElement;
    private price: HTMLElement;
    private image: HTMLImageElement;
    private static readonly IMAGE_BASE_URL = 'https://larek-api.nomoreparties.co/content/weblarek';

    constructor(private eventEmitter: IEvents) {
        this.template = document.querySelector('#card-catalog') as HTMLTemplateElement;
        this.element = this.template.content.querySelector('.gallery__item').cloneNode(true) as HTMLElement;
        
        this.title = this.element.querySelector('.card__title') as HTMLElement;
        this.category = this.element.querySelector('.card__category') as HTMLElement;
        this.price = this.element.querySelector('.card__price') as HTMLElement;
        this.image = this.element.querySelector('.card__image') as HTMLImageElement;
        
        this.setupEventListeners();
    }

    public render(product: IProductItem): HTMLElement {
        this.title.textContent = product.title;
        this.title.setAttribute('data-product-id', product.id);
        this.category.textContent = product.category;
        
        if (product.category.toLowerCase() === 'другое') {
            this.category.classList.add('card__category_other');
        } else if (product.category.toLowerCase() === 'софт-скил') {
            this.category.classList.add('card__category_soft');
        } else if (product.category.toLowerCase() === 'хард-скил') {
            this.category.classList.add('card__category_hard');
        } else if (product.category.toLowerCase() === 'дополнительное') {
            this.category.classList.add('card__category_additional');
        } else if (product.category.toLowerCase() === 'кнопка') {
            this.category.classList.add('card__category_button');
        }
        
        this.price.textContent = product.price ? `${product.price} синапсов` : 'Бесценно';
        this.image.src = `${Card.IMAGE_BASE_URL}${product.image}`;
        
        return this.element;
    }

    private setupEventListeners(): void {
        this.element.addEventListener('click', () => {
            const productId = this.title.getAttribute('data-product-id');
            if (productId) {
                this.eventEmitter.emit('card:click', { productId });
            }
        });
    }

	getElement(): HTMLElement {
		return this.element;
	}
}
