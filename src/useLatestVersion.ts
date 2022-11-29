import { useCallback, useLayoutEffect, useRef } from "react";

export function useLatestVersion<T extends Function>(handler: T) {
  const handlerRef = useRef<T>(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args: any[]) => {
    const fn = handlerRef.current;
    return fn(...args);
  }, []);
}
