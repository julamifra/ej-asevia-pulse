import { fetchJson } from "./client";
import type {
  AsesoriaDetail,
  AsesoriaFilters,
  AsesoriaFiltersResponse,
  AsesoriaListResponse,
  AsesoriaMetricsResponse,
  AsesoriaSummaryResponse,
  NetworkMetricsResponse,
  NetworkSummaryResponse,
  SummaryMonthParams
} from "../types/api";

export const getNetworkMetrics = () => fetchJson<NetworkMetricsResponse>("/network/metrics");

export const getNetworkSummary = () => fetchJson<NetworkSummaryResponse>("/network/summary");

export const getAsesorias = (filters: AsesoriaFilters) =>
  fetchJson<AsesoriaListResponse>("/asesorias", filters);

export const getAsesoriaFilters = () => fetchJson<AsesoriaFiltersResponse>("/asesorias/filters");

export const getAsesoriaDetail = (id: number) =>
  fetchJson<AsesoriaDetail>(`/asesorias/${id}`);

export const getAsesoriaMetrics = (id: number) =>
  fetchJson<AsesoriaMetricsResponse>(`/asesorias/${id}/metrics`);

export const getAsesoriaSummary = (id: number, params?: SummaryMonthParams) =>
  fetchJson<AsesoriaSummaryResponse>(`/asesorias/${id}/summary`, params);
