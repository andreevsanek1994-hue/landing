import { z } from "zod";

export const registrationSchema = z.object({
  troupeName: z
    .string()
    .trim()
    .min(2, "Укажите название коллектива (минимум 2 символа).")
    .max(100, "Название коллектива слишком длинное."),
  participantsCount: z.coerce
    .number()
    .int("Количество человек должно быть целым числом.")
    .min(1, "Минимум 1 человек.")
    .max(200, "Слишком большое количество человек."),
  phone: z
    .string()
    .trim()
    .regex(/^\+7\d{10}$/, "Телефон должен быть в формате +7XXXXXXXXXX."),
  email: z.string().trim().email("Укажите корректный email."),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Нужно согласие на обработку персональных данных." })
  }),
  recaptchaToken: z.string().nullish()
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
