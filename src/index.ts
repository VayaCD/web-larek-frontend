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
import { Products } from './components/base/Global/Products';
import { Order } from './components/base/Global/Order';

const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
const events = new EventEmitter();
const api = new ProductsApi(API_URL);
const basket = new Basket();
const products = new Products(api, events);
const order = new Order(api, events);
const modal = new Modal(document.querySelector('#modal-container') as HTMLElement);

const previewView = new PreviewView(events);
const basketView = new BasketView(events);
const successView = new SuccessView(events);
const galleryView = new GalleryView(events);
const orderView = new OrderView(events);
const contactsView = new ContactsView(events);
new HeaderView(events);

const basketItemPool: BasketItem[] = [];

events.on('basket:change', () => {
    const items = basket.getItems();
    const total = basket.getTotalPrice();
    
    events.emit('basket:update', { items, total });
});
events.on('basket:request-list-update', () => {
    const basketItems = basket.getItems();
    
    while (basketItemPool.length < basketItems.length) {
        basketItemPool.push(new BasketItem());
    }
    
    const itemElements = basketItems.map((item, index) => {
        const basketItem = basketItemPool[index];
        basketItem.updateData(item, index, (productId: string) => {
            events.emit('basket:remove', { productId });
        });
        return basketItem.getElement();
    });
    
    events.emit('basket:set-list', itemElements);
});

events.on('card:click', (data: { data: IProductItem }) => {
    const content = previewView.render(data.data);
    modal.setContent(content);
    modal.open();
});

events.on('basket:add', (data: { product: IProductItem }) => {
    basket.addItem(data.product);
    updateBasketState();
});

events.on('basket:remove', (data: { productId: string }) => {
    basket.removeItem(data.productId);
    updateBasketState();
});

events.on('basket:clear', () => {
    basket.clear();
    updateBasketState();
});


function updateBasketState(): void {
    events.emit('basket:update', { 
        items: basket.getItems(), 
        total: basket.getTotalPrice() 
    });
}

events.on('product:add-to-basket', (data: { product: IProductItem }) => {
    events.emit('basket:add', { product: data.product });
});

events.on('basket:get-state', (data: { callback: (items: IProductItem[]) => void }) => {
    data.callback(basket.getItems());
});

events.on('header:basket-click', () => {
    const content = basketView.render();
    modal.setContent(content);
    modal.open();
});
events.on('basket:checkout', (data: { items: IProductItem[], total: number }) => {
    console.log('Basket checkout:', { items: data.items, total: data.total });
    modal.close();
    
    order.initOrder(data.items, data.total);
    orderView.updateData(data.items, data.total);
    const content = orderView.render();
    modal.setContent(content);
    modal.open();
});

events.on('order:step1-complete', (orderData: any) => {
    console.log('Order step1 complete:', orderData);
    modal.close();
    
    order.updateFormData({
        payment: orderData.paymentMethod,
        address: orderData.address
    });
    
    const orderState = order.getState();
    contactsView.updateData(orderData, orderState.items, orderState.total);
    const content = contactsView.render();
    modal.setContent(content);
    modal.open();
});
events.on('order:submit', async (data: any) => {
    try {
        console.log('Order submit data:', data);
        
        order.updateContacts({
            email: data.contactsData.email,
            phone: data.contactsData.phone
        });
        
        const orderId = await order.submitOrder();
        console.log('Order created successfully:', orderId);
        basket.clear();
        updateBasketState();
        console.log('Basket cleared after successful order');

        modal.close();
        const orderState = order.getState();
        const content = successView.render(orderState.total);
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

function initProducts() {
    products.loadProducts()
        .then(loadedProducts => {
            galleryView.renderProducts(loadedProducts);
        })
        .catch(error => {
            console.error('Подробности ошибки:', {
                message: error.message,
                status: error.status,
                url: API_URL + '/product'
            });
        });
}

events.emit('basket:update', { 
    items: basket.getItems(), 
    total: basket.getTotalPrice() 
});

initProducts();

