import { google } from "googleapis";
import { RegistrationInput } from "@/lib/validation";

const requiredEnvVars = [
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
  "GOOGLE_SHEET_ID"
] as const;

function assertGoogleEnv() {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Отсутствует переменная окружения ${envVar}`);
    }
  }
}

export async function saveRegistrationToGoogleSheets(data: RegistrationInput) {
  assertGoogleEnv();

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  const sheets = google.sheets({ version: "v4", auth });
  const timestamp = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Заявки!A:G",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          timestamp,
          data.troupeName,
          data.participantsCount,
          data.phone,
          data.email,
          "Да",
          ""
        ]
      ]
    }
  });
}
