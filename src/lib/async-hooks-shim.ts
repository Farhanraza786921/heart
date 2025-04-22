'use server';

let asyncHooks: typeof import('async_hooks') | null = null;

if (typeof window === 'undefined') {
  try {
    asyncHooks = require('async_hooks');
  } catch (e: any) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      console.warn('async_hooks not available.', e);
    }
    asyncHooks = null;
  }
}

export { asyncHooks };
