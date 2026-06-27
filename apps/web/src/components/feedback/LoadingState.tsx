import { Paper, Skeleton, Stack, Text } from "@mantine/core";

import classes from "./State.module.css";

type LoadingStateProps = {
  title?: string;
  message?: string;
};

export function LoadingState({
  title = "Cargando datos",
  message = "Estamos preparando la informacion de Pulse."
}: LoadingStateProps) {
  return (
    <Paper className={classes.wrapper}>
      <Stack gap="sm">
        <Text fw={700}>{title}</Text>
        <Text c="dimmed" size="sm" className={classes.message}>
          {message}
        </Text>
      </Stack>

      <Skeleton height={110} radius="lg" />
      <Skeleton height={18} radius="md" />
      <Skeleton height={18} width="80%" radius="md" />
      <Skeleton height={260} radius="lg" />
    </Paper>
  );
}
