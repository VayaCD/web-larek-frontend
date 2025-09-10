import { Modal } from './Modal';
import { IProductItem } from '../../../types';
import { EventEmitter } from '../Base/events';

export class PreviewModal extends Modal {
    private static readonly CATEGORY_CLASSES = {
        'другое': 'card__category_other',
        'софт-скил': 'card__category_soft',
        'хард-скил': 'card__category_hard',
        'дополнительное': 'card__category_additional',
        'кнопка': 'card__category_button'
    } as const;

    private currentProduct: IProductItem | null = null;
    private isInBasket: boolean = false;

    constructor(element: HTMLElement, private eventEmitter: EventEmitter) {
        super(element);
        this.setupBasketListeners();
    }

    private setupBasketListeners(): void {
        // Следим за обновлениями корзины
        this.eventEmitter.on('basket:update', (data: { items: IProductItem[]; total: number }) => {
            if (this.currentProduct) {
                this.updateButtonState(this.currentProduct.id);
            }
        });

        // Обработчик для проверки наличия товара в корзине
        this.eventEmitter.on('basket:check-product', 
            (data: { productId: string; callback: (inBasket: boolean) => void }) => {
            // Эмитируем событие для запроса состояния корзины
            this.eventEmitter.emit('basket:get-state', {
                callback: (items: IProductItem[]) => {
                    const inBasket = items.some(item => item.id === data.productId);
                    data.callback(inBasket);
                }
            });
        });
    }

    public show(product: IProductItem): void {
        this.currentProduct = product;
        const template = document.querySelector('#card-preview') as HTMLTemplateElement;
        const content = template.content.querySelector('.card').cloneNode(true) as HTMLElement;
        
        const title = content.querySelector('.card__title');
        const category = content.querySelector('.card__category');
        const description = content.querySelector('.card__text');
        const image = content.querySelector('.card__image');
        const price = content.querySelector('.card__price');

        if (title) {
            title.textContent = product.title;
        }

        if (description) {
            description.textContent = product.description;
        }

        if (price) {
            price.textContent = `${product.price} синапсов`;
        }

        if (image) {
            (image as HTMLImageElement).src = `https://larek-api.nomoreparties.co/content/weblarek${product.image}`;
        }

        if (category) {
            category.textContent = product.category;
            Object.values(PreviewModal.CATEGORY_CLASSES).forEach(cls => {
                category.classList.remove(cls);
            });
            const categoryClass = PreviewModal.CATEGORY_CLASSES[product.category.toLowerCase() as keyof typeof PreviewModal.CATEGORY_CLASSES];
            if (categoryClass) {
                category.classList.add(categoryClass);
            }
        }

        const modalContent = this.element.querySelector('.modal__content');
        if (modalContent) {
            modalContent.innerHTML = '';
            modalContent.appendChild(content);
        }

        this.updateButtonState(product.id);
        this.open();
        this.setupButtonListeners(content);
    }

    private updateButtonState(productId: string): void {
        this.eventEmitter.emit('basket:check-product', { 
            productId,
            callback: (inBasket: boolean) => {
                this.isInBasket = inBasket;
                this.renderButton();
            }
        });
    }

    private renderButton(): void {
        if (!this.currentProduct) return;
        
        const button = this.element.querySelector('.card__button');
        if (!button) return;

        if (this.isInBasket) {
            button.textContent = 'Удалить из корзины';
            button.classList.add('button_remove');
            button.classList.remove('button_add');
        } else {
            button.textContent = 'В корзину';
            button.classList.add('button_add');
            button.classList.remove('button_remove');
        }
    }

    private setupButtonListeners(content: HTMLElement): void {
        const button = content.querySelector('.card__button');
        if (!button || !this.currentProduct) return;

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            
            if (this.isInBasket) {
                this.eventEmitter.emit('basket:remove', { 
                    productId: this.currentProduct.id 
                });
            } else {
                this.eventEmitter.emit('product:add-to-basket', { 
                    product: this.currentProduct 
                });
            }
            
            this.close();
        });
    }
}