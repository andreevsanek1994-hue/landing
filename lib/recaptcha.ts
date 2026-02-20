export async function verifyRecaptchaToken(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Отсутствует переменная окружения RECAPTCHA_SECRET_KEY");
  }

  const params = new URLSearchParams({
    secret: secretKey,
    response: token
  });

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  if (!response.ok) {
    throw new Error("Не удалось проверить reCAPTCHA");
  }

  const data = (await response.json()) as { success: boolean };
  return data.success;
}
