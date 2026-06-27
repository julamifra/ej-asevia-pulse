import { Button, Group } from "@mantine/core";
import { Link } from "react-router-dom";

import { EmptyState } from "../../components/feedback/EmptyState";

export function NotFoundPage() {
  return (
    <>
      <EmptyState
        title="Pagina no encontrada"
        message="La ruta solicitada no existe en esta fase de Pulse. Puedes volver al dashboard o consultar el listado de asesorias."
      />
      <Group mt="md">
        <Button component={Link} to="/" color="teal">
          Ir al dashboard
        </Button>
        <Button component={Link} to="/asesorias" variant="light" color="teal">
          Ver asesorias
        </Button>
      </Group>
    </>
  );
}
