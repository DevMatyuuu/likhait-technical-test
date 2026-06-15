const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: unknown[]) => isDev && console.log('[LOG]', ...args),
  warn: (...args: unknown[]) => isDev && console.warn('[WARN]', ...args),
  error: (...args: unknown[]) => isDev && console.error('[ERROR]', ...args),
  info: (...args: unknown[]) => isDev && console.info('[INFO]', ...args),
}