import { useCallback, useLayoutEffect, useRef, useState, type DependencyList } from 'react';

/** Track an element's scroll height so an accordion can animate a number, not `auto`. */
export function useMeasuredHeight<T extends HTMLElement>(deps: DependencyList = []) {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState(0);

  const measure = useCallback(() => {
    if (ref.current) setHeight(ref.current.scrollHeight);
  }, []);

  useLayoutEffect(() => {
    measure();
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(node);
    return () => observer.disconnect();
    // Caller passes the values that change the measured content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, ...deps]);

  return { ref, height };
}
