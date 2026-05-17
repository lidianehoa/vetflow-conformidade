// Hash de autenticidade (função utilitária)
export const gerarHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
};

export const TCLE_MODELOS = [
  {
    id: "cirurgia_eletiva",
    titulo: "TCLE — Procedimento Cirúrgico Eletivo",
    categoria: "Cirurgia",
    conteudo: `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)
PROCEDIMENTO CIRÚRGICO ELETIVO VETERINÁRIO

Smart ID de Prontuário: {{SMART_ID}}
Data de Emissão: {{DATA_ATUAL}} | {{HORA_ATUAL}}
Clínica: {{NOME_CLINICA}} | CNPJ: {{CNPJ}}

IDENTIFICAÇÃO DO PACIENTE:
Animal: {{NOME_ANIMAL}}
Espécie / Raça / Idade: {{ESPECIE_RACA_IDADE}}
Responsável pelo Animal: {{RESPONSAVEL}} | CPF/RG: {{CPF_RESPONSAVEL}}

DECLARAÇÃO DE CONSENTIMENTO:

Eu, {{RESPONSAVEL}}, na condição de Responsável pelo Animal acima identificado, declaro ter sido informado(a) de forma clara, objetiva e em linguagem acessível sobre as seguintes condições do procedimento proposto:

1. PROCEDIMENTO: A equipe médico-veterinária propôs a realização de procedimento cirúrgico eletivo, cujas indicações clínicas, benefícios esperados, técnica empregada e tempo estimado de recuperação foram devidamente explicados.

2. RISCOS ANESTÉSICOS E CIRÚRGICOS: Compreendo que todo procedimento implicado com anestesia e ato cirúrgico envolve riscos inerentes que incluem, mas não se limitam a: reações adversas a fármacos, complicações cardiovasculares e respiratórias, deiscência de sutura, infecção de sítio cirúrgico e, em casos extremos, óbito do paciente.

3. ALTERNATIVAS: Fui informado(a) sobre as alternativas existentes ao procedimento proposto e, livre de qualquer coação, optei pelo procedimento cirúrgico.

4. DIREITO DE RECUSA: Tenho ciência de que posso, a qualquer momento e sem penalidade, revogar o presente consentimento, responsabilizando-me pelas consequências médico-veterinárias de tal decisão.

5. INTERNAÇÃO E PÓS-OPERATÓRIO: Estou ciente das instruções de cuidados pós-operatórios e comprometo-me a cumpri-las, bem como a trazer o animal para as revisões agendadas.

6. AUTORIZAÇÃO FINANCEIRA: Estou ciente e concordo com os valores dos serviços informados previamente.

Desta forma, CONSINTO livremente com a realização do procedimento proposto.

Local e Data: {{NOME_CLINICA}}, {{DATA_ATUAL}}

_______________________________________________
{{RESPONSAVEL}}
Responsável pelo Animal — CPF/RG: {{CPF_RESPONSAVEL}}

_______________________________________________
{{RT_NOME}} | CRMV: {{RT_CRMV}}
Médico(a) Veterinário(a) Responsável Técnico(a)

HASH DE AUTENTICIDADE VERTOS: {{HASH}}
Ref.: Res. CFMV 1653/2025 | Smart ID: {{SMART_ID}}`
  },
  {
    id: "anestesia_geral",
    titulo: "TCLE — Anestesia Geral",
    categoria: "Anestesia",
    conteudo: `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)
PROCEDIMENTO ANESTÉSICO VETERINÁRIO

Smart ID de Prontuário: {{SMART_ID}}
Data de Emissão: {{DATA_ATUAL}} | {{HORA_ATUAL}}
Clínica: {{NOME_CLINICA}} | CNPJ: {{CNPJ}}

IDENTIFICAÇÃO DO PACIENTE:
Animal: {{NOME_ANIMAL}}
Espécie / Raça / Idade: {{ESPECIE_RACA_IDADE}}
Responsável pelo Animal: {{RESPONSAVEL}} | CPF/RG: {{CPF_RESPONSAVEL}}

DECLARAÇÃO DE CONSENTIMENTO ANESTÉSICO:

Eu, {{RESPONSAVEL}}, declaro ter recebido orientação completa sobre o protocolo anestésico indicado para meu animal, incluindo:

1. PROTOCOLO ANESTÉSICO: Foram explicados os medicamentos a serem utilizados, suas ações e possíveis efeitos adversos.

2. MONITORAÇÃO: Durante todo o procedimento meu animal será monitorado por equipamentos (oxímetro, ECG, capnógrafo) e por profissional habilitado.

3. RISCOS: Declaro estar ciente de que, mesmo em animais saudáveis, a anestesia geral apresenta riscos potenciais, incluindo reações alérgicas, hipotensão, hipotermia, despertar prolongado e, raramente, óbito.

4. JEJUM: Fui orientado(a) sobre o período de jejum alimentar e hídrico necessário e garanto que o animal foi mantido em jejum conforme protocolo.

5. HISTÓRICO CLÍNICO: Informei toda a história clínica relevante do animal, incluindo uso prévio de medicamentos, condições crônicas e reações adversas conhecidas.

CONSINTO com a realização do procedimento anestésico descrito.

Local e Data: {{NOME_CLINICA}}, {{DATA_ATUAL}}

_______________________________________________
{{RESPONSAVEL}} — CPF/RG: {{CPF_RESPONSAVEL}}
Responsável pelo Animal

_______________________________________________
{{RT_NOME}} | CRMV: {{RT_CRMV}}
Médico(a) Veterinário(a) / Anestesista Responsável

HASH: {{HASH}} | Smart ID: {{SMART_ID}} | Ref.: Res. CFMV 1653/2025`
  },
  {
    id: "internacao",
    titulo: "TCLE — Internação Hospitalar",
    categoria: "Internação",
    conteudo: `AUTORIZAÇÃO DE INTERNAÇÃO HOSPITALAR VETERINÁRIA

Smart ID de Prontuário: {{SMART_ID}}
Data de Emissão: {{DATA_ATUAL}} | {{HORA_ATUAL}}
Clínica: {{NOME_CLINICA}} | CNPJ: {{CNPJ}}

IDENTIFICAÇÃO DO PACIENTE:
Animal: {{NOME_ANIMAL}}
Espécie / Raça / Idade: {{ESPECIE_RACA_IDADE}}
Responsável pelo Animal: {{RESPONSAVEL}} | Contato: {{CPF_RESPONSAVEL}}

AUTORIZO a internação hospitalar do animal acima identificado nas dependências de {{NOME_CLINICA}}, declaro estar ciente de que:

1. CUIDADOS: Meu animal receberá monitoração clínica contínua, medicação e cuidados de enfermagem conforme protocolo estabelecido pelo Médico(a) Veterinário(a).

2. COMUNICAÇÃO: Serei contatado(a) imediatamente em caso de intercorrências, piora do quadro clínico ou necessidade de procedimentos adicionais.

3. AUTORIZAÇÃO DE EMERGÊNCIA: Em caso de urgência ou impossibilidade de contato, autorizo a equipe a tomar as providências médico-veterinárias necessárias para preservar a vida do meu animal.

4. VISITAS: Estou ciente das regras de visita da clínica e comprometido(a) a respeitá-las.

5. ALTA: Comprometo-me a buscar o animal na data e horário combinados, ciente de que o atraso pode gerar custos adicionais de internação.

6. RESPONSABILIDADE FINANCEIRA: Estou ciente dos honorários e autorizo as cobranças referentes aos serviços prestados durante a internação.

ASSINO o presente Termo em plena consciência de meus direitos e obrigações.

Local e Data: {{NOME_CLINICA}}, {{DATA_ATUAL}}

_______________________________________________
{{RESPONSAVEL}} — CPF/RG: {{CPF_RESPONSAVEL}}
Responsável pelo Animal

_______________________________________________
{{RT_NOME}} | CRMV: {{RT_CRMV}}
Médico(a) Veterinário(a) Responsável Técnico(a)

HASH: {{HASH}} | Smart ID: {{SMART_ID}} | Ref.: Res. CFMV 1653/2025`
  },
  {
    id: "eutanasia",
    titulo: "TCLE — Eutanásia Humanitária",
    categoria: "Eutanásia",
    conteudo: `TERMO DE CONSENTIMENTO PARA EUTANÁSIA HUMANITÁRIA

Smart ID de Prontuário: {{SMART_ID}}
Data de Emissão: {{DATA_ATUAL}} | {{HORA_ATUAL}}
Clínica: {{NOME_CLINICA}} | CNPJ: {{CNPJ}}

IDENTIFICAÇÃO DO PACIENTE:
Animal: {{NOME_ANIMAL}}
Espécie / Raça / Idade: {{ESPECIE_RACA_IDADE}}
Responsável pelo Animal: {{RESPONSAVEL}} | CPF/RG: {{CPF_RESPONSAVEL}}

DECLARAÇÃO:

Eu, {{RESPONSAVEL}}, declaro que após receber explicação detalhada sobre o estado clínico do animal e as opções terapêuticas disponíveis, compreendo que o animal encontra-se em sofrimento irreversível e que a eutanásia humanitária representa a alternativa mais ética e compassiva.

DECLARO expressamente que:
1. Fui informado(a) de que a eutanásia é um procedimento irreversível;
2. Tomei a decisão de forma livre, consciente e sem qualquer coerção;
3. O procedimento será realizado com medicação específica que proporciona morte indolor e rápida;
4. Autorizo o descarte ético do corpo conforme orientação da clínica.

CONSINTO livremente com a realização da eutanásia humanitária.

Local e Data: {{NOME_CLINICA}}, {{DATA_ATUAL}}

_______________________________________________
{{RESPONSAVEL}} — CPF/RG: {{CPF_RESPONSAVEL}}
Responsável pelo Animal

_______________________________________________
{{RT_NOME}} | CRMV: {{RT_CRMV}}
Médico(a) Veterinário(a) Responsável Técnico(a)

HASH: {{HASH}} | Smart ID: {{SMART_ID}} | Ref.: Res. CFMV 1653/2025 + Lei 9.605/98`
  },
  {
    id: "manual_boas_praticas_creche",
    titulo: "Manual de Boas Práticas — Creche e Hotel",
    categoria: "Manual",
    conteudo: `MANUAL DE BOAS PRÁTICAS (MBP)
ESTABELECIMENTO: {{NOME_CLINICA}}
RESPONSÁVEL LEGAL: {{RESPONSAVEL}}
ENDEREÇO: {{ENDERECO_UNIDADE}}

1. INTRODUÇÃO
Este documento estabelece as normas de higiene, segurança e operação da {{NOME_CLINICA}}, visando garantir o bem-estar animal, a saúde dos colaboradores e o cumprimento das normas sanitárias federais, estaduais e municipais vigentes.

2. DIRETRIZES GERAIS
- Higiene Pessoal: Colaboradores devem manter unhas limpas, uso de uniformes higienizados e utilização obrigatória de EPIs conforme a atividade.
- Saúde Animal: Somente animais com vacinação (V8/V10, Raiva, Gripe, Giárdia), vermifugação e controle de ectoparasitas em dia são admitidos.
- Ambiente: Manter todas as áreas livres de entulhos, fiação protegida e ralos com fechamento.

3. CRONOGRAMA DE MANUTENÇÕES
- Higienização de Caixa d'Água: Semestral (Empresa Licenciada)
- Controle de Pragas (Dedetização): Semestral (Empresa Licenciada)
- Troca de Filtros de Bebedouros: Trimestral (Equipe Interna)
- Limpeza de Ar-Condicionado: Semestral (Empresa Especializada)

Data: {{DATA_ATUAL}}
Assinatura: _________________________________________________
{{RESPONSAVEL}} (Responsável Legal)
RT: {{RT_NOME}} | CRMV: {{RT_CRMV}}`
  },
  {
    id: "pop_01_limpeza_creche",
    titulo: "POP 01: Limpeza e Desinfecção (Creche)",
    categoria: "POP",
    conteudo: `PROCEDIMENTO OPERACIONAL PADRÃO - POP 01
LIMPEZA E DESINFECÇÃO DE AMBIENTES E ÁREA EXTERNA

OBJETIVO: Eliminar sujidades e microrganismos das áreas de convívio e recreação.
FREQUÊNCIA: Diária (manhã e final do dia) e sempre que houver dejetos.
MATERIAIS: Detergente neutro, solução de hipoclorito de sódio ou quaternário de amônia.

PROCEDIMENTO:
1. Retirar os animais do setor.
2. Remover resíduos sólidos (fezes, pelos) manualmente.
3. Lavar com água e detergente.
4. Aplicar o desinfetante, respeitando o tempo de contato de 10 a 15 minutos.

PARQUE DE AREIA: Remoção diária de dejetos com pá. Mensalmente, realizar a revira da areia e aplicação de solução sanitizante específica que não agrida as patas dos animais.

Responsável pela Execução: Equipe de Limpeza
Visto do RT: {{RT_NOME}}`
  },
  {
    id: "pop_02_materiais_creche",
    titulo: "POP 02: Limpeza de Materiais (Creche)",
    categoria: "POP",
    conteudo: `PROCEDIMENTO OPERACIONAL PADRÃO - POP 02
LIMPEZA DE MATERIAIS E EQUIPAMENTOS

OBJETIVO: Higienização de gaiolas, bebedouros, comedouros e materiais de banho.
FREQUÊNCIA: Após cada uso ou diariamente para itens fixos.

PROCEDIMENTO:
1. Imersão em solução de detergente para remoção de resíduos orgânicos.
2. Enxágue abundante.
3. Desinfecção com álcool 70% ou solução clorada.
4. Secagem completa antes do armazenamento para evitar fungos/ferrugem.

Visto do RT: {{RT_NOME}}`
  },
  {
    id: "pop_03_residuos_creche",
    titulo: "POP 03: Manejo de Resíduos (PGRSS)",
    categoria: "POP",
    conteudo: `PROCEDIMENTO OPERACIONAL PADRÃO - POP 03
MANEJO DE RESÍDUOS SÓLIDOS (PGRSS SIMPLIFICADO)

OBJETIVO: Descarte seguro de resíduos para evitar pragas e contaminação.

ACONDICIONAMENTO: Lixeiras com tampa e acionamento por pedal, revestidas com sacos plásticos resistentes.

SEPARAÇÃO:
- Resíduos Orgânicos (Dejetos): Coletados em sacos pretos reforçados e vedados.
- Resíduos Recicláveis: Papelão, embalagens de ração limpas.

ARMAZENAMENTO: Local isolado, protegido de sol e chuva, até a coleta municipal.

Visto do RT: {{RT_NOME}}`
  },
  {
    id: "pop_04_acidentes_creche",
    titulo: "POP 04: Acidentes com Animais",
    categoria: "POP",
    conteudo: `PROCEDIMENTO OPERACIONAL PADRÃO - POP 04
PROCEDIMENTO EM CASO DE ACIDENTES COM ANIMAIS

OBJETIVO: Protocolo de emergência para mordeduras ou ferimentos.

PROCEDIMENTO:
1. ISOLAMENTO: Separar imediatamente os animais envolvidos.
2. PRIMEIROS SOCORROS: Limpeza do local ferido com soro fisiológico ou água corrente.
3. CONTENÇÃO: Se houver sangramento, aplicar compressão leve com gaze limpa.
4. COMUNICAÇÃO: Informar imediatamente o Responsável pelo Animal e o médico veterinário responsável/parceiro.
5. REGISTRO: Anotar o ocorrido na ficha do animal para controle interno.

Visto do RT: {{RT_NOME}}`
  },
  {
    id: "pop_05_alimentos_creche",
    titulo: "POP 05: Armazenamento de Alimentos",
    categoria: "POP",
    conteudo: `PROCEDIMENTO OPERACIONAL PADRÃO - POP 05
ARMAZENAMENTO DE ALIMENTOS E COPA

OBJETIVO: Evitar contaminação cruzada entre alimentos humanos e animais.

REGRA DE OURO: Alimentos para colaboradores devem ser guardados em armários/geladeiras distintos dos alimentos dos cães.

RAÇÕES E PETISCOS: Mantidos em potes herméticos, suspensos do chão (em prateleiras ou estrados), com identificação de validade.

Visto do RT: {{RT_NOME}}`
  },
  {
    id: "pgrss_simplificado_creche",
    titulo: "PGRSS Simplificado — Creche e Hotel",
    categoria: "Manual",
    conteudo: `PLANO DE GERENCIAMENTO DE RESÍDUOS DE SERVIÇOS DE SAÚDE (PGRSS)
ESTABELECIMENTO: {{NOME_CLINICA}}
RESPONSÁVEL LEGAL: {{RESPONSAVEL}}
RESPONSÁVEL TÉCNICA PELA ELABORAÇÃO: {{RT_NOME}}
ENDEREÇO: {{ENDERECO_UNIDADE}}

1. IDENTIFICAÇÃO DO GERADOR
Razão Social: {{RAZAO_SOCIAL}}
Nome Fantasia: {{NOME_CLINICA}}
CNPJ: {{CNPJ}}
Atividade Principal: Higiene, embelezamento e alojamento de animais domésticos.

2. OBJETIVOS
Estabelecer os procedimentos para o manejo seguro de resíduos gerados nas atividades de creche, hotel e banho e tosa, visando a proteção dos colaboradores, a preservação da saúde pública e do meio ambiente, conforme a Resolução RDC nº 222/2018 da ANVISA e normas da Vigilância Sanitária local.

3. CLASSIFICAÇÃO DOS RESÍDUOS GERADOS
Grupo A (Resíduos Biológicos)
- A4: Dejetos animais (fezes e urina), pelos, materiais de limpeza contaminados com secreções orgânicas e resíduos provenientes de higiene animal.

Grupo D (Resíduos Comuns)
- D1: Resíduos administrativos (papéis, plásticos de escritório).
- D2: Resíduos de alimentação humana (sobras de refeições dos colaboradores na copa).
- D3: Resíduos de sanitários (papel higiênico) de uso dos colaboradores e clientes.

Grupo E (Materiais Perfurocortantes) - Se aplicável
- E: Agulhas e seringas (em caso de parcerias para aplicação de vacinas no local). Nota: Se não houver aplicação, este item deve ser declarado como "geração inexistente".

4. ETAPAS DO MANEJO
4.1. Segregação e Acondicionamento:
- Grupo A (Biológicos): Sacos plásticos brancos leitosos ou pretos resistentes (conforme norma municipal), identificados, em lixeiras com tampa e pedal.
- Grupo D (Comuns): Sacos plásticos pretos ou azuis em lixeiras identificadas como "Lixo Comum".

4.2. Armazenamento Interno: Lixeiras devem permanecer fechadas. Retirada ao menos 2 vezes ao dia.

4.3. Armazenamento Externo: Abrigo externo sinalizado, elevado do solo e protegido.

4.4. Coleta Externa: Realizada pelo serviço de limpeza pública municipal.

5. MEDIDAS DE HIGIENE E SEGURANÇA
EPIs: Obrigatório o uso de luvas de borracha, botas e máscaras durante o manejo.
Higienização: Lixeiras lavadas semanalmente com hipoclorito de sódio.

6. PLANO DE CONTINGÊNCIA
Em caso de derramamento: Isolar área, remoção mecânica, desinfetar com Quaternário de Amônia ou Cloro por 15 min.

7. TREINAMENTO
Os colaboradores devem receber treinamento semestral sobre segregação e uso de EPIs.

Data: {{DATA_ATUAL}}
Assinatura do Responsável: _________________________________________________
{{RESPONSAVEL}} (Responsável Legal)
RT pela Elaboração: {{RT_NOME}} | CRMV: {{RT_CRMV}}`
  },
  {
    id: "retirada_sem_alta",
    titulo: "Termo de Retirada sem Alta Médica",
    categoria: "Internação",
    conteudo: `TERMO DE RETIRADA SEM ALTA MÉDICA (EVASÃO/INSISTÊNCIA)

Smart ID: {{SMART_ID}}
Data: {{DATA_ATUAL}} | {{HORA_ATUAL}}

Eu, {{RESPONSAVEL}}, Responsável pelo Animal {{NOME_ANIMAL}}, declaro que estou retirando o referido animal das dependências de {{NOME_CLINICA}} contra a recomendação expressa do Médico(a) Veterinário(a).

DECLARO estar ciente de que:
1. O animal ainda necessita de cuidados profissionais e monitoração.
2. A interrupção do tratamento neste momento pode agravar o quadro clínico, levar a sequelas ou ao óbito.
3. Assumo total responsabilidade civil e criminal por quaisquer danos que venham a ocorrer ao animal após sua saída.
4. Fui orientado(a) sobre os riscos de transporte e continuidade do tratamento em domicílio.

Assinatura: _______________________________________________
{{RESPONSAVEL}} (Responsável pelo Animal)

Visto do RT: {{RT_NOME}} | CRMV: {{RT_CRMV}}
HASH: {{HASH}} | Ref.: Res. CFMV 1321/20`
  },
  {
    id: "doacao_corpo",
    titulo: "Termo de Doação de Corpo (Ensino/Pesquisa)",
    categoria: "Ética",
    conteudo: `TERMO DE DOAÇÃO DE CORPO PARA ENSINO E PESQUISA

Smart ID: {{SMART_ID}}
Data: {{DATA_ATUAL}}

Eu, {{RESPONSAVEL}}, na qualidade de Responsável pelo Animal {{NOME_ANIMAL}}, após a constatação do óbito, autorizo livremente a doação do corpo do referido animal para a instituição {{NOME_CLINICA}} com a finalidade exclusiva de Ensino e Pesquisa Científica.

DECLARO que:
1. Fui informado(a) sobre a importância da doação para o avanço da medicina veterinária.
2. Não recebi qualquer compensação financeira por este ato.
3. Tenho ciência de que o corpo não me será devolvido após os estudos.

Assinatura: _______________________________________________
{{RESPONSAVEL}} (Responsável pelo Animal)

RT: {{RT_NOME}} | CRMV: {{RT_CRMV}}
HASH: {{HASH}} | Ref.: Lei 11.794/2008`
  },
  {
    id: "procedimento_risco",
    titulo: "TCLE — Procedimento de Alto Risco / Complexidade",
    categoria: "Risco",
    conteudo: `TCLE — PROCEDIMENTO DE ALTO RISCO OU COMPLEXIDADE TÉCNICA

Smart ID: {{SMART_ID}}
Data: {{DATA_ATUAL}}

Eu, {{RESPONSAVEL}}, Responsável pelo Animal {{NOME_ANIMAL}}, declaro ter sido exaustivamente informado(a) sobre a natureza complexa do procedimento {{NOME_PROCEDIMENTO}}.

CIÊNCIA DOS RISCOS ESPECÍFICOS:
1. Entendo que este procedimento possui uma taxa de complicação superior aos métodos convencionais.
2. Fui alertado(a) sobre a possibilidade de [DESCREVER RISCO ESPECÍFICO].
3. Compreendo que os resultados dependem da resposta biológica individual do paciente.

AUTORIZO a equipe técnica a proceder conforme o plano terapêutico apresentado.

Assinatura: _______________________________________________
{{RESPONSAVEL}} (Responsável pelo Animal)

Médico(a) Veterinário(a): {{RT_NOME}} | CRMV: {{RT_CRMV}}
HASH: {{HASH}} | Ref.: Res. CFMV 1653/2025`
  },
  {
    id: "pop_diagnostico_imagem_rt",
    titulo: "POP — Diagnóstico Veterinário por Imagem (Res. CFMV 1.374)",
    categoria: "POP",
    conteudo: `PROCEDIMENTO OPERACIONAL PADRÃO (POP) — RESPONSABILIDADE TÉCNICA
SERVIÇO DE DIAGNÓSTICO VETERINÁRIO POR IMAGEM

ESTABELECIMENTO: {{NOME_CLINICA}}
CNPJ: {{CNPJ}}
ENDEREÇO: {{ENDERECO_UNIDADE}}
RESPONSÁVEL TÉCNICO: {{RT_NOME}} | CRMV: {{RT_CRMV}}
REFERÊNCIA LEGAL: Resolução nº 1.374 do Conselho Federal de Medicina Veterinária (CFMV)
REVISÃO: 01 (Histórico: Rev. 00 - Emissão Inicial | Rev. 01 - Atualização Técnica)
DATA DE ATUALIZAÇÃO: {{DATA_ATUAL}}

1. INTRODUÇÃO
Este Procedimento Operacional Padrão (POP) estabelece as diretrizes técnicas e operacionais obrigatórias para a prestação de serviços de diagnóstico veterinário por imagem (radiologia, ultrassonografia, tomografia computadorizada, ressonância magnética, etc.) no estabelecimento {{NOME_CLINICA}}, visando assegurar a qualidade dos exames, a proteção radiológica de pacientes e operadores, e a conformidade legal irrestrita com a Resolução nº 1.374 do CFMV.

2. DESIGNAÇÃO DO RESPONSÁVEL TÉCNICO
Fica formalmente designado como Responsável Técnico (RT) o(a) médico(a) veterinário(a) {{RT_NOME}}, inscrito(a) no CRMV sob o nº {{RT_CRMV}}, conforme Anotação de Responsabilidade Técnica (ART) vigente junto ao órgão de classe. O RT detém plena autonomia técnica para assegurar as condições higiênico-sanitárias, de segurança e operacionais de todo o setor de imagem.

3. RESPONSABILIDADES DO RESPONSÁVEL TÉCNICO
Compete ao RT do Serviço de Diagnóstico por Imagem:
- Supervisionar e orientar tecnicamente a equipe de médicos veterinários imaginologistas e auxiliares;
- Garantir a calibração, manutenção preventiva e controle de qualidade periódicos dos equipamentos;
- Implementar e fiscalizar o cumprimento das normas de radioproteção (uso de dosímetros, blindagem, EPIs plumbíferos);
- Garantir a elaboração, emissão e assinatura de laudos por médicos veterinários devidamente habilitados;
- Garantir o arquivamento e rastreabilidade dos laudos e imagens geradas por no mínimo 5 anos;
- Promover capacitações e treinamentos periódicos para a equipe do setor de imagem.

4. PROCEDIMENTOS OPERACIONAIS
4.1. Recepção do Paciente e Indicação Clínica:
- Todo exame deve ser precedido de requisição formal do clínico veterinário solicitante, contendo suspeita diagnóstica e dados do paciente.
- Verificação obrigatória do Termo de Consentimento (TCLE) assinado pelo tutor antes de procedimentos com sedação.

4.2. Execução dos Exames e Segurança:
- Posicionamento do paciente com foco no bem-estar animal, minimizando estresse e dor.
- Uso obrigatório de Equipamento de Proteção Individual (EPI) plumbífero (avental de chumbo, protetor de tireoide, luvas plumbíferas) para os auxiliares e colaboradores envolvidos no posicionamento radiográfico.
- Sinalização visível na porta das salas de exames contendo o símbolo internacional de radiação ionizante.

4.3. Elaboração e Liberação de Laudos:
- Os laudos dos exames de imagem devem ser redigidos em formato claro, preciso e técnico, contendo descrição das alterações, impressões diagnósticas e identificação completa do médico veterinário executor com respectivo CRMV.

5. MONITORAMENTO E AUDITORIA
- Verificação diária da temperatura ambiental e do correto funcionamento dos equipamentos de imagem.
- Auditoria mensal das planilhas de manutenção, dosímetros individuais e conformidade dos laudos emitidos pela clínica.

6. REVISÃO E ATUALIZAÇÃO DO POP
Este POP deve ser revisado anualmente pelo RT {{RT_NOME}} ou sempre que ocorrerem alterações estruturais, substituição de equipamentos ou modificações relevantes na legislação veterinária ou sanitária nacional.

7. CONCLUSÃO
A implementação eficaz deste Procedimento Operacional Padrão garante que o serviço de diagnóstico por imagem de {{NOME_CLINICA}} cumpra rigorosamente a Resolução nº 1.374 do CFMV, operando sob os mais elevados preceitos éticos, de segurança, biossegurança e qualidade diagnóstica.

8. REFERÊNCIA BIBLIOGRÁFICA
- Conselho Federal de Medicina Veterinária. Resolução CFMV nº 1.374, que dispõe sobre os serviços de diagnóstico veterinário por imagem.
- Portaria Federal de Proteção Radiológica vigente e normas sanitárias locais.

{{CIDADE}}, {{DATA_ATUAL}}

_________________________________________________
{{RT_NOME}} | CRMV: {{RT_CRMV}}
Responsável Técnico

_________________________________________________
{{RESPONSAVEL}} | CPF/RG: {{CPF_RESPONSAVEL}}
Representante Legal do Estabelecimento

HASH DE AUTENTICIDADE: {{HASH}}
VERTOS OS · Smart ID: {{SMART_ID}}`
  }
];
