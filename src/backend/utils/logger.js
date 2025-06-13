export const logger = {
    log: (...args) => {
        if (process.env.NODE_ENV !== "production") {
            console.log(...args);
        }
    },
    error: (...args) => {
        // Keep errors in production for debugging
        console.error(...args);
    },
    warn: (...args) => {
        if (process.env.NODE_ENV !== "production") {
            console.warn(...args);
        }
    },
};
