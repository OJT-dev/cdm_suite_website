
/**
 * Safely parses a JSON string into a typed value.
 * If parsing fails or the input is null/undefined, returns the fallback value.
 */
export function safeJSONParse<T>(value: string | null | undefined, fallback: T): T {
    if (!value) return fallback;
    try {
        return JSON.parse(value) as T;
    } catch (e) {
        console.error('Failed to parse JSON:', value, e);
        return fallback;
    }
}

/**
 * Safely stringifies a value for storage.
 * If the value is null/undefined, returns an empty JSON array string "[]" by default.
 */
export function safeJSONStringify(value: any, fallback: string = "[]"): string {
    if (value === null || value === undefined) return fallback;
    try {
        return JSON.stringify(value);
    } catch (e) {
        console.error('Failed to stringify JSON:', value, e);
        return fallback;
    }
}
