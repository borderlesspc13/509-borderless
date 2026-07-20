-- Modelos TO: Relatório de Avaliação/Evolução e Anamnese (Biblioteca de Modelos / Relatórios).

insert into public.document_templates (id, name, category, body_html, status, created_at, updated_at)
values
  (
    'c1000006-0000-4000-8000-000000000006',
    'Relatório Terapia Ocupacional — Avaliação/Evolução/Reavaliação',
    'relatorio',
    $body_to_relatorio$
<h2>RELATÓRIO DE AVALIAÇÃO/EVOLUÇÃO/REAVALIAÇÃO</h2>
<p><strong>TERAPIA OCUPACIONAL</strong></p>

<h3>I — IDENTIFICAÇÃO</h3>
<p>
Nome: [NOME_PACIENTE]<br>
Data de nascimento: [DATA_NASCIMENTO] &nbsp; Idade (anos, meses e dias): [IDADE]<br>
Responsáveis: [RESPONSAVEL]<br>
Profissional: [NOME_PROFISSIONAL]<br>
Especialidade: Terapeuta Ocupacional<br>
Registro: [CONSELHO_PROFISSIONAL]<br>
Solicitante: [SOLICITANTE]
</p>

<h3>II — DESCRIÇÃO DA DEMANDA</h3>
<p>
O presente relatório refere-se à avaliação do setor de Terapia Ocupacional de [INSTITUICAO] e tem o objetivo de descrever e analisar os desafios funcionais e sensório-motores do aprendiz, que foi encaminhado ao setor de Terapia Ocupacional para acompanhamento especializado devido a queixas [QUEIXA_PRINCIPAL]. Os atendimentos terapêuticos ocupacionais com a profissional por este relatório iniciaram em [DATA_INICIO]. Atualmente ocorrem com a frequência [FREQUENCIA_SESSOES] por semana[FUNDAMENTACAO_ABA].
</p>
<p>
Este documento detalha o processo de [TIPO_RELATORIO] realizado até a presente data no ambiente clínico por meio de observações clínicas não estruturadas, além da coleta de dados em anamnese detalhada com os responsáveis, escuta parental e aplicação de instrumento padronizado [INSTRUMENTO_UTILIZADO], visando mensurar [OBJETIVO_INSTRUMENTO]. Os resultados colhidos através destes procedimentos constam nos tópicos a seguir.
</p>

<h3>III — AVALIAÇÃO — Inventário de Avaliação Pediátrica de Incapacidade (PEDI)</h3>
<p>
A partir da aplicação do Inventário de Avaliação Pediátrica de Incapacidade (PEDI), segue-se a análise dos dados perante as respostas dos cuidadores em relação aos itens avaliados do protocolo. Para ser considerado como desenvolvimento dentro do esperado, a criança deve apresentar os itens esperados para sua idade cronológica com total independência.
</p>
<p>
Ao analisar o resultado obtido nos escores normativos (até 7 anos), observamos os pontos relacionados ao desempenho comparado com o esperado de crianças com desenvolvimento típico, dentro da mesma faixa etária. Considera-se desempenho funcional dentro do esperado (escore normativo entre 30 e 70); atraso funcional (abaixo de 30); e desempenho funcional acima da média (acima de 70).
</p>
<p>
Ao avaliarmos o score contínuo, observamos o perfil de desempenho da criança em um contínuo de dificuldade crescente, sem levar em consideração a faixa etária. Ele permite a comparação entre as diferentes áreas de função, entre repertório de habilidades e nível de independência (assistência do cuidador). O score contínuo é utilizado para o preenchimento dos mapas de itens apresentados neste relatório.
</p>
<p><em>*Informar a idade em anos, meses e dias na data da aplicação do PEDI.</em></p>
<p><strong>Quadro 1. Pontuação Total</strong></p>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
  <thead>
    <tr>
      <th>Área</th>
      <th>Escore Bruto</th>
      <th>Escore Normativo</th>
      <th>Escore Contínuo</th>
    </tr>
  </thead>
  <tbody>
    <tr><td colspan="4"><strong>Habilidades Funcionais</strong></td></tr>
    <tr><td>Autocuidado</td><td>[PEDI_AC_BRUTO]</td><td>[PEDI_AC_NORMATIVO]</td><td>[PEDI_AC_CONTINUO]</td></tr>
    <tr><td>Mobilidade</td><td>[PEDI_MOB_BRUTO]</td><td>[PEDI_MOB_NORMATIVO]</td><td>[PEDI_MOB_CONTINUO]</td></tr>
    <tr><td>Função Social</td><td>[PEDI_FS_BRUTO]</td><td>[PEDI_FS_NORMATIVO]</td><td>[PEDI_FS_CONTINUO]</td></tr>
    <tr><td colspan="4"><strong>Assistência do cuidador</strong></td></tr>
    <tr><td>Autocuidado</td><td>[PEDI_ASC_AC_BRUTO]</td><td>[PEDI_ASC_AC_NORMATIVO]</td><td>[PEDI_ASC_AC_CONTINUO]</td></tr>
    <tr><td>Mobilidade</td><td>[PEDI_ASC_MOB_BRUTO]</td><td>[PEDI_ASC_MOB_NORMATIVO]</td><td>[PEDI_ASC_MOB_CONTINUO]</td></tr>
    <tr><td>Função Social</td><td>[PEDI_ASC_FS_BRUTO]</td><td>[PEDI_ASC_FS_NORMATIVO]</td><td>[PEDI_ASC_FS_CONTINUO]</td></tr>
  </tbody>
</table>
<p><strong>Mapas de itens de habilidades funcionais</strong></p>
<p>
Nos quadros abaixo seguem os resultados das seções de habilidades funcionais. Os itens destacados em verde referem-se às atividades que a criança realiza; em vermelho, às que não realiza, mas possui habilidade para realizar; em amarelo, às que não realiza, mas estão dentro do esperado para a faixa de desenvolvimento.
</p>
<p><strong>Quadro 2. Mapa de Itens: Habilidades Funcionais — Autocuidado</strong></p>
<p>[MAPA_ITENS_AUTOCUIDADO]</p>
<p>Na área de autocuidado (Quadro 2), [NOME_PACIENTE] [ANALISE_AUTOCUIDADO]</p>
<p><strong>Quadro 3. Habilidades Funcionais — Mobilidade</strong></p>
<p>[MAPA_ITENS_MOBILIDADE]</p>
<p>Na área de Mobilidade (Quadro 3), [NOME_PACIENTE] [ANALISE_MOBILIDADE]</p>
<p><strong>Quadro 4. Mapa de Itens: Habilidades Funcionais — Função Social</strong></p>
<p>[MAPA_ITENS_FUNCAO_SOCIAL]</p>
<p>Na área de Função Social (Quadro 4), [NOME_PACIENTE] [ANALISE_FUNCAO_SOCIAL]</p>

<h3>III — AVALIAÇÃO — Perfil Sensorial — Questionário do Cuidador</h3>
<p>
Foi aplicado o Questionário do Perfil Sensorial II (Criança de 3 anos e 0 meses a 14 anos e 11 meses) — Cuidador. O questionário foi respondido pela cuidadora do aprendiz. Insta frisar que a terapeuta não interferiu nas respostas, apenas orientou no caso das dúvidas surgidas.
</p>
<p>
O Perfil Sensorial II de Dunn (2014) é um instrumento padronizado composto por 86 itens divididos em seções (processamento auditivo, visual, tato, movimentos, posição do corpo, sensibilidade oral; conduta, respostas socioemocionais e de atenção associadas ao processamento sensorial). Por meio dele, compreende-se a associação entre a intensidade sensorial de um estímulo e as respostas a ele.
</p>
<p>
No setor de terapia ocupacional, ao interpretar as pontuações, realiza-se análise qualitativa relacionando o impacto no desempenho das atividades diárias e papéis ocupacionais. Segue tabela com as pontuações por quadrante e seções do Perfil Sensorial de [NOME_PACIENTE]:
</p>
<p>[QUADRO_PERFIL_SENSORIAL]</p>
<p>[RACIOCINIO_CLINICO_SENSORIAL]</p>

<h3>IV — OBSERVAÇÕES CLÍNICAS</h3>
<p>
Em observação realizada durante os atendimentos até o momento, como observado no resultado de [INSTRUMENTOS_CITADOS], as demandas principais estão relacionadas a atividades de vida diária em [DEMANDAS_AVD].
</p>
<p>Durante atendimento, [NOME_PACIENTE] está em construção de [CONSTRUCAO_HABILIDADES].</p>
<p>Observou-se que [NOME_PACIENTE] possui fatores que impactam diretamente na qualidade da realização de suas atividades de vida diária, como [FATORES_IMPACTO].</p>
<p>Nos aspectos motores: [ASPECTOS_MOTORES]</p>
<p>Observados déficits relacionados a [DEFICITS_OBSERVADOS]</p>
<p>Nos aspectos sensoriais, observou-se que [NOME_PACIENTE] apresenta [ASPECTOS_SENSORIAIS], o que sugere quadro de [HIPOTESE_SENSORIAL].</p>
<p>[AVANCOS_INTERVENCAO]</p>

<h3>V — PROPOSTA DE INTERVENÇÃO</h3>
<p>
Com base na avaliação no setor de Terapia Ocupacional, os objetivos iniciais do tratamento serão discutidos, traçando as prioridades, queixas e demandas da família, além de interesses do aprendiz. As informações contidas neste relatório referem-se ao que foi observado durante o processo avaliativo. Sendo de extrema importância a realização de avaliações periódicas para acompanhar o desenvolvimento, podendo sofrer alterações conforme novas demandas. Destarte, foi elaborado um plano de intervenção terapêutica ocupacional baseado nos seguintes objetivos:
</p>
<p>[OBJETIVOS_INTERVENCAO]</p>
<p>
Para que esses critérios sejam alcançados, dependerá das barreiras de aprendizado, da presença ou não de comportamentos interferentes, aspectos fisiológicos, cognitivos, motores, envolvimento familiar, dentre outros.
</p>

<h3>VI — CONCLUSÃO</h3>
<p>
A finalidade deste relatório foi apresentar a avaliação de [NOME_PACIENTE] no setor de Terapia Ocupacional realizada pela Terapeuta Ocupacional [NOME_PROFISSIONAL]. O aprendiz demonstra potencial para aquisição, aprimoramento e estimulação de novas habilidades e competências relacionadas às intervenções terapêuticas ocupacionais. Dessa forma, visando a ampliação do repertório funcional, faz-se necessário [CONDUTA_CONCLUSAO].
</p>
<p>À disposição para maiores informações que se fizerem necessárias.</p>
<p>Cachoeiro de Itapemirim, ES, [DATA_SESSAO].</p>
<p>_______________________________________________<br>
[NOME_PROFISSIONAL] — Terapeuta Ocupacional<br>
[CONSELHO_PROFISSIONAL]</p>
$body_to_relatorio$,
    'active',
    now(),
    now()
  ),
  (
    'c1000007-0000-4000-8000-000000000007',
    'Anamnese Terapia Ocupacional 2026',
    'anamnese',
    $body_to_anamnese$
<h2>ANAMNESE — TERAPIA OCUPACIONAL</h2>
<p>
Data da Anamnese: [DATA_SESSAO]<br>
Responsável pela entrevista: [NOME_PROFISSIONAL]<br>
Terapeuta Ocupacional — [CONSELHO_PROFISSIONAL]
</p>

<h3>IDENTIFICAÇÃO</h3>
<p>
Nome da criança: [NOME_PACIENTE]<br>
Data de nascimento: [DATA_NASCIMENTO] &nbsp; Idade (meses e dias na data da anamnese): [IDADE]<br>
Sexo: [SEXO]<br>
Nome da genitora: [NOME_GENITORA]<br>
Nome do genitor: [NOME_GENITOR]<br>
Responsável: [RESPONSAVEL]<br>
Estado civil: [ESTADO_CIVIL]<br>
Telefone (1): [TELEFONE_1]<br>
Telefone (2): [TELEFONE_2]<br>
Endereço: [ENDERECO]<br>
E-mail: [EMAIL]
</p>

<h3>DIAGNÓSTICO E QUEIXA PRINCIPAL</h3>
<p>[DIAGNOSTICO]</p>
<p>[QUEIXA_PRINCIPAL]</p>

<h3>MEDICAMENTOS QUE FAZ USO</h3>
<p>[MEDICAMENTOS]</p>

<h3>HISTÓRIA PREGRESSA (GESTACÃO/PARTO/PUERPÉRIO)</h3>
<p>[HISTORIA_PREGRESSA]</p>

<h3>SAÚDE</h3>
<p>
Idade gestacional: [IDADE_GESTACIONAL]<br>
Peso: [PESO_NASCIMENTO]<br>
Apgar: [APGAR]<br>
Icterícia: [ICTERICIA]<br>
Alta junto da mãe: [ALTA_COM_MAE]<br>
Apresenta alguma alergia (alimentar, medicamento, etc.): [ALERGIAS]
</p>

<h3>HISTÓRICO DO DESENVOLVIMENTO</h3>
<p><em>*Cartilha da criança</em></p>
<p>
( ) Controle Cervical &nbsp; ( ) Rolou &nbsp; ( ) Arrastou &nbsp; ( ) Segurou objetos<br>
( ) Sentou — controle de tronco sem apoio &nbsp; ( ) Engatinhou &nbsp; ( ) Andou sem apoio<br>
( ) Explorar objetos com a boca &nbsp; ( ) Falou
</p>
<p>Do nascimento até o momento atual, há dificuldades relacionadas ao padrão do sono? [DIFICULDADES_SONO]</p>
<p>( ) Bebê agitado &nbsp; ( ) Chorava muito &nbsp; ( ) Excessivamente passivo</p>
<p><strong>Introdução alimentar</strong><br>
Idade: [IDADE_INTRO_ALIMENTAR]<br>
Como a família ofertava os alimentos (inteiros, batidos, amassados): [OFERTA_ALIMENTOS]<br>
Engasgava/engasga com alimentos ou líquidos: [ENGASGO]
</p>
<p>Retirada da fralda / Desfralde: [DESFRALDE]</p>

<h3>ALTERAÇÃO NOS COMPONENTES DO DESEMPENHO MÚSCULO-ESQUELÉTICOS</h3>
<p>
( ) Força &nbsp; ( ) Controle postural &nbsp; ( ) Tônus muscular &nbsp; ( ) Alinhamento postural<br>
( ) ADM &nbsp; ( ) Controle motor / Praxia<br>
( ) Escorrega da cadeira ou se debruça sobre a mesa ou chão quando sentado
</p>
<p>[OBS_MUSCULO_ESQUELETICO]</p>

<h3>COMPONENTES DE DESEMPENHO MOTORES</h3>
<p>
( ) Trocar objeto de mão &nbsp; ( ) Arremessa bola ou objetos &nbsp; ( ) Pega e solta ativamente objetos<br>
( ) Integração bilateral &nbsp; ( ) Integração visomotora (escrever, desenhar, pegar bola, amarrar sapato)<br>
( ) Coordenação motora fina / destreza &nbsp; ( ) Coordenação ampla &nbsp; ( ) Planejamento motor
</p>
<p>Dominância: [DOMINANCIA]</p>

<h3>ALTERAÇÃO NOS COMPONENTES DO DESEMPENHO COGNITIVO E SOCIAL</h3>
<p>
( ) Planejamento e organização &nbsp; ( ) Linguagem &nbsp; ( ) Atenção e concentração<br>
( ) Orientação temporal e espacial &nbsp; ( ) Reconhecimento &nbsp; ( ) Início e término da atividade<br>
( ) Memória &nbsp; ( ) Sequenciamento &nbsp; ( ) Resolução de problemas<br>
( ) Aprendizado &nbsp; ( ) Conduta social &nbsp; ( ) Capacidade para lidar com fatos<br>
( ) Autoexpressão &nbsp; ( ) Valores &nbsp; ( ) Interesses adequados para a idade
</p>
<p>[OBS_COGNITIVO_SOCIAL]</p>

<h3>ESCOLA</h3>
<p>
Nome da escola: [NOME_ESCOLA]<br>
Série: [SERIE]<br>
Contraturno: [CONTRATURNO]<br>
Queixas: [QUEIXAS_ESCOLA]<br>
Possui atendente terapêutico ou cuidador(a): [ATENDENTE_TERAPEUTICO]<br>
Material adaptado: [MATERIAL_ADAPTADO]
</p>

<h3>REPERTÓRIOS</h3>
<p>
Orientação temporal: [REP_ORIENTACAO_TEMPORAL]<br>
Reconhecimento de cores: [REP_CORES]<br>
Reconhecimento de números: [REP_NUMEROS]<br>
Reconhecimento de letras: [REP_LETRAS]<br>
Posiciona a tesoura adequadamente e recorta com destreza esperada para a idade: [REP_TESOURA]<br>
Pinta dentro dos limites da imagem: [REP_PINTURA]<br>
Preensão no lápis: [REP_PREENSAO]<br>
Utilização de borracha e apontador: [REP_BORRACHA]<br>
Sabe montar quebra-cabeças e fazer jogos de encaixe e construções: [REP_QUEBRA_CABECA]<br>
Reconhecimento de nomes — mãe, pai, irmãos: [REP_NOMES_FAMILIA]<br>
Próprio nome: [REP_PROPRIO_NOME]<br>
Escreve: [REP_ESCREVE]
</p>

<h3>COMPREENSÃO</h3>
<p>( ) Boa &nbsp; ( ) Prejudicada &nbsp; — [OBS_COMPREENSAO]</p>

<h3>COMPORTAMENTO</h3>
<p>( ) Agressivo &nbsp; ( ) Passivo &nbsp; ( ) Indiferente às situações</p>
<p>O que fazem: [CONDUTA_FAMILIA]</p>

<h3>ATIVIDADES DE VIDA DIÁRIA</h3>
<p><strong>Higiene:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Controle de esfíncter &nbsp; ( ) Pede para ir ao banheiro &nbsp; ( ) Senta-se ao vaso<br>
( ) Avisa quando molhado &nbsp; ( ) Utiliza papel higiênico &nbsp; ( ) Incomoda-se quando sujo<br>
( ) Lava e enxuga o rosto &nbsp; ( ) Lava as mãos com água e sabão &nbsp; ( ) Seca as mãos
</p>
<p><strong>Banho:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Coopera durante o banho &nbsp; ( ) Ensaboar &nbsp; ( ) Lavar cabelo<br>
( ) Reconhece as partes &nbsp; ( ) Postura durante o banho &nbsp; ( ) Secar
</p>
<p><strong>Higiene bucal:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Segura escova &nbsp; ( ) Coloca creme dental &nbsp; ( ) Gradua força corretamente<br>
( ) Abre e fecha pasta &nbsp; ( ) Escova os dentes &nbsp; ( ) Morde as cerdas<br>
( ) Enxaguar a boca &nbsp; ( ) Cospe &nbsp; ( ) Incomoda-se excessivamente / resiste
</p>
<p><strong>Pentear cabelo:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Leva pente/escova até o cabelo &nbsp; ( ) Desembaraça &nbsp; ( ) Amarra<br>
( ) Resistência em pentear cabelos &nbsp; ( ) Resistência em cortar cabelos
</p>
<p><strong>Vestuário:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Veste-se sozinho &nbsp; ( ) Despe-se sozinho &nbsp; ( ) Ajusta roupa no corpo &nbsp; ( ) Coopera<br>
( ) Reconhece pé correto &nbsp; ( ) Prepara e amarra cadarço &nbsp; ( ) Calça meia &nbsp; ( ) Retira meia<br>
( ) Incomoda-se com etiqueta &nbsp; ( ) Recusa certos tipos de tecidos
</p>
<p><strong>Alimentação:</strong> Dependente ( ) &nbsp; Independente ( ) &nbsp; Semi-dependente ( )</p>
<p>
( ) Come sozinho &nbsp; ( ) Reconhece os alimentos &nbsp; ( ) Utiliza colher &nbsp; ( ) Utiliza garfo e faca<br>
( ) Serve a própria comida
</p>
<p>
Fica muito incomodado quando fica sujo: [INCOMODO_SUJO]<br>
Rejeita muitos tipos de alimentos ou exclui grupos alimentares: [REJEICAO_ALIMENTAR]<br>
Aprendeu a utilizar talheres desde muito cedo: [TALHERES_CEDO]<br>
Aceita comer os alimentos com as mãos: [COME_COM_MAOS]<br>
Local da refeição: [LOCAL_REFEICAO]<br>
Levanta durante a refeição: [LEVANTA_REFEICAO]
</p>

<h3>ROTINA</h3>
<p>
Qual a rotina da criança na maioria dos dias:<br>
Acordar: [ROTINA_ACORDAR]<br>
Hora do café da manhã: [ROTINA_CAFE]<br>
Horário da escola: [ROTINA_ESCOLA]<br>
Horário das refeições: [ROTINA_REFEICOES]<br>
Horário da soneca: [ROTINA_SONECA]<br>
Brincar / TV: [ROTINA_BRINCAR]<br>
Jantar: [ROTINA_JANTAR]<br>
Sono: [ROTINA_SONO]<br>
Tempo diário em telas: [TEMPO_TELAS]
</p>

<h3>SONO</h3>
<p>[OBS_SONO]</p>

<h3>BRINCAR</h3>
<p>[OBS_BRINCAR]</p>

<h3>OBJETIVOS E EXPECTATIVAS DA FAMÍLIA</h3>
<p>[OBJETIVOS_FAMILIA]</p>

<h3>INSTRUMENTOS PADRONIZADOS SUGERIDOS</h3>
<p>[INSTRUMENTOS_SUGERIDOS]</p>

<p>_______________________________________________<br>
[NOME_PROFISSIONAL]<br>
Terapeuta Ocupacional<br>
[CONSELHO_PROFISSIONAL]</p>
$body_to_anamnese$,
    'active',
    now(),
    now()
  )
on conflict (id) do nothing;
