import { Modal } from './Modal';
import { IProductItem } from '../../../types';
import { EventEmitter } from '../Base/events';

export class BasketModal extends Modal {
	private basketItems: IProductItem[] = [];
	private totalPrice: number = 0;

	constructor(element: HTMLElement, private eventEmitter: EventEmitter) {
		super(element);
		this.init();
	}

	private init(): void {
		this.eventEmitter.on('basket:update',(data: { items: IProductItem[]; total: number }) => {
				this.basketItems = data.items;
				this.totalPrice = data.total;
				this.updateBasketCounter();

				if (this.element.classList.contains('modal_active')) {
					this.render();
				}
			}
		);
	}

	public show(): void {
		this.render();
		this.open();
	}

	private updateBasketCounter(): void {
		const counter = document.querySelector('.header__basket-counter');
		if (counter) {
			counter.textContent = this.basketItems.length.toString();
			const basketButton = document.querySelector('.header__basket') as HTMLButtonElement;
			if (basketButton) {
			basketButton.disabled = false;
			basketButton.removeAttribute('disabled');
			basketButton.classList.remove('button_disabled');
			}
		}
	}

	private render(): void {
		const template = document.querySelector('#basket') as HTMLTemplateElement;
		const content = template.content.cloneNode(true) as DocumentFragment;

		const basketList = content.querySelector('.basket__list');
		const totalElement = content.querySelector('.basket__price');
		const checkoutButton = content.querySelector('.basket__button') as HTMLButtonElement;

		if (basketList) {
            basketList.innerHTML = '';

			this.basketItems.forEach((item, index) => {
				const itemTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;
				const itemElement = itemTemplate.content.cloneNode(true) as DocumentFragment;

				const indexSpan = itemElement.querySelector('.basket__item-index');
				const title = itemElement.querySelector('.card__title');
				const price = itemElement.querySelector('.card__price');
				const deleteButton = itemElement.querySelector('.basket__item-delete');

				if (indexSpan) indexSpan.textContent = (index + 1).toString();
				if (title) title.textContent = item.title;
				if (price) price.textContent = `${item.price} синапсов`;
				if (deleteButton) {
					deleteButton.addEventListener('click', () => {
						this.eventEmitter.emit('basket:remove', { productId: item.id });
					});
				}

				basketList.appendChild(itemElement);
			});
		}

		if (totalElement) {
			totalElement.textContent = `${this.totalPrice} синапсов`;
		}

		if (checkoutButton) {
			checkoutButton.disabled = this.basketItems.length === 0;
			if (checkoutButton.disabled) {
				checkoutButton.classList.add('button_disabled');
			} else {
				checkoutButton.classList.remove('button_disabled');
			}
		}

		const modalContent = this.element.querySelector('.modal__content');
		if (modalContent) {
			modalContent.innerHTML = '';
			modalContent.appendChild(content);

			const checkoutButton = modalContent.querySelector('.basket__button');
			if (checkoutButton) {
				checkoutButton.addEventListener('click', () => {
					this.eventEmitter.emit('basket:checkout', {
						items: this.basketItems,
						total: this.totalPrice,
					});
				});
			}
		}
	}
}
