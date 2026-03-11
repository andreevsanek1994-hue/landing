import { NextRequest, NextResponse } from "next/server";
import { registrationSchema } from "@/lib/validation";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { saveRegistrationToGoogleSheets } from "@/lib/googleSheets";
import { sendRegistrationEmail } from "@/lib/email";
import { checkDuplicate, markSubmitted } from "@/lib/duplicates";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Слишком много запросов. Подождите минуту." },
        { status: 429 }
      );
    }

    const payload = await request.json();
    const parsed = registrationSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Проверьте введённые данные." },
        { status: 400 }
      );
    }

    // reCAPTCHA
    const isHuman = await verifyRecaptchaToken(parsed.data.recaptchaToken);
    if (!isHuman) {
      return NextResponse.json({ error: "Проверка reCAPTCHA не пройдена." }, { status: 400 });
    }

    // Duplicate check
    const duplicateError = checkDuplicate(parsed.data.phone, parsed.data.email);
    if (duplicateError) {
      return NextResponse.json({ error: duplicateError }, { status: 409 });
    }

    // Save to Google Sheets (critical)
    await saveRegistrationToGoogleSheets(parsed.data);

    // Mark as submitted after sheet save
    markSubmitted(parsed.data.phone, parsed.data.email);

    // Send email (non-critical — don't fail registration if email fails)
    try {
      await sendRegistrationEmail(parsed.data);
    } catch (emailError) {
      console.error("Ошибка отправки email (регистрация сохранена):", emailError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Ошибка сервера. Попробуйте отправить заявку позже." },
      { status: 500 }
    );
  }
}
