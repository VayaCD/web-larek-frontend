import './scss/styles.scss';
import { Modal } from './components/base/Global/Modal';
import { ProductsApi, IOrder } from './components/base/Global/Api';
import { EventEmitter } from './components/base/Base/events';
import { PreviewView } from './components/base/Global/PreviewView';
import { IProductItem } from './types';
import { BasketView } from './components/base/Global/BasketView';
import { Basket } from './components/base/Global/Basket';
import { OrderView } from './components/base/Global/OrderView';
import { ContactsView } from './components/base/Global/ContactsView';
import { SuccessView } from './components/base/Global/SuccessView';
import { BasketItem } from './components/base/Global/BasketItem';
import { HeaderView } from './components/base/Global/HeaderView';
import { GalleryView } from './components/base/Global/GalleryView';
import { Card } from './components/base/Global/Card';
import { Products } from './components/base/Global/Products';
import { Order } from './components/base/Global/Order';

const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
const events = new EventEmitter();
const api = new ProductsApi(API_URL);
const basket = new Basket();
const products = new Products(events);
const order = new Order(events);
const modal = new Modal(document.querySelector('#modal-container') as HTMLElement);

const previewView = new PreviewView(events);
const basketView = new BasketView(events);
const successView = new SuccessView(events);
const galleryView = new GalleryView();
const orderView = new OrderView(events);
const contactsView = new ContactsView(events);
const headerView = new HeaderView(events);


const basketItemPool: BasketItem[] = [];

events.on('basket:change', () => {
});
events.on('basket:request-list-update', () => {
    const basketItems = basket.getItems();
    const total = basketItems.reduce((sum, item) => sum + (item.price || 0), 0);
    
    while (basketItemPool.length < basketItems.length) {
        basketItemPool.push(new BasketItem());
    }
    
    const itemElements = basketItems.map((item, index) => {
        const basketItem = basketItemPool[index];
        basketItem.setContent(item, index);
        
        return basketItem.render();
    });
    
    basketView.setList(itemElements, total);
});

events.on('card:click', (data: { productId: string }) => {
    const product = products.getProductById(data.productId);
    if (!product) return;
    
    const items = basket.getItems();
    const isInBasket = items.some(item => item.id === product.id);
    
    previewView.setContent(product);
    previewView.setButtonState(isInBasket);
    const content = previewView.render();
    modal.setContent(content);
    modal.open();
});

events.on('basket:add', (data: { product: IProductItem }) => {
    basket.addItem(data.product);
    updateBasketState();
    updatePreviewState();
});

events.on('basket:remove', (data: { productId: string }) => {
    basket.removeItem(data.productId);
    updateBasketState();
    updatePreviewState();
});

document.addEventListener('basket:remove', (event: CustomEvent) => {
    events.emit('basket:remove', { productId: event.detail.productId });
});

events.on('basket:clear', () => {
    basket.clear();
    updateBasketState();
    updatePreviewState();
});


function updateBasketState(): void {
    const items = basket.getItems();
    headerView.updateBasketCounter(items.length);
    
        if (modal.element.classList.contains('modal_active')) {
            const currentContent = modal.getContent();
            if (currentContent && currentContent.querySelector('.basket')) {
                events.emit('basket:request-list-update');
                const content = basketView.render();
                modal.setContent(content);
            }
        }
}

function updatePreviewState(): void {
    if (modal.element.classList.contains('modal_active')) {
        const currentContent = modal.getContent();
        if (currentContent && currentContent.querySelector('.card__button')) {
            const title = currentContent.querySelector('.card__title') as HTMLElement;
            const productId = title?.getAttribute('data-product-id');
            
            if (productId) {
                const isInBasket = basket.hasItem(productId);
                previewView.setButtonState(isInBasket);
            }
        }
    }
}

events.on('product:add-to-basket', (data: { productId: string }) => {
    const product = products.getProductById(data.productId);
    if (product) {
        events.emit('basket:add', { product });
    }
});

events.on('basket:get-state', (data: { callback: (items: IProductItem[]) => void }) => {
    data.callback(basket.getItems());
});

events.on('header:basket-click', () => {
    events.emit('basket:request-list-update');
    const content = basketView.render();
    modal.setContent(content);
    modal.open();
});
events.on('basket:checkout', () => {
    const items = basket.getItems();
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    console.log('Basket checkout:', { items, total });
    modal.close();
    
    const content = orderView.render();
    modal.setContent(content);
    modal.open();
});


events.on('order:change', (data: { key: string; value: string }) => {
    if (data.key === 'payment') {
        const paymentType = data.value === 'card' ? 'online' : data.value === 'cash' ? 'cash' : '';
        order.updateFormData({
            payment: paymentType as 'online' | 'cash',
            address: order.getFormData()?.address || ''
        });
    } else if (data.key === 'address') {
        order.updateFormData({
            payment: order.getFormData()?.payment || 'online',
            address: data.value
        });
    }
});

events.on('order:validate', (data: { errors: { [key: string]: string } }) => {
    const errorMessages = Object.values(data.errors);
    orderView.setErrors(errorMessages);
});

events.on('order:submit', () => {
    if (order.isReadyToSubmit()) {
        console.log('Order step1 complete:', order.getFormData());
        modal.close();
        
        const content = contactsView.render();
        modal.setContent(content);
        modal.open();
    }
});

events.on('contacts:change', (data: { key: string; value: string }) => {
    const currentContacts = order.getContacts();
    order.updateContacts({
        email: data.key === 'email' ? data.value : (currentContacts?.email || ''),
        phone: data.key === 'phone' ? data.value : (currentContacts?.phone || '')
    });
});

events.on('contacts:validate', (data: { errors: { [key: string]: string } }) => {
    const errorMessages = Object.values(data.errors);
    contactsView.setErrors(errorMessages);
});

events.on('contacts:submit', () => {
    if (order.isReadyToSubmitContacts()) {
        events.emit('order:final-submit', {
            contactsData: order.getContacts()
        });
    }
});

events.on('order:final-submit', async (data: any) => {
    try {
        console.log('Order submit data:', data);
        
        const basketItems = basket.getItems();
        const basketTotal = basketItems.reduce((sum, item) => sum + (item.price || 0), 0);
        const basketItemIds = basketItems.map(item => item.id);
        
        const orderData = order.getOrderData(basketItemIds, basketTotal);
        
        const response = await api.createOrder(orderData);
        const orderId = response.id;
        
        order.setOrderId(orderId);
        
        console.log('Order created successfully:', orderId);
        basket.clear();
        updateBasketState();
        console.log('Basket cleared after successful order');

        modal.close();
        successView.setContent(basketTotal);
        const content = successView.render();
        modal.setContent(content);
        modal.open();
        
    } catch (error) {
        console.error('Failed to create order:', error);
        alert('Произошла ошибка при оформлении заказа: ' + error);
    }
});

events.on('order:complete', () => {
    basket.clear();
    order.clear();
    updateBasketState();
    modal.close();
});

events.on('modal:close', () => {
    modal.close();
});

async function initProducts() {
    try {
        const loadedProducts = await api.getProducts();
        
        products.setProducts(loadedProducts);
        
        const cards = createProductCards(loadedProducts);
        
        galleryView.renderCards(cards);
    } catch (error) {
        console.error('Подробности ошибки:', {
            message: error.message,
            status: error.status,
            url: API_URL + '/product'
        });
    }
}

function createProductCards(products: IProductItem[]): HTMLElement[] {
    return products.map(product => {
        const card = new Card(events);
        card.render(product);
        return card.getElement();
    });
}

updateBasketState();

initProducts();

