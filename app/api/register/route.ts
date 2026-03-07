import { NextRequest, NextResponse } from "next/server";
import { registrationSchema } from "@/lib/validation";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { saveRegistrationToGoogleSheets } from "@/lib/googleSheets";
import { sendRegistrationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = registrationSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Проверьте введённые данные." },
        { status: 400 }
      );
    }

    const recaptchaEnabled = process.env.ENABLE_RECAPTCHA === "true";

    if (recaptchaEnabled) {
      if (!parsed.data.recaptchaToken) {
        return NextResponse.json({ error: "Подтвердите, что вы не робот." }, { status: 400 });
      }

      const isHuman = await verifyRecaptchaToken(parsed.data.recaptchaToken);
      if (!isHuman) {
        return NextResponse.json({ error: "Проверка reCAPTCHA не пройдена." }, { status: 400 });
      }
    }

    await saveRegistrationToGoogleSheets(parsed.data);
    await sendRegistrationEmail(parsed.data);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Ошибка сервера. Попробуйте отправить заявку позже." },
      { status: 500 }
    );
  }
}
