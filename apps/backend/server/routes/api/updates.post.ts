import { DB } from "kysely-codegen";
import { db } from "../../utils/database";
import { Insertable } from "kysely";
import { z } from "zod";

type NewUpdate = Insertable<DB["updates"]>;

const CreateUpdateSchema: z.ZodType<NewUpdate> = z.object({
  update_id: z.uuidv7(),
  username: z.string(),
  description: z.string(),
  blocked: z.boolean().optional(),
});

export type CreateUpdateSchema = z.infer<typeof CreateUpdateSchema>;

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const validatedData = CreateUpdateSchema.parse(body);

    const update = await db
      .insertInto("updates")
      .values({
        update_id: validatedData.update_id,
        username: validatedData.username,
        description: validatedData.description,
        blocked: validatedData.blocked,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return update;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid data",
        data: error.message,
      });
    }

    throw createError({
      statusCode: 500,
      message: "Internal error",
    });
  }

  // try {
  //   const updates = await db.selectFrom("updates").selectAll().execute();
  //
  //   return updates;
  // } catch (error) {
  //   throw createError({
  //     statusCode: 500,
  //     statusMessage: "Failed to fetch `updates`",
  //   });
  // }
});
