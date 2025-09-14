import { IProductItem } from '../../../types';
import { EventEmitter } from '../Base/events';
import { ensureElement, cloneTemplate } from '../../../utils/utils';

export class BasketView {
    private basketItems: IProductItem[] = [];
    private totalPrice: number = 0;
    private basketTemplate: HTMLTemplateElement;
    private listElement: HTMLElement;
    private totalElement: HTMLElement;
    private checkoutButton: HTMLButtonElement;

    constructor(private eventEmitter: EventEmitter) {
        this.basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
        
        this.init();
    }

    private init(): void {
        this.eventEmitter.on('basket:update', (data: { items: IProductItem[]; total: number }) => {
            this.basketItems = data.items;
            this.totalPrice = data.total;
            
            if (this.listElement) {
                this.updateList();
            }
        });

        this.eventEmitter.on('basket:set-list', (items: HTMLElement[]) => {
            this.setList(items);
        });
    }

    public render(): HTMLElement {
        const content = cloneTemplate<HTMLElement>(this.basketTemplate);
        
        this.listElement = ensureElement<HTMLElement>('.basket__list', content);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', content);
        this.checkoutButton = ensureElement<HTMLButtonElement>('.basket__button', content);

        this.updateContent();
        this.setupEventListeners(content);
        
        this.eventEmitter.emit('basket:request-list-update');

        return content;
    }

    private updateContent(): void {
        if (this.totalElement) {
            this.totalElement.textContent = `${this.totalPrice} синапсов`;
        }
        
        if (this.checkoutButton) {
            this.checkoutButton.disabled = this.basketItems.length === 0;
            
            if (this.checkoutButton.disabled) {
                this.checkoutButton.classList.add('button_disabled');
            } else {
                this.checkoutButton.classList.remove('button_disabled');
            }
        }
    }

    private updateList(): void {
        this.eventEmitter.emit('basket:request-list-update');
        this.updateContent();
    }

    public setList(items: HTMLElement[]): void {
        if (this.listElement) {
            this.listElement.replaceChildren(...items);
        }
    }

    private setupEventListeners(content: HTMLElement): void {
        const checkoutButton = content.querySelector('.basket__button') as HTMLButtonElement;
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
