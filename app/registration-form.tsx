"use client";

import { FormEvent, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { IMaskInput } from "react-imask";

type FormState = {
  troupeName: string;
  participantsCount: string;
  phone: string;
  email: string;
  consent: boolean;
};

const initialState: FormState = {
  troupeName: "",
  participantsCount: "",
  phone: "",
  email: "",
  consent: false
};

const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

export default function RegistrationForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<ReCAPTCHA>(null);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const validateClient = () => {
    if (form.troupeName.trim().length < 2) return "Введите название коллектива.";
    const participants = Number(form.participantsCount);
    if (!Number.isInteger(participants) || participants < 1 || participants > 200) {
      return "Количество человек: целое число от 1 до 200.";
    }
    if (!phoneRegex.test(form.phone.trim())) {
      return "Введите номер телефона полностью.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      return "Введите корректный email.";
    }
    if (!form.consent) {
      return "Необходимо согласие на обработку персональных данных.";
    }
    if (!recaptchaToken) {
      return "Подтвердите, что вы не робот.";
    }
    return "";
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validationError = validateClient();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          participantsCount: Number(form.participantsCount),
          recaptchaToken
        })
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Ошибка отправки формы.");
        return;
      }

      setForm(initialState);
      setRecaptchaToken(null);
      captchaRef.current?.reset();
      setIsSuccessOpen(true);
    } catch {
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="form" onSubmit={onSubmit}>
        <label>
          Название коллектива
          <input
            required
            type="text"
            value={form.troupeName}
            onChange={(event) => setForm((prev) => ({ ...prev, troupeName: event.target.value }))}
          />
        </label>

        <label>
          Количество человек
          <input
            required
            type="number"
            min={1}
            max={200}
            value={form.participantsCount}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, participantsCount: event.target.value }))
            }
          />
        </label>

        <label>
          Телефон
          <IMaskInput
            mask="+7 (000) 000-00-00"
            value={form.phone}
            unmask={false}
            onAccept={(value: string) => setForm((prev) => ({ ...prev, phone: value }))}
            placeholder="+7 (___) ___-__-__"
            required
            type="tel"
          />
        </label>

        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </label>

        <label className="checkbox">
          <input
            required
            type="checkbox"
            checked={form.consent}
            onChange={(event) => setForm((prev) => ({ ...prev, consent: event.target.checked }))}
          />
          Я согласен(а) на <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">обработку персональных данных</a>
        </label>

        {siteKey ? (
          <ReCAPTCHA ref={captchaRef} sitekey={siteKey} onChange={(token) => setRecaptchaToken(token)} />
        ) : (
          <p className="hint">Добавьте NEXT_PUBLIC_RECAPTCHA_SITE_KEY в .env.local</p>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Отправляем..." : "Отправить заявку"}
        </button>
      </form>

      {isSuccessOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <p>Спасибо, заявка принята.</p>
            <button type="button" onClick={() => setIsSuccessOpen(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}
