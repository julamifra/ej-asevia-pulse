import { Alert, Button, Group, Text } from "@mantine/core";

import classes from "./State.module.css";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "No se pudo cargar la informacion",
  message,
  onRetry
}: ErrorStateProps) {
  return (
    <Alert color="red" title={title} radius="lg">
      <div className={classes.message}>
        <Text size="sm">{message}</Text>
        {onRetry ? (
          <Group mt="md">
            <Button size="xs" variant="light" color="red" onClick={onRetry}>
              Reintentar
            </Button>
          </Group>
        ) : null}
      </div>
    </Alert>
  );
}
