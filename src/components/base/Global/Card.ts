import { IProductItem } from '../../../types';
import { IEvents } from '../Base/events';
import { IActions } from '../../../types';

export class Card {
    private element: HTMLElement;
    private static readonly IMAGE_BASE_URL = 'https://larek-api.nomoreparties.co/content/weblarek';

    constructor(private product: IProductItem, private eventEmitter: IEvents) {
        const template = document.querySelector('#card-catalog') as HTMLTemplateElement;
        this.element = template.content.querySelector('.gallery__item').cloneNode(true) as HTMLElement;
        this.render();
        this.addEventListeners();
    }

    private addEventListeners(): void {
        this.element.addEventListener('click', () => {
            this.eventEmitter.emit('card:click', { data: this.product });
        });
    }

	private render(): void {
		const title = this.element.querySelector('.card__title');
		const category = this.element.querySelector('.card__category');
		const price = this.element.querySelector('.card__price');
		const image = this.element.querySelector('.card__image');

		console.log(this.product);

		if (title) title.textContent = this.product.title;
if (category) {
    category.textContent = this.product.category;
    // Условие для категорий
    if (this.product.category.toLowerCase() === 'другое') {
        category.classList.add('card__category_other');
    } else if (this.product.category.toLowerCase() === 'софт-скил') {
        category.classList.add('card__category_soft');
    } else if (this.product.category.toLowerCase() === 'хард-скил') {
        category.classList.add('card__category_hard');
    } else if (this.product.category.toLowerCase() === 'дополнительное') {
        category.classList.add('card__category_additional');
    } else if (this.product.category.toLowerCase() === 'кнопка') {
        category.classList.add('card__category_button');
    }
}
		if (price) price.textContent = `${this.product.price} синапсов`;
		if (image) {
			(
				image as HTMLImageElement
			).src = `${Card.IMAGE_BASE_URL}${this.product.image}`;
		}
	}

	getElement(): HTMLElement {
		return this.element;
	}
}
