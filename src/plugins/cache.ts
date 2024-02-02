import type { FastifyInstance } from "fastify";
import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 90, // 1m30s,
  checkperiod: 120, // 2min
  deleteOnExpire: true,
  maxKeys: 500,
});

export async function cachePlugin(app: FastifyInstance): Promise<void> {
  app.decorate("setCacheItem", ({ key, datum }) => {
    try {
      cache.set(key, JSON.stringify(datum));
      return true;
    } catch {
      app.log.error("An error occurred while an item was being cached");
      return false;
    }
  });

  app.decorate("getCacheItem", (key) => {
    try {
      const value = cache.get(key);
      return typeof value === "string" ? JSON.parse(value) : null;
    } catch {
      app.log.error("An error occurred while an item was being fetched");
      return null;
    }
  });

  app.decorate("removeCacheItem", (key) => {
    const amount = cache.del(key);
    return amount > 0;
  });
}

// Data types declaration
//
type CacheItemDatum<T> = {
  key: string;
  datum: T;
};

declare module "fastify" {
  export interface FastifyInstance {
    setCacheItem: <T>(datum: CacheItemDatum<T>) => boolean;
    getCacheItem: <T>(key: string) => CacheItemDatum<T> | null;
    removeCacheItem: (key: string) => boolean;
  }
}
