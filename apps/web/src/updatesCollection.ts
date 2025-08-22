import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { QueryClient } from "@tanstack/query-core";

import type { Update } from "../../backend/server/routes/api/updates.get";

const queryClient = new QueryClient();

export const updatesCollection = createCollection(
  queryCollectionOptions({
    queryClient,
    queryKey: ["updates"],
    queryFn: async () => {
      const response = await fetch("/api/updates");

      return response.json() as unknown as Update[];
    },
    getKey: (item) => item.update_id,
    onInsert: async ({ transaction }) => {
      const { modified: newUpdate } = transaction.mutations[0];

      await fetch("/api/updates", {
        method: "POST",
        body: JSON.stringify(newUpdate),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  }),
);
