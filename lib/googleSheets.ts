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

function extractPrivateKeyFromEnv() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!raw) {
    throw new Error("Отсутствует переменная окружения GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  }

  const unwrapped = raw.trim().replace(/^"|"$/g, "");
  const withNewLines = unwrapped.replace(/\\n/g, "\n");

  if (withNewLines.includes("BEGIN PRIVATE KEY")) {
    return withNewLines;
  }

  // Fallback: sometimes users paste full JSON or base64 JSON instead of plain key.
  try {
    const parsed = JSON.parse(withNewLines) as { private_key?: string };
    if (parsed.private_key) {
      return parsed.private_key.replace(/\\n/g, "\n");
    }
  } catch {
    // noop
  }

  try {
    const decoded = Buffer.from(withNewLines, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as { private_key?: string };
    if (parsed.private_key) {
      return parsed.private_key.replace(/\\n/g, "\n");
    }
  } catch {
    // noop
  }

  throw new Error(
    "Неверный формат GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY. Ожидается PEM-ключ с BEGIN/END PRIVATE KEY и \\n в переносах строк."
  );
}

export async function saveRegistrationToGoogleSheets(data: RegistrationInput) {
  assertGoogleEnv();

  const privateKey = extractPrivateKeyFromEnv();

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
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
