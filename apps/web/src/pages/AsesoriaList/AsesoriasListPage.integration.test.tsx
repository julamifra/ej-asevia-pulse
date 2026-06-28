import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "../../App";

const originalFetch = globalThis.fetch;

const asesoriasResponse = {
  items: [
    {
      id: 1,
      nombre: "Asesoria Norte",
      provincia: "Madrid",
      ciudad: "Madrid",
      numEmpleados: 12,
      especialidad: "Fiscal",
      fechaAlta: "2021-01-10"
    },
    {
      id: 2,
      nombre: "Gestoria Sur",
      provincia: "Sevilla",
      ciudad: "Sevilla",
      numEmpleados: 7,
      especialidad: "Laboral",
      fechaAlta: "2020-03-22"
    }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1
  }
};

const filteredAsesoriasResponse = {
  items: [
    {
      id: 1,
      nombre: "Asesoria Norte",
      provincia: "Madrid",
      ciudad: "Madrid",
      numEmpleados: 12,
      especialidad: "Fiscal",
      fechaAlta: "2021-01-10"
    }
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1
  }
};

const filtersResponse = {
  provincias: ["Madrid", "Sevilla"],
  especialidades: ["Fiscal", "Laboral"]
};

const jsonResponse = (body: unknown) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    })
  );

const createFetchMock = () =>
  vi.fn((input: string | URL | RequestInfo) => {
    const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const url = new URL(requestUrl);

    if (url.pathname.endsWith("/asesorias/filters")) {
      return jsonResponse(filtersResponse);
    }

    if (url.pathname.endsWith("/asesorias")) {
      return url.searchParams.get("search") === "norte"
        ? jsonResponse(filteredAsesoriasResponse)
        : jsonResponse(asesoriasResponse);
    }

    throw new Error(`Unhandled request: ${requestUrl}`);
  });

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false
      }
    }
  });

  return render(
    <MantineProvider defaultColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/asesorias"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>
  );
};

describe("AsesoriasListPage integration", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("renders the list and updates results when the search changes", async () => {
    const fetchMock = createFetchMock();
    globalThis.fetch = fetchMock;

    renderApp();

    expect(await screen.findByRole("heading", { name: "Listado de asesorias" })).toBeInTheDocument();
    expect(await screen.findByText("Asesoria Norte")).toBeInTheDocument();
    expect(screen.getByText("Gestoria Sur")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Buscar"), {
      target: { value: "norte" }
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/asesorias?search=norte&page=1&limit=10")
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("Gestoria Sur")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Asesoria Norte")).toBeInTheDocument();
    expect(screen.getByText("1 asesorias encontradas")).toBeInTheDocument();
  });
});
