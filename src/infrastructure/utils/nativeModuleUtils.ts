/**
 * Native Module Utilities
 *
 * Safe wrappers for native module access with timeout and error handling
 * Prevents crashes when native modules are not ready
 */

/**
 * Execute a native module call with timeout
 * @param operation - Async operation to execute
 * @param timeoutMs - Timeout in milliseconds (default: 1000)
 * @returns Result of operation or null if timeout/error
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 1000,
): Promise<T | null> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
    });

    return await Promise.race([operation(), timeoutPromise]);
  } catch {
    return null;
  }
}

/**
 * Safely access a native module property
 * @param accessor - Function that accesses the property
 * @param fallback - Fallback value if access fails
 * @returns Property value or fallback
 */
export function safeAccess<T>(accessor: () => T, fallback: T): T {
  try {
    const value = accessor();
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Execute multiple native module operations with timeout
 * @param operations - Array of async operations
 * @param timeoutMs - Timeout in milliseconds (default: 2000)
 * @returns Array of results (null for failed operations)
 */
export async function withTimeoutAll<T>(
  operations: Array<() => Promise<T>>,
  timeoutMs: number = 2000,
): Promise<Array<T | null>> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operations timeout')), timeoutMs);
    });

    const results = await Promise.race([
      Promise.all(operations.map((op) => op().catch(() => null))),
      timeoutPromise,
    ]).catch(() => operations.map(() => null));

    return results as Array<T | null>;
  } catch {
    return operations.map(() => null);
  }
}

