import React from "react";
import { 
  Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GavelIcon from "@mui/icons-material/Gavel";
import PetsIcon from "@mui/icons-material/Pets";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ScienceIcon from "@mui/icons-material/Science";
import FactoryIcon from "@mui/icons-material/Factory";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import RecyclingIcon from "@mui/icons-material/Recycling";
import GroupIcon from "@mui/icons-material/Group";
import AgricultureIcon from "@mui/icons-material/Agriculture";

const COR = "#1b4332";

export default function AssessoriaAbate() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <AgricultureIcon sx={{ fontSize: 40, color: COR }} />
        <Box>
          <Typography variant="h4" fontWeight={900} color={COR}>
            Assessoria Técnica em Abate Bovinos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Guia Referencial para Consultoria em Abatedouros-Frigoríficos
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 4, mb: 4, bgcolor: "#f1f8f5", border: "1px solid #e8f5e9" }} elevation={0}>
        <Typography variant="body2" sx={{ lineHeight: 1.7, textAlign: "justify" }}>
          A consultoria e assessoria técnica em abatedouros-frigoríficos atua no ponto de convergência entre a conformidade legal, a preservação do bem-estar animal, a eficiência dos processos industriais e a garantia da inocuidade alimentar. A complexidade operacional da indústria de processamento de proteína animal exige diagnósticos precisos e intervenções fundamentadas na bioquímica da carne, na engenharia de instalações e na gestão dos sistemas oficiais de inspeção sanitária. O objetivo deste relatório é detalhar os pilares científicos, normativos e operacionais que orientam a atuação de especialistas na otimização do rendimento de carcaça, na prevenção de penalizações fiscais e no atendimento aos padrões de mercados nacionais e internacionais de exportação.
        </Typography>
      </Paper>

      {/* 1. Legislação */}
      <Accordion defaultExpanded sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <GavelIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>1. Legislação Sanitária, Regulamentatória e Defesa Animal</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            O arcabouço normativo que rege o funcionamento dos abatedouros-frigoríficos no Brasil estabelece as condições de infraestrutura, higienização e fluxos operacionais para garantir a segurança dos alimentos derivados de origem animal. A base jurídica central da fiscalização sanitária reside no Regulamento da Inspeção Industrial e Sanitária de Produtos de Origem Animal (RIISPOA), promulgado pelo Decreto nº 9.013/2017 e atualizado pelo Decreto nº 10.468/2020. Essa legislação define as competências institucionais e os critérios de fiscalização aplicáveis conforme a jurisdição do estabelecimento, dividindo-se em Serviço de Inspeção Federal (SIF), Estadual (SIE) e Municipal (SIM).
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            Além do RIISPOA, normas complementares regulam operações específicas da cadeia produtiva. A Portaria MAPA nº 365/2021, alterada e complementada pela Portaria MAPA nº 864/2023, estabelece os requisitos obrigatórios de manejo pré-abate, abate humanitário e os métodos de insensibilização autorizados para cada espécie de açougue e pescado. Para a padronização e garantia da identidade dos produtos finais, os Regulamentos Técnicos de Identidade e Qualidade (RTIQs) estabelecem os parâmetros físico-químicos e microbiológicos compulsórios, como exemplificado pela Portaria MAPA nº 664/2022 para carne moída.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, textAlign: "justify" }}>
            Na esfera da defesa sanitária e controle do trânsito animal, o monitoramento epidemiológico é assegurado pela emissão da Guia de Trânsito Animal eletrônica (e-GTA). A e-GTA atesta a origem, o destino e o estado sanitário do lote, devendo ser auditada obrigatoriamente no momento da recepção dos animais no frigorífico. Legislações estaduais, a exemplo das diretrizes da IAGRO/MS (Portaria nº 3.726/2024), estipulam limites rígidos para a duração do transporte (máx. 12 horas contínuas sem descanso) e condicionantes para a higienização dos veículos transportadores.
          </Typography>

          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><strong>Esfera de Inspeção / Controle</strong></TableCell>
                  <TableCell><strong>Âmbito de Comercialização</strong></TableCell>
                  <TableCell><strong>Legislação Base / Órgão Regulador</strong></TableCell>
                  <TableCell><strong>Foco Principal do Controle Sanitário</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Serviço de Inspeção Federal (SIF)</TableCell>
                  <TableCell>Nacional e Internacional (Exportação)</TableCell>
                  <TableCell>Decreto nº 9.013/2017 e 10.468/2020 (MAPA)</TableCell>
                  <TableCell>Inocuidade, rastreabilidade e requisitos equivalentes de países importadores.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Serviço de Inspeção Estadual (SIE)</TableCell>
                  <TableCell>Estadual (Limite do Estado de origem)</TableCell>
                  <TableCell>Legislação Estadual Específica (ex.: IAGRO/MS)</TableCell>
                  <TableCell>Sanidade do rebanho regional e abastecimento do mercado estadual.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Serviço de Inspeção Municipal (SIM)</TableCell>
                  <TableCell>Municipal / Consórcios Públicos</TableCell>
                  <TableCell>Legislação Municipal e Consórcios Intermunicipais</TableCell>
                  <TableCell>Abastecimento local e adequação de agroindústrias de pequeno e médio porte.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Defesa Sanitária Animal</TableCell>
                  <TableCell>Trânsito e Vigilância Epidemiológica</TableCell>
                  <TableCell>Instruções Normativas do MAPA e Portarias Estaduais</TableCell>
                  <TableCell>Emissão de e-GTA, controle de zoonoses e desinfecção de veículos.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* 2. BEA */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PetsIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>2. Bem-Estar Animal (BEA) e Abate Humanitário</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            A conformidade com os princípios de bem-estar animal é imperativa por razões éticas, legais e econômicas, impactando diretamente as características sensoriais e tecnológicas da carne. O manejo pré-abate inicia-se na propriedade rural e engloba o carregamento, a densidade no transporte e o desembarque nas instalações da indústria. A recepção exige infraestrutura projetada com pisos antiderrapantes, rampas com aclive suave (idealmente entre 13% e 15% para bovinos), aspersão de água nas seringas e iluminação adequada para prevenir o pânico e a recusa de deslocamento do lote.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            A gestão temporal do jejum alimentar e hídrico exige monitoramento rigoroso a partir da propriedade de origem, visando otimizar o esvaziamento gastrointestinal para mitigar o risco de contaminação fecal da carcaça durante a evisceração, ao mesmo tempo em que previne a desidratação tecidual. A Portaria MAPA nº 365/2021 estabelece os limites máximos de jejum total contados desde a última oferta de alimento na granja ou fazenda: 24 horas para bovinos, 18 horas para suínos e 12 horas para aves de corte.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            A insensibilização deve induzir um estado imediato de inconsciência e insensibilidade que persista obrigatoriamente até a morte do animal por exsanguinação. A escolha do método varia conforme a espécie:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.875rem", marginBottom: "16px" }}>
            <li><strong>Bovinos:</strong> Insensibilização mecânica por dardo cativo penetrativo ou não penetrativo (tempo máx. dardo-sangria: 60s ou 30s respectivamente).</li>
            <li><strong>Suínos:</strong> Eletronarcrose ou exposição a atmosfera controlada com CO2.</li>
            <li><strong>Aves:</strong> Eletronarcrose por imersão da cabeça ou atmosfera modificada. (Frangos: máx 60s pendura-insensibilização).</li>
          </ul>
          <Typography variant="body2" sx={{ mb: 3, textAlign: "justify" }}>
            A sangria deve promover a perda maciça e rápida de sangue pela secção das artérias carótidas e veias jugulares. O tempo mínimo de permanência na calha de sangria antes de qualquer intervenção física, corte ou estímulo elétrico é de 3 minutos para ruminantes. Em fêmeas gestantes destinadas ao abate, a legislação permite o processamento até 90% do período gestacional, prevendo protocolos operacionais nos quais o útero gravídico permanece intocado por no mínimo 30 minutos após a sangria da matriz para assegurar a anoxia fetal do feto.
          </Typography>

          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><strong>Parâmetro Operacional</strong></TableCell>
                  <TableCell><strong>Bovinos</strong></TableCell>
                  <TableCell><strong>Suínos</strong></TableCell>
                  <TableCell><strong>Aves de Corte</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Tempo Máximo de Jejum</TableCell>
                  <TableCell>24 horas (a partir da origem)</TableCell>
                  <TableCell>18 horas (a partir da origem)</TableCell>
                  <TableCell>12 horas (a partir da origem)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Método de Insensibilização</TableCell>
                  <TableCell>Dardo cativo penetrativo / não penetrativo</TableCell>
                  <TableCell>Eletronarcrose ou Gás CO2</TableCell>
                  <TableCell>Eletronarcrose por imersão / Atmosfera mod.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Limite Insensibilização-Sangria</TableCell>
                  <TableCell>≤ 60s (penetrativo); ≤ 30s (não penetrativo)</TableCell>
                  <TableCell>Mínimo intervalo possível pós-narcrose</TableCell>
                  <TableCell>Mínimo intervalo após a saída da cuba</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tempo Mínimo de Sangria</TableCell>
                  <TableCell>3 minutos (sem manipulação)</TableCell>
                  <TableCell>3 minutos</TableCell>
                  <TableCell>2 a 3 minutos (túnel de gotejamento)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pendura Pré-Insensibilização</TableCell>
                  <TableCell>Não aplicável</TableCell>
                  <TableCell>Não aplicável</TableCell>
                  <TableCell>Máximo 60s (frangos); 120s (perus)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* 3. PAC & APPCC */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AssignmentTurnedInIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>3. Programas de Autocontrole (PAC), APPCC e Governança da Inocuidade</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            A gestão sanitária na indústria frigorífica é estruturada nos Programas de Autocontrole (PAC), respaldados pela Norma Interna DIPOA/SDA nº 01/2017 e consolidados pela Lei do Autocontrole (Lei nº 14.515/2022). O pilar garantidor da inocuidade alimentar é o sistema de Análise de Perigos e Pontos Críticos de Controle (APPCC/HACCP). No abate de ungulados e aves, dois Pontos Críticos de Controle (PCC) destacam-se pela criticidade biológica:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.875rem", marginBottom: "16px" }}>
            <li style={{ marginBottom: "8px" }}><strong>PCC 1 - Contaminação Fecal e Gastrointestinal (Oclusão do Esôfago e Evisceração):</strong> A contenção do conteúdo digestivo exige a amarra do esôfago (chuleio) e o ensacamento com lacre do reto para impedir o extravasamento. Tolerância zero para contaminação visível. O desvio exige intervenção obrigatória por toalete sanitário (corte e remoção da área contaminada), sendo expressamente vedada a simples lavagem com água sobre o ponto atingido.</li>
            <li><strong>PCC 2 - Resfriamento e Maturação de Carcaças:</strong> A temperatura interna das carcaças bovinas deve cair abaixo de 7ºC (e dos miúdos abaixo de 3ºC) em prazos que impeçam o desenvolvimento de patógenos. Velocidade do ar, umidade e taxa de carregamento são controladas continuamente.</li>
          </ul>
          <Typography variant="body2" sx={{ mb: 1 }}>Os PACs dão suporte ao APPCC em 21 itens auditáveis. Entre os essenciais:</Typography>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.875rem" }}>
            <li><strong>PPHO:</strong> Higienização Pré-Operacional e Operacional (limpeza de facas/chairas em água renovável a 82,2ºC).</li>
            <li><strong>Controle de Água de Abastecimento:</strong> Monitoramento diário de cloro (1,0 a 2,0 mg/L) e pH.</li>
            <li><strong>Manutenção e Calibração:</strong> Calibração de termômetros, balanças, manômetros, etc.</li>
            <li><strong>Rastreabilidade e Recall:</strong> Mecanismos auditáveis para correlacionar lote (GTA) ao produto final.</li>
          </ul>
        </AccordionDetails>
      </Accordion>

      {/* 4. Bioquímica e Carne */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ScienceIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>4. Bioquímica Muscular, Transformação Pós-Morte e Qualidade da Carne</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            O conhecimento da conversão do músculo em carne é essencial para diagnosticar perdas de rendimento e alterações físico-químicas. Com a sangria, a falta de oxigênio redireciona o metabolismo para glicólise anaeróbica, gerando ácido láctico e baixando o pH de 7,2 para 5,4 - 5,8. O esgotamento de ATP causa o <em>rigor mortis</em>. Anomalias nessa curva geram as carnes DFD e PSE:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.875rem", marginBottom: "16px" }}>
            <li style={{ marginBottom: "8px" }}><strong>Carne DFD (Dark, Firm, Dry):</strong> Ocorre em bovinos por estresse crônico (jejum longo, brigas). O glicogênio esgota antes do abate, o pH não cai o suficiente (≥ 6,2). Carne fica escura, seca na superfície e com menor vida útil.</li>
            <li><strong>Carne PSE (Pale, Soft, Exudative):</strong> Comum em suínos/aves por estresse agudo imediato. O pH cai rapidamente (abaixo de 5,8) enquanto a carcaça ainda está quente (acima de 35ºC), desnaturando proteínas. Carne pálida, flácida e perde muita água.</li>
          </ul>
          <Typography variant="body2" sx={{ mb: 3, textAlign: "justify" }}>
            Para prevenir anomalias, adota-se estimulação elétrica (bovinos) para acelerar a queda de pH antes do resfriamento rápido, prevenindo o <em>cold shortening</em> (encurtamento pelo frio). Na desossa, monitora-se o <em>drip loss</em> e o <em>toilette</em>. O excesso de aparamento no toilette é uma grande fonte de perda de rendimento.
          </Typography>

          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><strong>Atributo / Parâmetro</strong></TableCell>
                  <TableCell><strong>Carne Normal (Bovino)</strong></TableCell>
                  <TableCell><strong>Carne DFD</strong></TableCell>
                  <TableCell><strong>Carne PSE</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Glicogênio Muscular Inicial</TableCell>
                  <TableCell>Nível fisiológico normal</TableCell>
                  <TableCell>Depletado por estresse crônico</TableCell>
                  <TableCell>Nível fisiológico normal</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Taxa de Queda do pH</TableCell>
                  <TableCell>Gradual (24 horas até estabilizar)</TableCell>
                  <TableCell>Lenta e limitada</TableCell>
                  <TableCell>Rápida (primeiros 45 minutos)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>pH Final da Carne (24h)</TableCell>
                  <TableCell>5,4 a 5,8</TableCell>
                  <TableCell>Elevado (≥ 6,2)</TableCell>
                  <TableCell>Baixo (&lt; 5,6) com carcaça quente</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Capacidade de Retenção de Água</TableCell>
                  <TableCell>Normal</TableCell>
                  <TableCell>Muito elevada</TableCell>
                  <TableCell>Reduzida (elevada perda de exsudato)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Aspecto Sensorial</TableCell>
                  <TableCell>Vermelho-brilhante característico</TableCell>
                  <TableCell>Escura, firme e superfície seca</TableCell>
                  <TableCell>Pálida, flácida e exsudativa</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Vida de Prateleira (Shelf Life)</TableCell>
                  <TableCell>Padrão do produto estocado</TableCell>
                  <TableCell>Reduzida (alta susceptibilidade microbiana)</TableCell>
                  <TableCell>Comprometida (perda de funcionalidade)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* 5. Engenharia e Layout */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FactoryIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>5. Engenharia de Processos, Layout Industrial e Fluxo Sanitário</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            A arquitetura sanitária de um abatedouro-frigorífico organiza-se de forma estritamente unidirecional, progredindo das operações da Área Suja até as etapas da Área Limpa, com interceptação obrigatória por barreiras sanitárias:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.875rem", marginBottom: "16px" }}>
            <li style={{ marginBottom: "8px" }}><strong>Área Suja:</strong> Locais de desembarque, currais, pocilgas, box de insensibilização, calha de sangria, calha de esfola (bovinos) ou escaldagem/depenagem (suínos/aves).</li>
            <li><strong>Área Limpa:</strong> Inicia-se no ponto de evisceração e abrange as linhas de inspeção sanitária, carimbagem, lavagem final, câmaras de resfriamento e maturação, sala de desossa e expedição.</li>
          </ul>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            A velocidade da nórea (mensurada em animais por hora) deve ser dimensionada em função da densidade de operadores e da capacidade de exame da equipe de inspeção (SIF). O excesso de velocidade na linha pode comprometer o tempo de sangria, a acurácia do exame sanitário e a eficiência da oclusão do trato digestivo. O ambiente térmico da sala de desossa exige climatização controlada, mantendo a temperatura máxima de 10ºC a 12ºC para inibir proliferação microbiana.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* 6. Inspeção Sanitária */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LocalHospitalIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>6. Inspeção Sanitária Ante e Post-Mortem e Condutas do DIF</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            A inspeção <strong>ante-mortem</strong> avalia o estado geral de saúde dos animais nos currais de recepção. Animais com lesões ou suspeitas são segregados no curral de observação. A inspeção <strong>post-mortem</strong> ocorre continuamente na linha de abate através de visualização, palpação, olfação e incisão, estruturada em:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.875rem", marginBottom: "16px" }}>
            <li><strong>Linha A (Cabeça e Língua):</strong> Exame dos linfonodos e músculos masséteres e pterigóides (pesquisa de cisticercose).</li>
            <li><strong>Linha B (Vísceras):</strong> Trato gastrointestinal, fígado, pulmões e coração.</li>
            <li><strong>Linha C (Carcaça e Linfonodos):</strong> Musculatura, pleura, peritônio, linfonodos pré-crurais e pré-escapulares.</li>
          </ul>
          <Typography variant="body2" sx={{ mb: 3, textAlign: "justify" }}>
            Quando qualquer alteração é identificada, a carcaça e vísceras são desviadas para o <strong>Departamento de Inspeção Final (DIF)</strong>, onde o veterinário oficial determina a destinação: Condenação Total, Tratamento Condicional (Frio/Calor) ou Aproveitamento Parcial (após toalete).
          </Typography>

          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><strong>Patologia / Achado Sanitário</strong></TableCell>
                  <TableCell><strong>Critério Diagnóstico no DIF</strong></TableCell>
                  <TableCell><strong>Destinação Regulamentar (RIISPOA)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Carbúnculo Hemático</TableCell>
                  <TableCell>Suspeita ou confirmação de infecção por B. anthracis</TableCell>
                  <TableCell>Condenação Total imediata sem eviscerar; destruição da carcaça e anexos.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Septicemia / Toxemia / Piemia</TableCell>
                  <TableCell>Sinais de infecção sistêmica generalizada</TableCell>
                  <TableCell>Condenação Total da carcaça e de todos os órgãos.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cisticercose Bovina (Intensa)</TableCell>
                  <TableCell>Presença de cistos múltiplos na musculatura/órgãos</TableCell>
                  <TableCell>Condenação Total ou Tratamento pelo Calor conforme extensão.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cisticercose Bovina (Leve/Mod.)</TableCell>
                  <TableCell>Cistos viáveis ou calcificados em número reduzido</TableCell>
                  <TableCell>Tratamento Condicional (Frio/Calor); vedada liberação in natura.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tuberculose Localizada</TableCell>
                  <TableCell>Lesões circunscritas a um único órgão ou linfonodo</TableCell>
                  <TableCell>Condenação do órgão atingido e Tratamento pelo Calor para carcaça.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Contaminação Fecal / Ruminal</TableCell>
                  <TableCell>Presença visual de fezes ou conteúdo digestivo</TableCell>
                  <TableCell>Toalete sanitário com corte da área atingida; vedada lavagem.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* 7. Sustentabilidade e Gestão de Resíduos */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <RecyclingIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>7. Gestão de Subprodutos, Sustentabilidade Ambiental e Mercados Globais</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            A viabilidade econômica depende da graxaria técnica. Sangue vira farinha ou plasma; gordura vira sebo industrial; ossos e carcaças condenadas viram Farinha de Carne e Ossos (FCO). Na sustentabilidade, a Estação de Tratamento de Efluentes (ETE) monitora DBO (Demanda Bioquímica de Oxigênio), DQO (Química) e óleos/graxas (caixas de gordura, flotadores e lagoas).
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            <strong>Exportação e Mercados Internacionais:</strong> 
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.875rem", marginBottom: "16px" }}>
            <li><strong>USDA (EUA):</strong> Tolerância zero para Salmonella e E. coli STEC.</li>
            <li><strong>UE (União Europeia):</strong> Rastreabilidade total, proibição de promotores de crescimento (hormônios).</li>
            <li><strong>GACC (China):</strong> Auditorias rigorosas de biossegurança contra doenças transfronteiriças e rígidos controles microbiológicos.</li>
            <li><strong>Abates Religiosos:</strong> Halal (muculçmano, exige Tasmia e insensibilização reversível se houver) e Kosher (judaico, operador Shochet e corte sem insensibilização).</li>
          </ul>
        </AccordionDetails>
      </Accordion>

      {/* 8. Metodologia da Consultoria */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <GroupIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>8. Metodologia Sistêmica de Atuação da Consultoria</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2, textAlign: "justify" }}>
            A atuação da consultoria técnica estrutura-se de forma sequencial, com foco no diagnóstico, mapeamento e capacitação:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.875rem" }}>
            <li style={{ marginBottom: "8px" }}><strong>Diagnóstico e Auditoria de Linha:</strong> Acompanhamento presencial do fluxo (do desembarque à expedição) aplicando checklists de BPF, BEA, PPHO e PACs.</li>
            <li style={{ marginBottom: "8px" }}><strong>Mapeamento de Gargalos:</strong> Identificação de perdas no toilette, lesões por manejo agressivo, desvios térmicos e rejeições no DIF.</li>
            <li style={{ marginBottom: "8px" }}><strong>Capacitação Operacional:</strong> Treinamento direcionado a vaqueiros, magarefes e equipes de higienização.</li>
            <li><strong>Emissão de Relatórios:</strong> Atualização dos POPs, criação de KPIs e prestação de suporte no atendimento a autos de infração.</li>
          </ul>
        </AccordionDetails>
      </Accordion>

    </Box>
  );
}
