import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <h1 className="mb-2 text-2xl font-bold text-foreground">Política de Privacidade</h1>
        <p className="mb-10 text-sm text-muted-foreground">Última atualização: março de 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">

          <section>
            <h2 className="mb-3 text-base font-semibold">1. Quem somos</h2>
            <p className="text-muted-foreground">
              O ContentFlow é uma plataforma de geração de conteúdo para profissionais de saúde. Esta Política de Privacidade explica como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">2. Dados que coletamos</h2>
            <p className="mb-2 text-muted-foreground">Coletamos apenas os dados necessários para o funcionamento do serviço:</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li><strong className="text-foreground">Dados de cadastro:</strong> nome, e-mail e senha (ou dados fornecidos via login com Google)</li>
              <li><strong className="text-foreground">Dados de uso:</strong> especialidade selecionada, tópicos gerados, contagem de gerações e data de reset</li>
              <li><strong className="text-foreground">Dados de pagamento:</strong> processados pela Stripe — o ContentFlow não armazena dados de cartão</li>
              <li><strong className="text-foreground">Dados técnicos:</strong> endereço IP e logs de acesso, para segurança e prevenção de fraudes</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">3. Como usamos seus dados</h2>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Prestar e melhorar os serviços do ContentFlow</li>
              <li>Gerenciar sua conta, plano e cobranças</li>
              <li>Enviar comunicações relacionadas ao serviço (atualizações, cobranças, suporte)</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              Não utilizamos seus dados para fins de marketing sem seu consentimento explícito, nem vendemos ou compartilhamos dados com terceiros para fins comerciais.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">4. Compartilhamento de dados</h2>
            <p className="mb-2 text-muted-foreground">Seus dados podem ser compartilhados apenas com:</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li><strong className="text-foreground">Supabase:</strong> infraestrutura de banco de dados e autenticação</li>
              <li><strong className="text-foreground">Stripe:</strong> processamento de pagamentos</li>
              <li><strong className="text-foreground">Anthropic:</strong> os tópicos que você digita são enviados à API de IA para geração de conteúdo. Não enviamos dados pessoais identificáveis além do texto inserido</li>
              <li><strong className="text-foreground">Autoridades competentes:</strong> quando exigido por lei</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">5. Retenção de dados</h2>
            <p className="text-muted-foreground">
              Mantemos seus dados enquanto sua conta estiver ativa. Após o encerramento da conta, os dados pessoais são excluídos ou anonimizados em até 30 dias, salvo obrigação legal de retenção.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">6. Seus direitos (LGPD)</h2>
            <p className="mb-2 text-muted-foreground">Como titular dos dados, você tem direito a:</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar os dados que temos sobre você</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos seus dados para outro serviço</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              Para exercer seus direitos, entre em contato pelo e-mail: <a href="mailto:contato@flowcontent.com.br" className="text-primary hover:underline">contato@flowcontent.com.br</a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">7. Segurança</h2>
            <p className="text-muted-foreground">
              Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia em trânsito (HTTPS), autenticação segura e controle de acesso por perfil.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">8. Cookies</h2>
            <p className="text-muted-foreground">
              Utilizamos cookies estritamente necessários para manter sua sessão autenticada. Não utilizamos cookies de rastreamento ou publicidade de terceiros.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">9. Alterações nesta Política</h2>
            <p className="text-muted-foreground">
              Podemos atualizar esta Política periodicamente. Alterações relevantes serão comunicadas por e-mail ou notificação na plataforma. O uso continuado após as alterações constitui aceite das novas condições.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">10. Contato e DPO</h2>
            <p className="text-muted-foreground">
              Para dúvidas, solicitações ou reclamações relacionadas à privacidade, entre em contato pelo e-mail: <a href="mailto:contato@flowcontent.com.br" className="text-primary hover:underline">contato@flowcontent.com.br</a>. Você também pode registrar uma reclamação junto à Autoridade Nacional de Proteção de Dados (ANPD) em <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.gov.br/anpd</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
