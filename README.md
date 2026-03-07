# Лендинг «Осень для танцев»

Бесплатный лендинг с регистрацией коллективов. Заявки сохраняются в Google Sheets, после отправки показывается сообщение «Спасибо, заявка принята», а участнику отправляется письмо с деталями мероприятия.

## Что реализовано

- Форма регистрации с полями:
  - Название коллектива
  - Количество человек
  - Телефон (только РФ, формат `+7XXXXXXXXXX`)
  - Email
  - Чекбокс согласия на обработку персональных данных
- Клиентская валидация полей.
- Серверная валидация и проверка reCAPTCHA.
- Запись заявки в Google Sheets (`Заявки!A:G`) с колонками:
  - `Дата/время`
  - `Название коллектива`
  - `Количество человек`
  - `Телефон`
  - `Email`
  - `Согласие`
  - `Результат` (оставляется пустым для оператора)
- Отправка email с информацией о мероприятии на почту из заявки.
- Контакты на лендинге: `8 905 376 45 34`.

## Запуск локально

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте: `http://localhost:3000`

## Настройка Vercel Environment Variables

Добавьте в **Project Settings → Environment Variables**:

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` (значение `client_email` из JSON service account)
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (значение `private_key` из JSON service account, в одну строку с `\n`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### Как заполнить из вашего service account JSON

- `GOOGLE_SERVICE_ACCOUNT_EMAIL` = поле `client_email`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` = поле `private_key`

Пример формата ключа в ENV:

```text
-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

> Важно: не коммитьте реальные ключи в репозиторий. Если ключи уже были опубликованы, нужно срочно перевыпустить ключ service account и reCAPTCHA secret.

## Настройка Google Sheets (бесплатно)

1. Создайте Google Sheet и лист `Заявки`.
2. В первой строке задайте заголовки колонок A:G:
   - `Дата/время`, `Название коллектива`, `Количество человек`, `Телефон`, `Email`, `Согласие`, `Результат`
3. Создайте Service Account в Google Cloud и включите Google Sheets API.
4. Поделитесь таблицей с email service account (Editor).
5. Заполните переменные:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`

## Настройка reCAPTCHA (бесплатно)

1. Создайте reCAPTCHA site key/secret key на Google reCAPTCHA.
2. По умолчанию reCAPTCHA отключена. Для включения задайте в `.env.local` или Vercel ENV:
   - `NEXT_PUBLIC_ENABLE_RECAPTCHA=true`
   - `ENABLE_RECAPTCHA=true`
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
   - `RECAPTCHA_SECRET_KEY`

## Настройка email (бесплатно)

Вариант с Gmail SMTP:
1. Включите двухфакторную аутентификацию в Google-аккаунте.
2. Создайте App Password.
3. Укажите:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=465`
   - `SMTP_USER=<gmail>`
   - `SMTP_PASS=<app-password>`
   - `SMTP_FROM="Осень для танцев <your@gmail.com>"`

## Если в PR конфликт в `package.json`

В ветке с PR выполните:

```bash
git fetch origin
git merge origin/main
```

Разрешите конфликт в `package.json` и убедитесь, что в `devDependencies` есть:

```json
"@types/nodemailer": "^6.4.17"
```

Потом:

```bash
git add package.json
git commit -m "Resolve package.json conflict with main"
git push
```

## Ошибки Vercel из лога

- `deprecated` предупреждения не блокируют сборку.
- Критичная ошибка была:
  - `Could not find a declaration file for module 'nodemailer'`
- Фикс уже добавлен: `@types/nodemailer` в `devDependencies`.

## Деплой на Vercel

1. Импортируйте репозиторий в Vercel.
2. Добавьте все переменные окружения из `.env.example` в Project Settings → Environment Variables.
3. Redeploy.
