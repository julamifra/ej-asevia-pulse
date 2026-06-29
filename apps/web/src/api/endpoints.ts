import { fetchJson, postJson } from "./client";
import type {
  AsesoriaDetail,
  AsesoriaFilters,
  AsesoriaFiltersResponse,
  AsesoriaListResponse,
  AsesoriaMetricsResponse,
  AsesoriaSummaryResponse,
  NetworkMetricsResponse,
  NetworkSummaryResponse,
  SupportAnswerResponse,
  SupportDocumentsFilters,
  SupportDocumentsResponse,
  SupportQuestionInput,
  SummaryMonthParams
} from "../types/api";

export const getNetworkMetrics = () => fetchJson<NetworkMetricsResponse>("/network/metrics");

export const getNetworkSummary = (params?: SummaryMonthParams) =>
  fetchJson<NetworkSummaryResponse>("/network/summary", params);

export const getAsesorias = (filters: AsesoriaFilters) =>
  fetchJson<AsesoriaListResponse>("/asesorias", filters);

export const getAsesoriaFilters = () => fetchJson<AsesoriaFiltersResponse>("/asesorias/filters");

export const getAsesoriaDetail = (id: number) =>
  fetchJson<AsesoriaDetail>(`/asesorias/${id}`);

export const getAsesoriaMetrics = (id: number) =>
  fetchJson<AsesoriaMetricsResponse>(`/asesorias/${id}/metrics`);

export const getAsesoriaSummary = (id: number, params?: SummaryMonthParams) =>
  fetchJson<AsesoriaSummaryResponse>(`/asesorias/${id}/summary`, params);

export const getSupportDocuments = (id: number, params?: SupportDocumentsFilters) =>
  fetchJson<SupportDocumentsResponse>(`/asesorias/${id}/support-documents`, params);

export const askSupportQuestion = (id: number, body: SupportQuestionInput) =>
  postJson<SupportAnswerResponse, SupportQuestionInput>(`/asesorias/${id}/support/ask`, body);
