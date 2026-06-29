export type SupportDocumentListParams = {
  q?: string;
  tipo?: string;
  categoria?: string;
  estado?: string;
  page: number;
  limit: number;
};

export type SupportQuestionBody = {
  question: string;
};


export type SupportDocumentFilters = {
  q?: string;
  tipo?: string;
  categoria?: string;
  estado?: string;
  page: number;
  limit: number;
};

export type SupportQuestionParams = {
  question: string;
};

export type SupportDocumentRecord = {
  docId: string;
  asesoriaId: number;
  fecha: Date;
  tipo: string;
  categoria: string;
  prioridad: string;
  estado: string;
  titulo: string;
  texto: string;
  tags: string[];
};

export type RankedSource = {
  score: number;
  snippet: string;
  source: {
    docId: string;
    tipo: string;
    fecha: string;
    categoria: string;
    titulo: string;
    snippet: string;
  };
};