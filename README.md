# Тестовое задание для Backend разработчика

**Документация по API:** https://documenter.getpostman.com/view/21826200/UzJMtG3E

Дамп mongodb хранится в директории "init_dump_mongodb"

## Запуск с Docker
`docker build -t backend-api .` - Создание образа

`docker run -d -p 2114:2114 backend-api` - Запуск контейнера

Не забудьте указать необходимые переменные окружения перед запуском контейнера. Список переменных находится в низу страницы.

## Запуск в продакшн 
`npm install --omit=dev` - Установка зависимостей

`npx prisma@^4.0.0 generate` - Генерация моделей Prisma

`npx prisma@^4.0.0 db push` - Создание схемы в базе данных

`npm start` - Запуск приложения

## Запуск для разработки
`npm install` - Установка зависимостей

`prisma db push` - Создание схемы в базе данных

`npm run dev` - Запуск приложения


## Переменные окружения
`AUTH_USERNAME` - Логин для авторизации (по умолчанию "admin")

`AUTH_PASSWORD` - Пароль для авторизации (по умолчанию "1234")

`JWT_KEY` - Ключ для подписи JWT (по умолчанию "secret")

`DATABASE_URL` - Строка подключения к базе данных. Пример: "mongodb://root:1234@localhost:27017/test?authSource=admin"
