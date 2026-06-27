import { Paper, Text, Title } from "@mantine/core";

import classes from "./State.module.css";

type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <Paper className={classes.wrapper}>
      <Title order={3}>{title}</Title>
      <Text c="dimmed" className={classes.message}>
        {message}
      </Text>
    </Paper>
  );
}
