# ContentFlow — Roadmap de Produto

> Última atualização: março de 2026
> Assumindo 1 desenvolvedor dedicado ~4h/dia. Produto já em produção.

---

## Fase 1 — Fundação (Semanas 1–6)

Objetivo: corrigir gaps críticos de retenção, observabilidade e ativação antes de escalar.

---

### Semana 1 — Observabilidade e resiliência

| Item | Tipo | Descrição |
|---|---|---|
| **Sentry** | Código | Integrar Sentry no frontend (erros JS) e nos logs das Edge Functions. Sem isso, bugs em produção são invisíveis. |
| **Alertas de custo Anthropic** | Código + Config | Configurar budget alert no painel da Anthropic. Adicionar contador de tokens consumidos no admin. Criar alerta por email se o custo diário ultrapassar threshold definido. Protege contra bugs de loop ou abuso que gerem fatura inesperada. |
| **LLM fallback** | Código | Usar Claude Haiku como fallback automático quando o Sonnet retornar erro 529 (sobrecarga). Elimina o único ponto de falha crítico do produto. |
| **Testes de regressão mínimos — setup** | Código | Configurar Vitest + testes para os fluxos críticos: geração de conteúdo, checkout, webhook Stripe, verificação de plano. Não precisa ser 100% de cobertura — só os caminhos que, se quebrarem, derrubam o produto. Mantido e expandido a cada nova feature nas fases seguintes. |
| **Recovery de pagamento** | Config | Ativar Smart Retries e dunning emails nativos do Stripe. Adicionar email de falha de pagamento via Resend. Configuração, não código. |

---

### Semana 2 — Emails transacionais

| Item | Tipo | Descrição |
|---|---|---|
| **Boas-vindas** | Código | Email disparado na criação de conta. Apresenta o produto e convida à primeira geração. |
| **Trial expirando (D-2)** | Código | Lembrete 2 dias antes do trial encerrar. |
| **Trial expirado** | Código | Email no dia do encerramento com CTA para assinar. |
| **Plano cancelado** | Código | Confirmação de cancelamento + data de acesso até o fim do período pago. |

---

### Semana 3 — Lifecycle emails

| Item | Tipo | Descrição |
|---|---|---|
| **D+3 sem geração** | Código | Usuário criou conta mas não gerou nenhum conteúdo em 3 dias. Email de ativação com exemplo de resultado. |
| **D+7 sem conversão** | Código | Trial ativo há 7 dias sem assinar. Email com prova social e urgência. |
| **Implementação** | Código | Supabase pg_cron + Resend. Sem ferramenta externa de automação por enquanto. |

---

### Semana 4 — Brand profile

| Item | Tipo | Descrição |
|---|---|---|
| **Brand profile por usuário** | Código | Salvar: nome do profissional, especialidade, tom de voz (formal/informal/empático), cores principais, bio resumida. Campo na tela do app e no onboarding. |
| **Integração com geração** | Código | Passar brand profile para o prompt do Claude. O conteúdo gerado passa a usar o nome, tom e contexto do profissional. |

---

### Semana 5 — Onboarding e histórico

| Item | Tipo | Descrição |
|---|---|---|
| **Onboarding orientado a outcome** | Código | Coletar na primeira entrada: objetivo principal (atrair pacientes / construir autoridade / aumentar engajamento), volume desejado de posts por semana. Usar para personalizar sugestões e mensagens. |
| **Paginação no histórico** | Código | A tabela `content` cresce sem limite. Adicionar paginação de 20 itens + filtro por tipo. |

---

### Semana 6 — Analytics, cohort e cancel survey

| Item | Tipo | Descrição |
|---|---|---|
| **Analytics de ativação** | Código | Rastrear: tempo até primeira geração, taxa de conversão trial→pago, gerações por sessão. Adicionar ao painel admin. |
| **Cohort dashboard básico** | Código | No admin: quantos usuários do mês X ainda estão ativos no mês Y. Suficiente para identificar churn patterns. |
| **Cancel survey** | Código | Modal antes de cancelar com pergunta de motivo (preço / não uso / falta de feature / outro). Resultado salvo no banco e visível no admin. |
| **Definição do canal de distribuição — decisão** | Estratégia | Não é código, mas precisa estar documentada nesta fase. Opções: perfil próprio no Instagram por especialidade, parceria com conselhos (CFM, CFN, CFO, CFP), grupos de profissionais de saúde, micro-influenciadores da área. Definir 1–2 canais prioritários para executar na Fase 2. Sem essa decisão, a aquisição depende só de busca orgânica. |

---

## Fase 2 — Crescimento (Semanas 7–16)

Objetivo: aumentar retenção com features de hábito, reduzir CAC com aquisição orgânica, preparar para escala.

---

### Semanas 7–8 — Calendário editorial

