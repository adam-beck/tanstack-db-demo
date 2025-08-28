import { sql } from "kysely";
import type { DB } from "../../../db.d.ts";
import { db } from "../../utils/database";
import { Insertable, Transaction } from "kysely";
import { z } from "zod";

type NewUpdate = Insertable<DB["updates"]>;

const CreateUpdateSchema: z.ZodType<NewUpdate> = z.object({
  update_id: z.uuidv7().optional(),
  username: z.string(),
  description: z.string(),
  blocked: z.boolean().optional(),
});

const wait = (waitTimeInMs: number = 1000) =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), waitTimeInMs);
  });

export type CreateUpdateSchema = z.infer<typeof CreateUpdateSchema>;

const snippet = sql<{
  txid: string;
}>`SELECT pg_current_xact_id()::xid::text as txid`.compile(db);

async function generateTxId(tx: Transaction<DB>): Promise<number> {
  const result = await tx.executeQuery(snippet);

  const txid = result.rows[0]?.txid;

  if (txid === undefined) {
    throw new Error("Failed to get Transaction ID");
  }

  return parseInt(txid, 10);
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const validatedData = CreateUpdateSchema.parse(body);

    await wait(3000);

    const result = await db.transaction().execute(async (trx) => {
      const txid = await generateTxId(trx);
      const update = await trx
        .insertInto("updates")
        .values({
          ...(validatedData.update_id && {
            update_id: validatedData.update_id,
          }),
          username: validatedData.username,
          description: validatedData.description + "!",
          blocked: validatedData.blocked,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return {
        ...update,
        txid,
      };
    });

    return result;
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
});
