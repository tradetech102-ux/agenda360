/**
 * Performance Logger Middleware
 * Mede tempo de execução de todas as mutations e queries
 * Identifica endpoints acima de 300ms
 */

interface PerformanceMetric {
  procedure: string;
  type: 'query' | 'mutation';
  duration: number;
  timestamp: Date;
  isSlowQuery: boolean;
}

const metrics: PerformanceMetric[] = [];
const SLOW_QUERY_THRESHOLD = 300; // ms

export function logPerformance(
  procedure: string,
  type: 'query' | 'mutation',
  duration: number
) {
  const isSlowQuery = duration > SLOW_QUERY_THRESHOLD;
  
  const metric: PerformanceMetric = {
    procedure,
    type,
    duration,
    timestamp: new Date(),
    isSlowQuery,
  };

  metrics.push(metric);

  // Log slow queries em tempo real
  if (isSlowQuery) {
    console.warn(
      `⚠️  SLOW ${type.toUpperCase()}: ${procedure} took ${duration}ms`
    );
  } else {
    console.log(
      `✅ ${type.toUpperCase()}: ${procedure} took ${duration}ms`
    );
  }

  // Manter apenas últimas 1000 métricas
  if (metrics.length > 1000) {
    metrics.shift();
  }
}

export function getPerformanceReport() {
  const slowQueries = metrics.filter((m) => m.isSlowQuery);
  const avgDuration =
    metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length || 0;

  const byProcedure = new Map<string, number[]>();
  metrics.forEach((m) => {
    if (!byProcedure.has(m.procedure)) {
      byProcedure.set(m.procedure, []);
    }
    byProcedure.get(m.procedure)!.push(m.duration);
  });

  const procedureStats = Array.from(byProcedure.entries()).map(
    ([procedure, durations]) => ({
      procedure,
      count: durations.length,
      avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      min: Math.min(...durations),
      max: Math.max(...durations),
    })
  );

  return {
    totalMetrics: metrics.length,
    slowQueriesCount: slowQueries.length,
    averageDuration: Math.round(avgDuration),
    slowQueries: slowQueries.map((m) => ({
      procedure: m.procedure,
      type: m.type,
      duration: m.duration,
      timestamp: m.timestamp,
    })),
    procedureStats: procedureStats.sort((a, b) => b.avg - a.avg),
  };
}

export function resetMetrics() {
  metrics.length = 0;
}
