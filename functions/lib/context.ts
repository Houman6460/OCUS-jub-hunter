export interface Env {
  DB: D1Database;
}

export interface PagesFunctionEnv<Params extends string = any> {
  request: Request;
  env: Env;
  params: Record<Params, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, any>;
}
