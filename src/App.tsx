import { createContext, useContext, useEffect, useState } from "react";
import { useStore } from "zustand";
import {
  CounterStoreAndDeriveStore,
  createCounterStore,
  createCounterStoreAndDeriveStore,
  createDeriveCounterStore as createDeriveCounterStore,
} from "./timer-store";

import "./App.css";

const TimerContext = createContext<ReturnType<
  typeof createCounterStore
> | null>(null);

const DeriveTimerContext = createContext<ReturnType<
  typeof createDeriveCounterStore
> | null>(null);

const useTimerStore = () => {
  const store = useContext(TimerContext);
  if (store === null) {
    throw new Error("no provider");
  }
  useEffect(() => {
    // clean up the internal timer when the store is destroyed
    return () => store.getState().destroy();
  }, [store]);
  return useStore(store);
};

const useDerivedTimerStore = () => {
  const store = useContext(DeriveTimerContext);
  if (store === null) {
    throw new Error("no provider");
  }
  return useStore(store);
};

const Timer = () => {
  const { start, stop, reset, count } = useTimerStore();
  const { doubleCount, canStop, canReset, canStart } = useDerivedTimerStore();

  return (
    <div className="timer">
      <p>count: {count} </p>
      <p>Double count: {doubleCount} </p>
      {canStart && <button onClick={start}>Start</button>}
      {canStop && <button onClick={stop}>Stop</button>}
      {canReset && <button onClick={reset}>Reset</button>}
    </div>
  );
};

export default function App() {
  const [storesArray, setStoresArray] = useState<CounterStoreAndDeriveStore[]>([
    createCounterStoreAndDeriveStore({ count: 0 }),
  ]);

  return (
    <div className="timers">
      {storesArray.map((stores, index) => (
        <TimerContext.Provider value={stores.counterStore} key={index}>
          <DeriveTimerContext.Provider value={stores.deriveCounterStore}>
            <Timer />
          </DeriveTimerContext.Provider>
        </TimerContext.Provider>
      ))}
      <div>
        <button
          onClick={() =>
            setStoresArray([
              ...storesArray,
              createCounterStoreAndDeriveStore({ count: 0 }),
            ])
          }
        >
          Add New Timer
        </button>
      </div>
      <button
        onClick={() => {
          if (storesArray.length > 0) {
            setStoresArray(storesArray.slice(0, storesArray.length - 1));
          }
        }}
      >
        Remove Last Timer
      </button>
    </div>
  );
}
