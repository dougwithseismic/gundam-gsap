import { useRef, useCallback, useEffect } from "react";
import { gsap } from "gsap";

interface AnimationCleanupState {
  timeouts: Set<ReturnType<typeof setTimeout>>;
  intervals: Set<ReturnType<typeof setInterval>>;
  listeners: Map<EventTarget, Map<string, EventListener>>;
  context: gsap.Context | null;
}

export const useAnimationCleanup = () => {
  const state = useRef<AnimationCleanupState>({
    timeouts: new Set(),
    intervals: new Set(),
    listeners: new Map(),
    context: null,
  });

  const trackTimeout = useCallback(
    (timeoutId: ReturnType<typeof setTimeout>) => {
      state.current.timeouts.add(timeoutId);
      return timeoutId;
    },
    [],
  );

  const trackInterval = useCallback(
    (intervalId: ReturnType<typeof setInterval>) => {
      state.current.intervals.add(intervalId);
      return intervalId;
    },
    [],
  );

  const trackListener = useCallback(
    (element: EventTarget, type: string, listener: EventListener) => {
      if (!state.current.listeners.has(element)) {
        state.current.listeners.set(element, new Map());
      }
      state.current.listeners.get(element)!.set(type, listener);
      element.addEventListener(type, listener);
    },
    [],
  );

  const createContext = useCallback(
    (func: () => void, scope?: Element | string | object) => {
      state.current.context = gsap.context(func, scope);
      return state.current.context;
    },
    [],
  );

  const cleanup = useCallback(() => {
    // Clear all timeouts
    state.current.timeouts.forEach(clearTimeout);
    state.current.timeouts.clear();

    // Clear all intervals
    state.current.intervals.forEach(clearInterval);
    state.current.intervals.clear();

    // Remove all event listeners
    state.current.listeners.forEach((listeners, element) => {
      listeners.forEach((listener, type) => {
        element.removeEventListener(type, listener);
      });
    });
    state.current.listeners.clear();

    // Revert GSAP context
    if (state.current.context) {
      state.current.context.revert();
      state.current.context = null;
    }
  }, []);

  // Ensure cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    trackTimeout,
    trackInterval,
    trackListener,
    createContext,
    cleanup,
  };
};
