import React, { createContext, useContext, useState, ReactNode } from "react";

export type DsaDifficulty = "Easy" | "Medium" | "Hard" | "all";
export type DsaStatus = "solved" | "unsolved" | "attempted" | "all";

interface DsaFilterState {
  search: string;
  setSearch: (search: string) => void;
  difficulty: DsaDifficulty;
  setDifficulty: (diff: DsaDifficulty) => void;
  status: DsaStatus;
  setStatus: (status: DsaStatus) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
}

const DsaFilterContext = createContext<DsaFilterState | undefined>(undefined);

export function DsaFilterProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<DsaDifficulty>("all");
  const [status, setStatus] = useState<DsaStatus>("all");
  const [tags, setTags] = useState<string[]>([]);

  return (
    <DsaFilterContext.Provider
      value={{
        search,
        setSearch,
        difficulty,
        setDifficulty,
        status,
        setStatus,
        tags,
        setTags,
      }}
    >
      {children}
    </DsaFilterContext.Provider>
  );
}

export function useDsaFilter() {
  const context = useContext(DsaFilterContext);
  if (!context) {
    throw new Error("useDsaFilter must be used within a DsaFilterProvider");
  }
  return context;
}
