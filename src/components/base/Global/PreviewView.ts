import { IProductItem } from '../../../types';
import { EventEmitter } from '../Base/events';

export class PreviewView {
    private static readonly CATEGORY_CLASSES = {
        'другое': 'card__category_other',
        'софт-скил': 'card__category_soft',
        'хард-скил': 'card__category_hard',
        'дополнительное': 'card__category_additional',
        'кнопка': 'card__category_button'
    } as const;

    private template: HTMLTemplateElement;
    private container: HTMLElement;
    private title: HTMLElement;
    private category: HTMLElement;
    private description: HTMLElement;
    private image: HTMLImageElement;
    private price: HTMLElement;
    private button: HTMLButtonElement;

    constructor(private eventEmitter: EventEmitter) {
        this.template = document.querySelector('#card-preview') as HTMLTemplateElement;
        
        this.container = this.template.content.querySelector('.card').cloneNode(true) as HTMLElement;
        
        this.title = this.container.querySelector('.card__title') as HTMLElement;
        this.category = this.container.querySelector('.card__category') as HTMLElement;
        this.description = this.container.querySelector('.card__text') as HTMLElement;
        this.image = this.container.querySelector('.card__image') as HTMLImageElement;
        this.price = this.container.querySelector('.card__price') as HTMLElement;
        this.button = this.container.querySelector('.card__button') as HTMLButtonElement;
        
        this.setupEventListeners();
    }

    public render(): HTMLElement {
        return this.container;
    }

    public setContent(product: IProductItem): void {
        this.title.textContent = product.title;
        this.title.setAttribute('data-product-id', product.id);
        this.description.textContent = product.description;
        this.price.textContent = product.price ? `${product.price} синапсов` : 'Бесценно';
        this.image.src = `https://larek-api.nomoreparties.co/content/weblarek${product.image}`;
        
        this.category.textContent = product.category;
        Object.values(PreviewView.CATEGORY_CLASSES).forEach(cls => {
            this.category.classList.remove(cls);
        });
        const categoryClass = PreviewView.CATEGORY_CLASSES[product.category.toLowerCase() as keyof typeof PreviewView.CATEGORY_CLASSES];
        if (categoryClass) {
            this.category.classList.add(categoryClass);
        }

        if (!product.price) {
            this.button.textContent = 'Недоступно';
            this.button.disabled = true;
            this.button.classList.add('button_disabled');
        } else {
            this.button.disabled = false;
            this.button.classList.remove('button_disabled');
        }
    }

    public setButtonState(isInBasket: boolean): void {
        if (isInBasket) {
            this.button.textContent = 'Удалить из корзины';
            this.button.classList.add('button_remove');
            this.button.classList.remove('button_add');
        } else {
            this.button.textContent = 'В корзину';
            this.button.classList.add('button_add');
            this.button.classList.remove('button_remove');
        }
    }

    private setupEventListeners(): void {
        this.button.addEventListener('click', (event) => {
            event.stopPropagation();
            
            const productId = this.title.getAttribute('data-product-id');
            const isInBasket = this.button.classList.contains('button_remove');
            
            if (!productId) return;
            
            if (isInBasket) {
                this.eventEmitter.emit('basket:remove', { 
                    productId: productId 
                });
            } else {
                this.eventEmitter.emit('product:add-to-basket', { 
                    productId: productId 
                });
            }
            
            this.eventEmitter.emit('modal:close');
        });
    }
}
