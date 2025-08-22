import { DB } from "kysely-codegen";
import { db } from "../../utils/database";
import { Selectable } from "kysely";

export type Update = Selectable<DB["updates"]>;

export default defineEventHandler(async (_event) => {
  try {
    const updates = await db.selectFrom("updates").selectAll().execute();

    return updates;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch `updates`",
    });
  }
});
