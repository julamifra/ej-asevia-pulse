import { Badge, Group, Pagination, Paper, Select, Stack, Table, Text, TextInput } from "@mantine/core";
import { startTransition, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { PageHeader } from "../../components/layout/PageHeader";
import { useAsesoriaFilters, useAsesorias } from "../../hooks/use-api";
import { formatNumber, parsePositiveInt } from "../../utils/format";
import classes from "./AsesoriasListPage.module.css";

const PAGE_SIZE = 10;

const updateParams = (
  searchParams: URLSearchParams,
  callback: (nextParams: URLSearchParams) => void
) => {
  const nextParams = new URLSearchParams(searchParams);
  callback(nextParams);
  return nextParams;
};

export function AsesoriasListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const provincia = searchParams.get("provincia") ?? "";
  const especialidad = searchParams.get("especialidad") ?? "";
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const searchParamsKey = searchParams.toString();

  const [searchValue, setSearchValue] = useState(search);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  useEffect(() => {
    const nextSearch = searchValue.trim();

    if (nextSearch === search) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const currentParams = new URLSearchParams(searchParamsKey);

      startTransition(() => {
        setSearchParams(
          updateParams(currentParams, (nextParams) => {
            if (nextSearch) {
              nextParams.set("search", nextSearch);
            } else {
              nextParams.delete("search");
            }

            nextParams.set("page", "1");
          }),
          { replace: true }
        );
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [search, searchParamsKey, searchValue, setSearchParams]);

  const filtersQuery = useAsesoriaFilters();
  const asesoriasQuery = useAsesorias({
    search: search || undefined,
    provincia: provincia || undefined,
    especialidad: especialidad || undefined,
    page,
    limit: PAGE_SIZE
  });

  const filterOptions = useMemo(
    () => ({
      provincias:
        filtersQuery.data?.provincias.map((item) => ({ value: item, label: item })) ?? [],
      especialidades:
        filtersQuery.data?.especialidades.map((item) => ({ value: item, label: item })) ?? []
    }),
    [filtersQuery.data]
  );

  if (filtersQuery.isLoading || asesoriasQuery.isLoading) {
    return <LoadingState title="Cargando asesorias" />;
  }

  if (filtersQuery.error || asesoriasQuery.error) {
    return (
      <ErrorState
        message={
          filtersQuery.error?.message ??
          asesoriasQuery.error?.message ??
          "No se pudieron cargar las asesorias."
        }
        onRetry={() => {
          void filtersQuery.refetch();
          void asesoriasQuery.refetch();
        }}
      />
    );
  }

  const list = asesoriasQuery.data;

  if (!list) {
    return (
      <EmptyState
        title="Sin resultados"
        message="Todavia no hay informacion de asesorias disponible para construir esta vista."
      />
    );
  }

  const setSingleFilter = (key: string, value: string | null) => {
    startTransition(() => {
      setSearchParams(
        updateParams(searchParams, (nextParams) => {
          if (value) {
            nextParams.set(key, value);
          } else {
            nextParams.delete(key);
          }

          nextParams.set("page", "1");
        })
      );
    });
  };

  const setPage = (nextPage: number) => {
    startTransition(() => {
      setSearchParams(
        updateParams(searchParams, (nextParams) => {
          nextParams.set("page", String(nextPage));
        })
      );
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Operacion"
        title="Listado de asesorias"
        description="Busqueda y filtro rapido de la red para localizar cada despacho, entender su contexto y entrar en su detalle operativo."
      />

      <Stack gap="md" className={classes.toolbar}>
        <Group align="flex-end" grow>
          <TextInput
            label="Buscar"
            placeholder="Nombre, ciudad o CIF"
            value={searchValue}
            onChange={(event) => setSearchValue(event.currentTarget.value)}
          />
          <Select
            clearable
            searchable
            label="Provincia"
            placeholder="Todas"
            data={filterOptions.provincias}
            value={provincia || null}
            onChange={(value) => setSingleFilter("provincia", value)}
          />
          <Select
            clearable
            label="Especialidad"
            placeholder="Todas"
            data={filterOptions.especialidades}
            value={especialidad || null}
            onChange={(value) => setSingleFilter("especialidad", value)}
          />
        </Group>

        <Text size="sm" className={classes.statusRow}>
          {list.pagination.total} asesorias encontradas
          {asesoriasQuery.isFetching ? " · actualizando resultados..." : ""}
        </Text>
      </Stack>

      {list.items.length === 0 ? (
        <EmptyState
          title="No hay asesorias para estos filtros"
          message="Prueba a limpiar la busqueda o revisar provincia y especialidad para ampliar resultados."
        />
      ) : (
        <Paper className={classes.tableCard}>
          <Table.ScrollContainer minWidth={760}>
            <Table highlightOnHover stickyHeader>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Ubicacion</Table.Th>
                  <Table.Th>Especialidad</Table.Th>
                  <Table.Th>Equipo</Table.Th>
                  <Table.Th>Alta</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {list.items.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Link to={`/asesorias/${item.id}`} className={classes.tableLink}>
                        {item.nombre}
                      </Link>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={600}>{item.provincia}</Text>
                        <Text size="sm" c="dimmed">
                          {item.ciudad}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="teal">
                        {item.especialidad}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{formatNumber(item.numEmpleados)} personas</Table.Td>
                    <Table.Td>{item.fechaAlta}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}

      {list.pagination.totalPages > 1 ? (
        <div className={classes.pagination}>
          <Pagination
            total={list.pagination.totalPages}
            value={list.pagination.page}
            onChange={setPage}
          />
        </div>
      ) : null}
    </>
  );
}
