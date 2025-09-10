import { Modal } from './Modal';
import { EventEmitter } from '../Base/events';

export class SuccessModal extends Modal {
    constructor(element: HTMLElement, private eventEmitter: EventEmitter) {
        super(element);
    }

    public show(totalPrice: number): void {
        this.render(totalPrice);
        this.open();
        this.setupEventListeners();
    }

    private render(totalPrice: number): void {
        const template = document.querySelector('#success') as HTMLTemplateElement;
        const content = template.content.cloneNode(true) as DocumentFragment;

        const description = content.querySelector('.order-success__description');
        if (description) {
            description.textContent = `Списано ${totalPrice} синапсов`;
        }

        const modalContent = this.element.querySelector('.modal__content');
        if (modalContent) {
            modalContent.innerHTML = '';
            modalContent.appendChild(content);
        }
    }

    private setupEventListeners(): void {
        const closeButton = this.element.querySelector('.order-success__close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.close();
                this.eventEmitter.emit('order:complete');
            });
        }
    }
}