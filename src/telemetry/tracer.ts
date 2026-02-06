export type Span = {
  name: string;
  start: number;
  end?: number;
  meta?: Record<string, any>;
};

export type Trace = {
  traceId: string;
  spans: Span[];
};

/**
 * Create a new trace
 */
export function createTrace(): Trace {
  return {
    traceId: crypto.randomUUID(),
    spans: [],
  };
}

/**
 * Start a span
 */
export function startSpan(
  trace: Trace,
  name: string,
  meta?: Record<string, any>
): Span {
  const span: Span = {
    name,
    start: Date.now(),
    meta,
  };

  trace.spans.push(span);
  return span;
}

/**
 * End a span
 */
export function endSpan(
  span: Span,
  meta?: Record<string, any>
): void {
  span.end = Date.now();
  span.meta = {
    ...(span.meta || {}),
    ...(meta || {}),
  };
}

