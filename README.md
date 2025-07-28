# Проектная работа "Веб-ларек"
git@github.com:VayaCD/web-larek-frontend.git

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные
Название товара
Описание товара
Цена товара
Категория товара
Изображение товара
Способ оплаты
Адрес доставки
Почта
Телефон

## Объекты
Товар
Данные покупателя --> Действия:
						Выбор оплаты и адреса
						Указание почты и телефона
						Очистка данных

## Коллекции
Каталог товаров --> Действия:
						Заполнить каталог
						Получиь каталог
Корзина с товарами --> Действия:
						Добавлять корзину
						Удалять из корзины
						Очищать корзину
						Получить список
						
## Компоненты
Карточка товара
Форма

## Model-View-Controller
1. Главная страница		   -->
2. Модальное окно товара   --> --> Карточка товара ---> Модель товара
3. Модальное окно корзины  -->

1. Модальное окно форма оплаты	   --> 
										--> Форма ---> Данные покупателя
2. Модальное окно форма контактов  -->

## Базовые типы
Для описания возможных способов оплаты заказа используется тип `TOrderPayment`:

```ts
type TOrderPayment = 'cash' | 'card';
```

Для описания заказа используется интерфейс `IOrder`:

```ts
interface IOrder {
	items: IProduct[];
	payment: TOrderPayment;
	address: string;
	email: string;
	phone: string;
}
```

Для описания товара используется интерфейс `IProduct`:

```ts
interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}
```

В качестве набора HTTP методов использует тип `TApiPostMethods`:

```ts
type TApiPostMethods = 'POST' | 'PUT' | 'DELETE'
```

