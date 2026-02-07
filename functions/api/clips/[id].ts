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

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const id = context.params.id;
  await context.env.DB.prepare("DELETE FROM clips WHERE id = ?").bind(id).run();
  return new Response(JSON.stringify({ success: true }));
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const id = context.params.id;
  const body: any = await context.request.json();
  const { content, note } = body;

  await context.env.DB.prepare(
    "UPDATE clips SET content = ?, note = ? WHERE id = ?"
  ).bind(content, note || null, id).run();

  return new Response(JSON.stringify({ success: true }));
};