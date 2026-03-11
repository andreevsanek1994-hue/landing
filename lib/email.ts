import nodemailer from "nodemailer";
import dns from "node:dns";
import { RegistrationInput } from "@/lib/validation";

const requiredMailVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"] as const;

function assertMailEnv() {
  for (const envVar of requiredMailVars) {
    if (!process.env[envVar]) {
      throw new Error(`Отсутствует переменная окружения ${envVar}`);
    }
  }
}

/**
 * Резолвим SMTP-хост через Google Public DNS (8.8.8.8),
 * чтобы обойти подмену DNS от VPN (Cloudflare WARP и т.п.).
 */
async function resolveSmtpHost(hostname: string): Promise<string> {
  const resolver = new dns.promises.Resolver();
  resolver.setServers(["8.8.8.8", "8.8.4.4"]);

  try {
    const addresses = await resolver.resolve4(hostname);
    if (addresses.length > 0) {
      console.log(`SMTP DNS resolved: ${hostname} -> ${addresses[0]}`);
      return addresses[0];
    }
  } catch (err) {
    console.warn(`Custom DNS resolution failed for ${hostname}, using default:`, err);
  }

  // Fallback — системный DNS
  return hostname;
}

export async function sendRegistrationEmail(data: RegistrationInput) {
  assertMailEnv();

  const smtpHost = process.env.SMTP_HOST!;
  const smtpPort = Number(process.env.SMTP_PORT);
  const isSecure = smtpPort === 465;

  // Резолвим реальный IP SMTP-сервера в обход VPN
  const resolvedHost = await resolveSmtpHost(smtpHost);

  const transporter = nodemailer.createTransport({
    host: resolvedHost,
    port: smtpPort,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      // Указываем реальное имя хоста для проверки TLS-сертификата
      servername: smtpHost,
    },
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
