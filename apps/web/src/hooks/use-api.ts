import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import {
  askSupportQuestion,
  getAsesoriaDetail,
  getAsesoriaFilters,
  getAsesoriaMetrics,
  getAsesoriaSummary,
  getAsesorias,
  getNetworkMetrics,
  getNetworkSummary,
  getSupportDocuments
} from "../api/endpoints";
import type { AsesoriaFilters, SupportDocumentsFilters, SupportQuestionInput, SummaryMonthParams } from "../types/api";

export const useNetworkMetrics = () =>
  useQuery({
    queryKey: ["network-metrics"],
    queryFn: getNetworkMetrics
  });

export const useNetworkSummary = (params?: SummaryMonthParams, enabled = true) =>
  useQuery({
    queryKey: ["network-summary", params],
    queryFn: () => getNetworkSummary(params),
    enabled,
    placeholderData: keepPreviousData
  });

export const useAsesorias = (filters: AsesoriaFilters) =>
  useQuery({
    queryKey: ["asesorias", filters],
    queryFn: () => getAsesorias(filters),
    placeholderData: keepPreviousData
  });

export const useAsesoriaFilters = () =>
  useQuery({
    queryKey: ["asesoria-filters"],
    queryFn: getAsesoriaFilters
  });

export const useAsesoriaDetail = (id: number, enabled = true) =>
  useQuery({
    queryKey: ["asesoria-detail", id],
    queryFn: () => getAsesoriaDetail(id),
    enabled
  });

export const useAsesoriaMetrics = (id: number, enabled = true) =>
  useQuery({
    queryKey: ["asesoria-metrics", id],
    queryFn: () => getAsesoriaMetrics(id),
    enabled
  });

export const useAsesoriaSummary = (
  id: number,
  params?: SummaryMonthParams,
  enabled = true
) =>
  useQuery({
    queryKey: ["asesoria-summary", id, params],
    queryFn: () => getAsesoriaSummary(id, params),
    enabled,
    placeholderData: keepPreviousData
  });

export const useSupportDocuments = (
  id: number,
  filters?: SupportDocumentsFilters,
  enabled = true
) =>
  useQuery({
    queryKey: ["support-documents", id, filters],
    queryFn: () => getSupportDocuments(id, filters),
    enabled,
    placeholderData: keepPreviousData
  });

export const useAskSupportQuestion = (id: number) =>
  useMutation({
    mutationFn: (body: SupportQuestionInput) => askSupportQuestion(id, body)
  });
