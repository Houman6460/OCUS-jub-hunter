/// <reference types="vite/client" />

declare module '*.webp' {
  const value: string;
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
