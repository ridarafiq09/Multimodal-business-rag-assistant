import { createContext, useContext, useState } from "react";

type SessionContextType = {
  sessionId: string;
  setSessionId: (id: string) => void;
};

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessionId, setSessionId] = useState("");

  return (
    <SessionContext.Provider value={{ sessionId, setSessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
};
