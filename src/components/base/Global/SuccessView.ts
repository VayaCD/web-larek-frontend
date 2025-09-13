import { EventEmitter } from '../Base/events';

export class SuccessView {
    constructor(private eventEmitter: EventEmitter) {}

    public render(totalPrice: number): HTMLElement {
        const template = document.querySelector('#success') as HTMLTemplateElement;
        const content = template.content.cloneNode(true) as DocumentFragment;
        const element = content.firstElementChild as HTMLElement;

        const description = element.querySelector('.order-success__description');
        if (description) {
            description.textContent = `Списано ${totalPrice} синапсов`;
        }

        this.setupEventListeners(element);
        return element;
    }

    private setupEventListeners(element: HTMLElement): void {
        const closeButton = element.querySelector('.order-success__close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.eventEmitter.emit('order:complete');
            });
        }
    }
}
