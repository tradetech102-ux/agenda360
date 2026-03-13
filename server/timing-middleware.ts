/**
 * Timing Middleware para tRPC
 * Mede tempo de execução de cada procedure
 * Registra em headers HTTP e console
 */

import { TRPCError } from "@trpc/server";

const SLOW_QUERY_THRESHOLD = 300; // ms

export function createTimingMiddleware() {
  return async (opts: any) => {
    const startTime = performance.now();
    
    try {
      const result = await opts.next();
      const duration = Math.round(performance.now() - startTime);
      
      const procedurePath = opts.path;
      const isSlowQuery = duration > SLOW_QUERY_THRESHOLD;
      
      if (isSlowQuery) {
        console.warn(
          `⚠️  SLOW QUERY: ${procedurePath} took ${duration}ms`
        );
      } else {
        console.log(
          `✅ ${procedurePath} took ${duration}ms`
        );
      }
      
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      console.error(
        `❌ ERROR in ${opts.path} after ${duration}ms:`,
        error
      );
      throw error;
    }
  };
}
