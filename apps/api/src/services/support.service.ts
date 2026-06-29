import { prisma } from "../db/prisma";
import { RankedSource, SupportDocumentFilters, SupportDocumentRecord, SupportQuestionParams } from "../types/support";
import { extractBestSnippet, normalizeText, tokenize } from "../utils/text-search";

const rankDocument = (document: SupportDocumentRecord, tokens: string[]) => {
  const normalizedTitle = normalizeText(document.titulo);
  const normalizedText = normalizeText(document.texto);
  const normalizedCategory = normalizeText(document.categoria);
  const normalizedTags = document.tags.map(normalizeText);

  let score = 0; // score obtained by the document based on the number of matches with the question tokens
  let matchedTokens = 0; // how many tokens from the question are matched in the document

  for (const token of tokens) {
    const inTitle = normalizedTitle.includes(token);
    const inText = normalizedText.includes(token);
    const inCategory = normalizedCategory.includes(token);
    const inTags = normalizedTags.some((tag) => tag.includes(token));

    if (inTitle || inText || inCategory || inTags) {
      matchedTokens += 1;
    }

    if (inTitle) {
      score += 4;
    }

    if (inCategory || inTags) {
      score += 3;
    }

    if (inText) {
      score += 1;
    }
  }

  if (tokens.length > 1 && normalizedText.includes(tokens.join(" "))) {
    score += 6;
  }

  return {
    coverage: tokens.length === 0 ? 0 : matchedTokens / tokens.length,
    score,
    snippet: extractBestSnippet(document.texto, tokens)
  };
};

const toSource = (document: SupportDocumentRecord, snippet: string) => ({
  docId: document.docId,
  tipo: document.tipo,
  fecha: document.fecha.toISOString().slice(0, 10),
  categoria: document.categoria,
  titulo: document.titulo,
  snippet
});

export const listSupportDocuments = async (asesoriaId: number, filters: SupportDocumentFilters) => {
  const skip = (filters.page - 1) * filters.limit;
  const where = {
    asesoriaId,
    ...(filters.tipo ? { tipo: filters.tipo } : {}),
    ...(filters.categoria ? { categoria: filters.categoria } : {}),
    ...(filters.estado ? { estado: filters.estado } : {}),
    ...(filters.q
      ? {
          OR: [
            { titulo: { contains: filters.q, mode: "insensitive" as const } },
            { texto: { contains: filters.q, mode: "insensitive" as const } },
            { categoria: { contains: filters.q, mode: "insensitive" as const } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.supportDocument.findMany({
      where,
      orderBy: [{ fecha: "desc" }, { docId: "asc" }],
      skip,
      take: filters.limit
    }),
    prisma.supportDocument.count({ where })
  ]);

  return {
    items: items.map((item: SupportDocumentRecord) => ({
      docId: item.docId,
      fecha: item.fecha.toISOString().slice(0, 10),
      tipo: item.tipo,
      categoria: item.categoria,
      prioridad: item.prioridad,
      estado: item.estado,
      titulo: item.titulo,
      snippet: item.texto.length > 220 ? `${item.texto.slice(0, 217).trim()}...` : item.texto,
      tags: item.tags
    })),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};

export const askSupportQuestion = async (asesoriaId: number, { question }: SupportQuestionParams) => {
  const documents = (await prisma.supportDocument.findMany({
    where: { asesoriaId },
    orderBy: [{ fecha: "desc" }, { docId: "asc" }],
    take: 100
  })) as SupportDocumentRecord[];

  const tokens = tokenize(question);

  if (documents.length === 0 || tokens.length === 0) {
    return {
      answer: "No hay informacion suficiente en los documentos de soporte de esta asesoria para responder con confianza.",
      confidence: 0.1,
      sources: []
    };
  }

  const ranked = documents
    .map<RankedSource | null>((document) => {
      const result = rankDocument(document, tokens);

      if (result.score <= 0) {
        return null;
      }

      return {
        score: result.score + result.coverage * 10,
        snippet: result.snippet,
        source: toSource(document, result.snippet)
      };
    })
    .filter((item): item is RankedSource => item !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  const top = ranked[0];

  if (!top || top.score < 4) {
    return {
      answer: "No hay informacion suficiente en los documentos de soporte de esta asesoria para responder con confianza.",
      confidence: 0.2,
      sources: []
    };
  }

  const confidence = Math.min(0.95, Number((top.score / (tokens.length * 8)).toFixed(2)));
  const snippets = ranked.slice(0, 2).map((item) => item.snippet);

  return {
    answer: snippets.join(" "),
    confidence,
    sources: ranked.map((item) => item.source)
  };
};
