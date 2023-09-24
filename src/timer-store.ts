import { StoreApi, createStore } from "zustand";
import { derive } from "derive-zustand";

export interface CounterStateProps {
  count: number;
  isRunning: boolean;
}

export interface CounterStateActions {
  start: () => void;
  stop: () => void;
  reset: () => void;
  /** Clean up the interval when the component is unmounted */
  destroy: () => void;
}

export type CounterState = CounterStateProps & CounterStateActions;

export const createCounterStore = (
  initialState: Partial<CounterStateProps>
) => {
  let intervalId: number | null = null;

  const clearCurrentInterval = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  return createStore<CounterStateProps & CounterStateActions>((set) => ({
    count: initialState.count ?? 0,
    isRunning: false,
    start: () => {
      console.log("start", intervalId);
      if (intervalId === null) {
        set({ isRunning: true });

        intervalId = setInterval(() => {
          console.log("tick", intervalId);
          set((state) => ({ count: state.count + 1, isRunning: true }));
        }, 500);
      }
    },
    stop: () => {
      console.log("stop", intervalId);
      clearCurrentInterval();
      set({ isRunning: false });
    },
    reset: () => {
      console.log("reset", intervalId);
      clearCurrentInterval();
      set({ count: 0, isRunning: false });
    },
    destroy: () => {
      console.log("destroy", intervalId);
      clearCurrentInterval();
    },
  }));
};

export interface DeriveCounterState {
  doubleCount: number;
  canStart: boolean;
  canStop: boolean;
  canReset: boolean;
}

export const createDeriveCounterStore = (store: StoreApi<CounterState>) => {
  return derive<DeriveCounterState>((get) => {
    const state = get(store);

    const computeCanStart = (): boolean => {
      return !state.isRunning;
    };

    const computeCanStop = (): boolean => {
      return state.isRunning;
    };

    const computeCanReset = (): boolean => {
      return state.count > 0 || state.isRunning;
    };

    return {
      doubleCount: state.count * 2,
      canStart: computeCanStart(),
      canStop: computeCanStop(),
      canReset: computeCanReset(),
    };
  });
};

export interface CounterStoreAndDeriveStore {
  counterStore: StoreApi<CounterState>;
  deriveCounterStore: StoreApi<DeriveCounterState>;
}

export const createCounterStoreAndDeriveStore = (
  initialState: Partial<CounterStateProps>
): CounterStoreAndDeriveStore => {
  const counterStore = createCounterStore(initialState);
  const deriveCounterStore = createDeriveCounterStore(counterStore);

  return { counterStore, deriveCounterStore };
};
