import { initEdgeStoreClient } from "@edgestore/server/core";
import { EdgeStoreRouter } from "@/app/api/edgestore/[...edgestore]/route";

// Create a type-safe backend client for server routes
export const backendClient = initEdgeStoreClient<EdgeStoreRouter>({
  router: EdgeStoreRouter, // type of your main router
});