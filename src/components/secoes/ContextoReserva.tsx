"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { combinarServicos, type Extra } from "@/lib/agenda/regras";

type Valor = {
  selecionados: string[];
  alternarServico: (id: string) => void;
  quantidades: Record<string, number>;
  definirQuantidade: (id: string, quantidade: number) => void;
  extras: Extra[];
  combinacao: ReturnType<typeof combinarServicos>;
};

const Contexto = createContext<Valor | null>(null);

export function ReservaProvider({ children }: { children: ReactNode }) {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});

  const valor = useMemo(() => {
    const extras = Object.entries(quantidades);
    return {
      selecionados,
      alternarServico: (id: string) =>
        setSelecionados((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id])),
      quantidades,
      definirQuantidade: (id: string, quantidade: number) =>
        setQuantidades((atual) => {
          const novo = { ...atual };
          if (quantidade > 0) novo[id] = quantidade;
          else delete novo[id];
          return novo;
        }),
      extras,
      combinacao: combinarServicos(selecionados, extras),
    };
  }, [selecionados, quantidades]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useReserva() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("useReserva precisa de ReservaProvider");
  return valor;
}
