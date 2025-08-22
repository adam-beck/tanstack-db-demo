import { createCollection } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { UpdateSchema } from "./schemas/updates";

export const updatesCollection = createCollection(
  electricCollectionOptions({
    id: "sync-updates",
    shapeOptions: {
      url: "https://localhost:4430/electric/v1/shape",
      params: {
        table: "updates",
      },
    },
    schema: UpdateSchema,
    getKey: (item) => item.update_id,
    onInsert: async ({ transaction }) => {
      const { modified: newUpdate } = transaction.mutations[0];

      const response = await fetch("https://localhost:4430/api/updates", {
        method: "POST",
        body: JSON.stringify(newUpdate),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to insert: ${response.statusText}`);
      }

      const result = await response.json();

      // Return the PostgreSQL transaction ID from the backend
      return { txid: result.txid };
    },
  }),
);