| Item | Tipo | Descrição |
|---|---|---|
| **Calendário editorial** | Código | Visualização semanal/mensal de posts planejados. Status: rascunho / gerado / publicado. Integra com o histórico existente. Cria hábito de uso recorrente — maior driver de retenção. |

---

### Semana 9 — Aquisição orgânica

| Item | Tipo | Descrição |
|---|---|---|
| **Páginas de aquisição por vertical** | Código + Conteúdo | Landing pages específicas: /para-medicos, /para-nutricionistas, /para-dentistas, /para-psicologos. SEO-otimizadas com termos de busca de cada especialidade. Quanto antes no ar, mais cedo o Google indexa. |
| **Canal de distribuição — execução** | Estratégia | Iniciar execução do canal definido na Semana 6. Conteúdo do próprio produto como prova (ex: posts gerados pelo ContentFlow publicados no perfil do produto). |
| **Testes de regressão — expansão** | Código | Adicionar cobertura para as features das Semanas 1–8. |

---

### Semanas 10–11 — Memória de marca

| Item | Tipo | Descrição |
|---|---|---|
| **Geração com memória de marca** | Código | Usar brand profile (Fase 1) + últimas 5 gerações do usuário para personalizar output. O Claude passa a "conhecer" o profissional. Aumenta percepção de valor e diferencia do ChatGPT genérico. |

---

### Semana 12 — Templates

| Item | Tipo | Descrição |
|---|---|---|
| **Biblioteca de templates por nicho** | Código | 10–15 templates fixos por especialidade (estruturas de post comprovadas). Usuário escolhe um template como ponto de partida antes de gerar. Reduz fricção para quem não sabe o que escrever. |

---

### Semana 13 — Batch generation

| Item | Tipo | Descrição |
|---|---|---|
| **Batch generation** | Código | Gerar múltiplos formatos a partir de um único tema (carrossel + post + story de uma vez). Validar demanda com dados de uso antes de construir — só avançar se analytics da Fase 1 confirmarem padrão de uso que justifique. |

---

### Semana 14 — Referral

| Item | Tipo | Descrição |
|---|---|---|
| **Referral** | Código | Link único por usuário. Quem indica ganha gerações extras ou desconto no mês seguinte. Primeiro mecanismo de crescimento viral do produto. |

---

### Semanas 15–16 — Benchmark e revisão

| Item | Tipo | Descrição |
|---|---|---|
| **Benchmark por especialidade** | Código | Definir métrica antes de construir (ex: média de gerações por especialidade, temas mais usados, formatos mais populares). Exibir para o usuário como referência ("profissionais de nutrição geram em média X posts/mês"). |
| **Revisão de acquisition pages** | Conteúdo | Atualizar com dados reais de uso e depoimentos coletados até aqui. |
| **Testes de regressão — expansão** | Código | Cobertura completa das features da Fase 2. |

---

## Fase 3 — Escala (A partir do mês 5)

> Escopo revisado ao final da Fase 2 com dados reais de uso. Os itens abaixo são condicionais ao que os dados mostrarem.

| Item | Condição para construir |
|---|---|
| **Multi-workspace** | Evidência de uso por clínicas ou agências (múltiplos profissionais sob uma conta) |
| **Colaboração** | Validado com usuários reais que multi-workspace é demandado |
| **RBAC admin** | Multi-workspace ativo |
| **2FA** | Base de usuários pagantes justifica o investimento em segurança adicional |
| **Arquivamento e otimização de storage** | Tabela `content` atingindo limite do plano Supabase |
| **Observabilidade madura** | Volume de erros e transações justifica ferramentas além do Sentry |
| **Suporte self-service** | Volume de tickets de suporte inviabiliza atendimento manual |
| **Automações de CX** | Lifecycle emails da Fase 1 insuficientes para a base de usuários |
| **Engine de personalização sofisticada** | Memória de marca da Fase 2 validada e com demanda por mais profundidade |
| **Canal de distribuição dominante** | Um canal da Fase 2 mostrou CAC e LTV positivos — dobrar a aposta nele |

---

## Itens transversais (todas as fases)

| Item | Descrição |
|---|---|
| **Testes de regressão** | Expandido a cada feature entregue. Meta: cobertura dos fluxos críticos ao final de cada fase. |
| **Alertas de custo Anthropic** | Threshold revisado mensalmente conforme crescimento da base. |
| **Canal de distribuição** | Decisão na Semana 6, execução contínua a partir da Semana 9. Revisado mensalmente. |

---

## Resumo por fase

| Fase | Duração | Foco principal |
|---|---|---|
| Fase 1 | 6 semanas | Observabilidade, retenção, ativação |
| Fase 2 | 10 semanas | Hábito, aquisição orgânica, crescimento |
| Fase 3 | A definir | Escala, multi-tenant, distribuição dominante |
