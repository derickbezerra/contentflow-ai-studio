import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Terms() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <h1 className="mb-2 text-2xl font-bold text-foreground">Termos de Uso</h1>
        <p className="mb-10 text-sm text-muted-foreground">Última atualização: março de 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">

          <section>
            <h2 className="mb-3 text-base font-semibold">1. Sobre o ContentFlow</h2>
            <p className="text-muted-foreground">
              O ContentFlow é uma plataforma de geração de conteúdo para redes sociais, desenvolvida para profissionais de saúde. Ao utilizar nossos serviços, você concorda com os presentes Termos de Uso. Se não concordar, não utilize a plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">2. Cadastro e Conta</h2>
            <p className="text-muted-foreground">
              Para utilizar o ContentFlow, você deve criar uma conta com informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">3. Uso Permitido</h2>
            <p className="mb-2 text-muted-foreground">Você concorda em utilizar o ContentFlow exclusivamente para fins lícitos e de acordo com estes Termos. É vedado:</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Compartilhar, revender ou sublicenciar o acesso à plataforma</li>
              <li>Utilizar o serviço para gerar conteúdo enganoso, ofensivo ou que viole direitos de terceiros</li>
              <li>Tentar acessar sistemas ou dados além do que lhe foi autorizado</li>
              <li>Realizar engenharia reversa ou copiar funcionalidades da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">4. Conteúdo Gerado pela IA</h2>
            <p className="text-muted-foreground">
              O conteúdo gerado pela inteligência artificial é fornecido como sugestão e ponto de partida. O ContentFlow não garante a precisão, completude ou adequação do conteúdo gerado para fins médicos, nutricionais, odontológicos ou psicológicos específicos. É de responsabilidade do profissional revisar e validar qualquer conteúdo antes de publicá-lo, especialmente no que diz respeito a informações clínicas.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">5. Propriedade Intelectual do Conteúdo</h2>
            <p className="text-muted-foreground">
              O conteúdo gerado a partir das suas ideias e publicado por você é de sua propriedade. O ContentFlow não reivindica direitos sobre o conteúdo que você produz usando a plataforma. A plataforma em si, incluindo seu código, design e tecnologia, é de propriedade exclusiva do ContentFlow.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">6. Planos e Pagamentos</h2>
            <p className="text-muted-foreground">
              O ContentFlow oferece um período de teste gratuito de 7 dias com até 5 gerações de conteúdo. Após esse período, é necessário assinar um dos planos pagos para continuar utilizando o serviço. Os pagamentos são processados pela Asaas e estão sujeitos às condições da plataforma de pagamento. O cancelamento pode ser realizado a qualquer momento diretamente no app, com acesso encerrado imediatamente após a solicitação.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">7. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground">
              O ContentFlow é fornecido "como está", sem garantias de qualquer tipo. Em nenhuma hipótese o ContentFlow será responsável por danos indiretos, incidentais ou consequenciais decorrentes do uso ou impossibilidade de uso do serviço. Nossa responsabilidade total não excederá o valor pago pelo assinante nos últimos 3 meses.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">8. Suspensão e Encerramento</h2>
            <p className="text-muted-foreground">
              O ContentFlow reserva-se o direito de suspender ou encerrar contas que violem estes Termos, sem aviso prévio. O usuário pode encerrar sua conta a qualquer momento entrando em contato pelo e-mail de suporte.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">9. Alterações nos Termos</h2>
            <p className="text-muted-foreground">
              O ContentFlow pode atualizar estes Termos periodicamente. Alterações relevantes serão comunicadas por e-mail ou notificação na plataforma. O uso continuado após as alterações constitui aceite das novas condições.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">10. Lei Aplicável</h2>
            <p className="text-muted-foreground">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de domicílio do usuário para resolução de eventuais conflitos.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">11. Contato</h2>
            <p className="text-muted-foreground">
              Para dúvidas sobre estes Termos, entre em contato pelo e-mail: <a href="mailto:contato@flowcontent.com.br" className="text-primary hover:underline">contato@flowcontent.com.br</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
