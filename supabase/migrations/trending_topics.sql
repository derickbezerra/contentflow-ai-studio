-- Tabela de temas em alta por especialidade (cache diário)
CREATE TABLE IF NOT EXISTS trending_topics (
  specialty text PRIMARY KEY,
  topics jsonb NOT NULL DEFAULT '[]',
  generated_at timestamptz DEFAULT now()
);

-- Apenas service_role pode escrever; leitura autenticada permitida
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read trending topics"
  ON trending_topics FOR SELECT
  TO authenticated
  USING (true);
