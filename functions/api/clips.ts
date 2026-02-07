interface D1PreparedStatement {
  bind(...args: any[]): D1PreparedStatement;
  all(): Promise<{ results: any[] }>;
  run(): Promise<{ success: boolean; meta: any }>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface EventContext<Env, P extends string, D> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: D;
}

type PagesFunction<
  Env = unknown, 
  Params extends string = any, 
  Data extends Record<string, unknown> = Record<string, unknown>
> = (
  context: EventContext<Env, Params, Data>
) => Response | Promise<Response>;

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM clips ORDER BY created_at DESC LIMIT 100"
    ).all();
    
    return new Response(JSON.stringify({ success: true, data: results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    const { id, content, note, created_at } = body;
    
    if (!content) return new Response("Missing content", { status: 400 });

    await context.env.DB.prepare(
      "INSERT INTO clips (id, content, note, created_at) VALUES (?, ?, ?, ?)"
    ).bind(id, content, note || null, created_at).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}