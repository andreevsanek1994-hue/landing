import nodemailer from "nodemailer";
import { RegistrationInput } from "@/lib/validation";

const requiredMailVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"] as const;

function assertMailEnv() {
  for (const envVar of requiredMailVars) {
    if (!process.env[envVar]) {
      throw new Error(`Отсутствует переменная окружения ${envVar}`);
    }
  }
}

export async function sendRegistrationEmail(data: RegistrationInput) {
  assertMailEnv();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.email,
    subject: "Регистрация на мероприятие «Осень для танцев»",
    text: `Здравствуйте!\n\nСпасибо за регистрацию на мероприятие «Осень для танцев».\n\nДата: 10 сентября\nКонтактный телефон организатора: 8 905 376 45 34\n\nВаши данные:\nКоллектив: ${data.troupeName}\nКоличество человек: ${data.participantsCount}\nТелефон: ${data.phone}\nEmail: ${data.email}\n\nДо встречи на мероприятии!`,
    html: `
      <p>Здравствуйте!</p>
      <p>Спасибо за регистрацию на мероприятие <b>«Осень для танцев»</b>.</p>
      <p><b>Дата:</b> 10 сентября<br />
      <b>Контактный телефон организатора:</b> 8 905 376 45 34</p>
      <p><b>Ваши данные:</b><br />
      Коллектив: ${data.troupeName}<br />
      Количество человек: ${data.participantsCount}<br />
      Телефон: ${data.phone}<br />
      Email: ${data.email}</p>
      <p>До встречи на мероприятии!</p>
    `
  });
}
