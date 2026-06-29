import { Alert, Badge, Button, Group, Paper, Stack, Text, Textarea } from "@mantine/core";
import { useState } from "react";

import { EmptyState } from "../../components/feedback/EmptyState";
import { useAskSupportQuestion, useSupportDocuments } from "../../hooks/use-api";
import { formatPercent } from "../../utils/format";
import classes from "./SupportAssistedPanel.module.css";

type SupportAssistedPanelProps = {
  asesoriaId: number;
};

export function SupportAssistedPanel({ asesoriaId }: SupportAssistedPanelProps) {
  const [question, setQuestion] = useState("");
  const documentsQuery = useSupportDocuments(asesoriaId, { limit: 5, page: 1 });
  const askMutation = useAskSupportQuestion(asesoriaId);

  const handleAsk = () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    askMutation.mutate({ question: trimmedQuestion });
  };

  return (
    <Stack gap="xl" className={classes.root}>
      <Paper className={classes.askCard}>
        <Stack gap="md">
          <div>
            <Text fw={700} size="lg">
              Soporte asistido
            </Text>
            <Text c="dimmed" size="sm">
              Busca respuestas dentro de los documentos de soporte de esta asesoria. La respuesta siempre cita las fuentes usadas.
            </Text>
          </div>

          <Textarea
            label="Pregunta"
            placeholder="Ejemplo: que se revisa en un traspaso desde otra gestoria?"
            minRows={3}
            value={question}
            onChange={(event) => setQuestion(event.currentTarget.value)}
          />

          <Group justify="space-between" align="center">
            <Button color="teal" onClick={handleAsk} loading={askMutation.isPending}>
              Preguntar
            </Button>
          </Group>

          {askMutation.error ? (
            <Alert color="red" title="No se pudo completar la consulta">
              {askMutation.error.message}
            </Alert>
          ) : null}

          {askMutation.data ? (
            <Paper className={classes.answerCard}>
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text fw={700}>Respuesta</Text>
                  <Badge color={askMutation.data.confidence >= 0.6 ? "teal" : "gray"} variant="light">
                    Confianza {formatPercent(askMutation.data.confidence)}
                  </Badge>
                </Group>

                <Text>{askMutation.data.answer}</Text>

                {askMutation.data.sources.length > 0 ? (
                  <Stack gap="sm">
                    <Text fw={700} size="sm">
                      Fuentes
                    </Text>

                    {askMutation.data.sources.map((source) => (
                      <Paper key={source.docId} className={classes.sourceCard}>
                        <Stack gap="xs">
                          <Group gap="xs">
                            <Badge variant="light" color="teal">
                              {source.tipo}
                            </Badge>
                            <Badge variant="light" color="gray">
                              {source.categoria}
                            </Badge>
                            <Text size="sm" c="dimmed">
                              {source.fecha}
                            </Text>
                          </Group>
                          <Text fw={700}>{source.titulo}</Text>
                          <Text size="sm" c="dimmed">
                            {source.snippet}
                          </Text>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : null}
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      </Paper>

      <Stack gap="md">
        <div>
          <Text fw={700} size="lg">
            Documentos recientes
          </Text>
          <Text c="dimmed" size="sm">
            Ultimos documentos cargados para esta asesoria.
          </Text>
        </div>

        {documentsQuery.isLoading ? (
          <Text c="dimmed">Cargando documentos de soporte...</Text>
        ) : documentsQuery.error ? (
          <Alert color="red" title="No se pudieron cargar los documentos">
            {documentsQuery.error.message}
          </Alert>
        ) : documentsQuery.data && documentsQuery.data.items.length > 0 ? (
          <Stack gap="sm">
            {documentsQuery.data.items.map((document) => (
              <Paper key={document.docId} className={classes.documentCard}>
                <Stack gap="xs">
                  <Group gap="xs">
                    <Badge variant="light" color="teal">
                      {document.tipo}
                    </Badge>
                    <Badge variant="light" color="gray">
                      {document.categoria}
                    </Badge>
                    <Badge variant="light" color="orange">
                      {document.estado}
                    </Badge>
                    <Text size="sm" c="dimmed">
                      {document.fecha}
                    </Text>
                  </Group>
                  <Text fw={700}>{document.titulo}</Text>
                  <Text size="sm" c="dimmed">
                    {document.snippet}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <EmptyState
            title="Sin documentos de soporte"
            message="Todavia no hay documentos cargados para construir esta vista asistida."
          />
        )}
      </Stack>
    </Stack>
  );
}
