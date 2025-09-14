import { EventEmitter } from '../Base/events';

export class SuccessView {
    private template: HTMLTemplateElement;
    private container: HTMLElement;
    private description: HTMLElement;
    private closeButton: HTMLButtonElement;

    constructor(private eventEmitter: EventEmitter) {
        this.template = document.querySelector('#success') as HTMLTemplateElement;
        
        const content = this.template.content.cloneNode(true) as DocumentFragment;
        this.container = content.firstElementChild as HTMLElement;
        
        this.description = this.container.querySelector('.order-success__description') as HTMLElement;
        this.closeButton = this.container.querySelector('.order-success__close') as HTMLButtonElement;
        
        this.closeButton.addEventListener('click', () => {
            this.eventEmitter.emit('order:complete');
        });
    }

    public render(): HTMLElement {
        return this.container;
    }

    public setContent(totalPrice: number): void {
        this.description.textContent = `Списано ${totalPrice} синапсов`;
    }

}
