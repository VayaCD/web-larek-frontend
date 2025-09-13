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

const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
const events = new EventEmitter();
const api = new ProductsApi(API_URL);
const basket = new Basket();
const modal = new Modal(document.querySelector('#modal-container') as HTMLElement);

const previewView = new PreviewView(events);
const basketView = new BasketView(events);
const successView = new SuccessView(events);
const galleryView = new GalleryView(events);
new HeaderView(events);

events.on('basket:change', () => {
    const items = basket.getItems();
    const total = basket.getTotalPrice();
    
    events.emit('basket:update', { items, total });
});
events.on('basket:request-list-update', () => {
    const basketItems = basket.getItems();
    const itemElements = basketItems.map((item, index) => {
        const basketItem = new BasketItem(item, index, (productId: string) => {
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
    
    const orderView = new OrderView(events, data.items, data.total);
    const content = orderView.render();
    modal.setContent(content);
    modal.open();
});

events.on('order:step1-complete', (orderData: any) => {
    console.log('Order step1 complete:', orderData);
    modal.close();
    
    const contactsView = new ContactsView(
        events,
        orderData,
        [], 
        0   
    );
    const content = contactsView.render();
    modal.setContent(content);
    modal.open();
});
events.on('order:submit', async (data: any) => {
    try {
        console.log('Order submit data:', data);
        
        const basketItems = basket.getItems();
        const totalPrice = basket.getTotalPrice();
        
        if (!basketItems || !Array.isArray(basketItems) || basketItems.length === 0) {
            throw new Error('Корзина пуста. Невозможно оформить заказ.');
        }

        const itemIds = basketItems.map((item: IProductItem) => {
            if (!item.id) {
                console.error('Item without ID:', item);
                throw new Error('Товар без ID обнаружен в корзине');
            }
            return item.id;
        });

        console.log('Item IDs to send:', itemIds);

        const order: IOrder = {
            payment: data.orderData.paymentMethod,
            email: data.contactsData.email,
            phone: data.contactsData.phone,
            address: data.orderData.address,
            total: totalPrice,
            items: itemIds
        };

        console.log('Sending order to server:', JSON.stringify(order, null, 2));

        const response = await api.createOrder(order);
        console.log('Order created successfully:', response);
        
        basket.clear();
        updateBasketState();
        console.log('Basket cleared after successful order');

        modal.close();
        const content = successView.render(totalPrice);
        modal.setContent(content);
        modal.open();
        
    } catch (error) {
        console.error('Failed to create order:', error);
        alert('Произошла ошибка при оформлении заказа: ' + error);
    }
});

events.on('order:complete', () => {
    basket.clear();
    updateBasketState();
    modal.close();
});

events.on('modal:close', () => {
    modal.close();
});

function initProducts() {
    api.getProducts()
        .then(products => {
            galleryView.renderProducts(products);
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

