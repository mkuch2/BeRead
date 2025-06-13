export const logger = {
  log: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Keep errors in production for debugging
    console.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(...args);
    }
  },
};
