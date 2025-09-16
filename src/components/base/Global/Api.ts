import { Api, ApiListResponse } from '../Base/api';
import { IProductItem } from '../../../types';

export interface IOrder {
    payment: 'online' | 'cash';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
}

export class ProductsApi extends Api {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    getProducts(): Promise<IProductItem[]> {
        return this.get('/product')
            .then((response) => {
                const { items } = response as ApiListResponse<IProductItem>;
                return items;
            })
            .catch(error => {
                throw error;
            });
    }
    createOrder(order: IOrder): Promise<{ id: string }> {
        return this.post('/order', order)
            .then((response: { id: string }) => {
                return response;
            })
            .catch(error => {
                throw error;
            });
    }
}