import {
  FromTo,
  Language,
  Text,
  Original,
  TranslationConfig,
} from "@/api/lib/domain";
import { translate } from "@/api/feature/translation/usecase";
import { getUserIdFromSession } from "@/api/utils/getUserIdFromSession";

export async function POST(request: Request) {
  const userId = await getUserIdFromSession(request);
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body = await request.json();
  const result = await translate.execute(
    new Original(new Text(body.text), new Language(body.from)),
    new TranslationConfig(
      new FromTo(new Language(body.from), new Language(body.to))
    ),
    userId
  );
  return Response.json({ translated: result.toJSON().translated.text });
}

// async function translate(text: string) {
//   await sleep(1000);
//   return "translated: " + text;
// }

// async function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
