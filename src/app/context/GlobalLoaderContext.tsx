import React, { createContext, useContext, useState } from "react";

const GlobalLoaderContext = createContext<{
  loading: boolean;
  setLoading: (loading: boolean) => void;
}>({
  loading: false,
  setLoading: () => {},
});

export const GlobalLoaderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <GlobalLoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </GlobalLoaderContext.Provider>
  );
};

export const useGlobalLoader = () => useContext(GlobalLoaderContext);
