import { useEffect, useState } from "react";

const usePersistedState = (
  storageKey: string,
  defaultData: string,
): [string, (val: string) => void] => {
  // use a function for the inital state calculation to run it only once
  const [data, setData] = useState<string>(() => {
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
        return storedData;
    }
    return defaultData;
  });

  // use useEffect to sync the state with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, data);
  }, [storageKey, data]);

  return [data, setData];
};

export default usePersistedState;
