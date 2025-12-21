import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

// Time in ms to group rapid changes (like slider drags) into a single history entry
const COALESCE_THRESHOLD = 500;

export function useHistoryState<T>(initialState: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const lastUpdateRef = useRef<number>(Date.now());

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    setState((currentState) => {
      if (currentState.past.length === 0) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
    lastUpdateRef.current = 0; // Force next update to be a new entry
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      if (currentState.future.length === 0) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
    lastUpdateRef.current = 0; // Force next update to be a new entry
  }, []);

  const setHistoryState = useCallback((newState: T | ((prev: T) => T)) => {
    setState((currentState) => {
      const resolvedState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(currentState.present) 
        : newState;

      if (resolvedState === currentState.present) return currentState;

      const now = Date.now();
      const timeDiff = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      // If changes happen very quickly (e.g. dragging a slider), 
      // we update the current state but don't push a new entry to 'past' yet.
      // This effectively groups the slider drag into one history action.
      // We only coalesce if we have a past to coalesce against.
      if (timeDiff < COALESCE_THRESHOLD && currentState.past.length > 0) {
         return {
           ...currentState,
           present: resolvedState,
           // Future must be cleared when new state is set
           future: [] 
         };
      }

      return {
        past: [...currentState.past, currentState.present],
        present: resolvedState,
        future: [],
      };
    });
  }, []);

  // Hard reset function (clears history)
  const resetHistoryState = useCallback((newState: T) => {
    setState({
      past: [],
      present: newState,
      future: []
    });
    lastUpdateRef.current = Date.now();
  }, []);

  return {
    state: state.present,
    setState: setHistoryState,
    resetState: resetHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
    past: state.past,
    future: state.future
  };
}