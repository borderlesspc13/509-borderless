-- Modelos de documento: Relatório Unimed (prorrogação) e Pareceres cirúrgicos.

insert into public.document_templates (id, name, category, body_html, status, created_at, updated_at)
values
  (
    'c1000001-0000-4000-8000-000000000001',
    'Relatório Unimed - 1ª Prorrogação (cód. 999996509)',
    'relatorio',
    $body1$
<h2>Relatório de Atendimento Psicológico - Unimed</h2>
<p><strong>Sessão em Psicologia individual</strong></p>
<p><strong>1ª Prorrogação código 999996509</strong></p>
<p>Psicóloga: [NOME_PROFISSIONAL]<br>CRP: [CONSELHO_PROFISSIONAL]</p>
<p>Paciente: [NOME_PACIENTE]<br>Carteirinha: [CARTEIRINHA]</p>
<p>Data do início do tratamento: [DATA_INICIO_TRATAMENTO]</p>
<p><strong>Objetivo:</strong> Autorização de mais sessões para continuação do tratamento psicológico do(a) paciente acima descrito(a).</p>
<p><strong>Breve evolução:</strong></p>
<p>Paciente iniciou tratamento com a demanda [DESCRICAO_QUADRO], assim faz-se necessário mantê-lo, por hora sem previsão de alta.</p>
<p>Paciente sem previsão de alta.</p>
<p>[NOME_PROFISSIONAL]<br>[CARGO_PROFISSIONAL] [CONSELHO_PROFISSIONAL]<br>Cachoeiro de Itapemirim, [DATA_SESSAO].</p>
$body1$,
    'active',
    '2026-06-22T12:00:00Z',
    '2026-06-22T12:00:00Z'
  ),
  (
    'c1000002-0000-4000-8000-000000000002',
    'Parecer Psicológico - Cirurgia Bariátrica',
    'parecer',
    $body2$
<h2>PARECER PSICOLÓGICO</h2>
<h3>I. IDENTIFICAÇÃO</h3>
<p>Relator: [NOME_PROFISSIONAL] / [CARGO_PROFISSIONAL] [CONSELHO_PROFISSIONAL]</p>
<p>Assunto: Relatório Psicológico para fins de procedimento cirúrgico bariátrica</p>
<p>Nome: [NOME_PACIENTE]<br>Data de Nascimento: [DATA_NASCIMENTO] &nbsp; Idade: [IDADE] anos<br>Sexo: ( ) Masculino &nbsp; ( ) Feminino</p>
<p>Nome do acompanhante: [NOME_ACOMPANHANTE]<br>Parentesco do acompanhante: [PARENTESCO_ACOMPANHANTE]</p>
<h3>II. DESCRIÇÃO DA DEMANDA</h3>
<p>Paciente em acompanhamento psicológico com a finalidade da realização de cirurgia bariátrica. Durante as sessões foi realizada entrevista psicológica e análise do estado mental do(a) paciente.</p>
<p>Foram realizadas [NUMERO_SESSOES] sessões de 30 minutos, onde realizamos entrevistas sobre algumas questões em torno da cirurgia. [NOME_PACIENTE] buscou esclarecimentos sobre o processo do pós-operatório; pontuamos as dúvidas, medos e perspectivas para a realização da cirurgia.</p>
<p>[NOME_PACIENTE] apresenta ausência de psicopatologia grave até o presente momento, já passou por várias tentativas de emagrecer com outros métodos, atualmente fora identificada [DIAGNOSTICO]. Afirma não fazer uso de álcool, drogas ou cigarro. Durante o acompanhamento, demonstra estar bem decidido(a) e deseja solucionar seus problemas de saúde causados pela obesidade, empenhando-se atualmente com acompanhamento nutricional e psicológico.</p>
<h3>III. CONCLUSÃO</h3>
<p>Diante do processo de análise através da escuta clínica e observações comportamentais, foi verificado que [NOME_PACIENTE] já passou por alguns dos processos que antecedem à cirurgia, com uma evolução de autocontrole significativa, estando hoje preparado(a) psicologicamente para a realização da cirurgia bariátrica.</p>
<p>Recomenda-se o acompanhamento psicológico imediato após a cirurgia para fins de manutenção do processo de mudança do(a) paciente.</p>
<p>[DATA_SESSAO], Cachoeiro de Itapemirim – ES.</p>
<p>_______________________________________________<br>[NOME_PROFISSIONAL]<br>[CARGO_PROFISSIONAL] [CONSELHO_PROFISSIONAL]</p>
$body2$,
    'active',
    '2026-06-22T12:00:00Z',
    '2026-06-22T12:00:00Z'
  ),
  (
    'c1000003-0000-4000-8000-000000000003',
    'Parecer Psicológico - Vasectomia',
    'parecer',
    $body3$
<h2>PARECER PSICOLÓGICO</h2>
<h3>1. IDENTIFICAÇÃO</h3>
<p>Relator: [NOME_PROFISSIONAL] / [CARGO_PROFISSIONAL] [CONSELHO_PROFISSIONAL]</p>
<p>Assunto: Relatório Psicológico para fins de procedimento cirúrgico de vasectomia</p>
<p>Nome: [NOME_PACIENTE]<br>Data de Nascimento: [DATA_NASCIMENTO] &nbsp; Idade: [IDADE] anos</p>
<h3>2. DESCRIÇÃO DA DEMANDA</h3>
<p>Paciente em acompanhamento psicológico com a finalidade da realização de cirurgia de vasectomia. Durante as sessões foi realizada entrevista psicológica e análise do estado mental do paciente.</p>
<p>Foram realizadas [NUMERO_SESSOES] sessões de 30 minutos, onde realizamos entrevistas sobre algumas questões em torno da cirurgia. [NOME_PACIENTE] buscou esclarecimentos sobre o processo do pós-operatório; pontuamos as dúvidas, medos e perspectivas para a realização da cirurgia.</p>
<p>O paciente apresenta ausência de psicopatologia grave até o presente momento. Durante o acompanhamento, demonstrou estar bem decidido e deseja realizar o procedimento pois não há planos para mais filhos, pensando também em um processo de pós-operatório mais tranquilo para ele do que para a esposa.</p>
<h3>3. CONCLUSÃO</h3>
<p>Diante do processo de análise através da escuta clínica e observações comportamentais, foi verificado que [NOME_PACIENTE] já tem conhecimento de todos os processos que possam anteceder à cirurgia, demonstra segurança, confiabilidade e determinação. Mediante as observações feitas, o paciente encontra-se preparado psicologicamente para a realização da cirurgia de vasectomia.</p>
<p>Recomenda-se o acompanhamento psicológico imediato após a cirurgia para fins de manutenção do processo de mudança do paciente.</p>
<p>[DATA_SESSAO], Cachoeiro de Itapemirim – ES.</p>
<p>_______________________________________________<br>[NOME_PROFISSIONAL]<br>[CARGO_PROFISSIONAL] [CONSELHO_PROFISSIONAL]</p>
$body3$,
    'active',
    '2026-06-22T12:00:00Z',
    '2026-06-22T12:00:00Z'
  )
on conflict (id) do nothing;
