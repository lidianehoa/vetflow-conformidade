import React from "react";
import { Box, Typography, Paper, Divider, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import DomainIcon from "@mui/icons-material/Domain";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const COR = "#1b4332";

export default function Manual() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <MenuBookIcon sx={{ fontSize: 40, color: COR }} />
        <Box>
          <Typography variant="h4" fontWeight={900} color={COR}>
            Manual do Usuário
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Como extrair o máximo do Vertos OS
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 4, mb: 4, bgcolor: "#f1f8f5", border: "1px solid #e8f5e9" }} elevation={0}>
        <Typography variant="h6" fontWeight={800} color={COR} mb={1}>
          O que é o Vertos OS?
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
          O Vertos é o sistema operacional definitivo para Responsáveis Técnicos (RTs), Médicos Veterinários e Auditores de Qualidade. Desenvolvido para centralizar o rigor regulatório exigido por órgãos como MAPA, ANVISA e CFMV/CRMV, o Vertos blinda profissionais contra infrações através de automação, gestão documental inteligente e validações em tempo real.
        </Typography>
      </Paper>

      {/* Accordion 1 */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <WifiOffIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>1. Modo Offline (Fazendas e Áreas Remotas)</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2 }}>
            O Vertos foi projetado sob a arquitetura <strong>Progressive Web App (PWA)</strong> com <strong>Cache Persistente</strong>.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>O que isso significa?</strong> Você pode utilizar a plataforma em locais sem internet (fazendas isoladas, câmaras frias, frigoríficos no interior).</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>Como usar:</strong> Acesse o sistema uma vez com internet para carregar a plataforma no navegador. Quando estiver sem sinal, abra o sistema normalmente.</Typography>
          <Typography variant="body2"><strong>Sincronização:</strong> Você pode preencher qualquer laudo offline e clicar em "Salvar". O Vertos guardará as informações na memória do celular de forma invisível. Assim que você se conectar a uma rede Wi-Fi ou 4G, os dados serão automaticamente sincronizados com a nuvem.</Typography>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 2 */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <DomainIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>2. Meus Estabelecimentos (Central RT)</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            O coração da sua responsabilidade técnica. Permite cadastrar e gerenciar todos os locais onde você é o RT (Clínicas, Laticínios, Frigoríficos, Açougues).
          </Typography>
          <Typography variant="body2">
            <strong>Como usar:</strong> Adicione o CNPJ, endereço e tipo do estabelecimento. A partir daqui, todos os laudos e auditorias gerados ficarão atrelados ao histórico daquele local específico.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 3 */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FactCheckIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>3. Hub de Auditorias e Laudos</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A biblioteca regulatória mais robusta do mercado. Transforma pranchetas de papel em PDFs oficiais gerados em segundos.
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>Cobertura por Setor:</Typography>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.875rem" }}>
            <li style={{ marginBottom: "8px" }}><strong>Indústria (Frigoríficos/Laticínios):</strong> Laudos Ante-Mortem, Microbiológicos, Físico-Químicos, Validação PPHO/CIP, Bem-Estar Animal e PNCRC (Contaminantes).</li>
            <li style={{ marginBottom: "8px" }}><strong>Varejo e Açougues:</strong> Temperatura de Câmaras Frias, Recebimento (SIF), ASO e Limpeza de Caixa D'água.</li>
            <li style={{ marginBottom: "8px" }}><strong>Veterinária Clínica:</strong> Laudo Andrológico, Ultrassonografia, Atestados Sanitários.</li>
            <li><strong>Defesa Profissional (CRMV):</strong> Termos de Constatação e Recomendação (TCR) e Laudos Informativos (denúncias).</li>
          </ul>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 4 */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LocalOfferIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>4. Rotulagem MAPA / ANVISA</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Um "robô" inteligente focado em legislação de embalagens (RDC 429/2020 e 727/2022).
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Como usar:</strong> Digite os teores da tabela nutricional (Sódio, Gordura, Açúcar Adicionado) por 100g ou 100ml.
          </Typography>
          <Typography variant="body2">
            <strong>Lupa Frontal (FOP):</strong> O sistema calculará automaticamente se os limites foram estourados. Se sim, ele emite um alerta enorme exigindo a inserção do selo "ALTO EM..." no rótulo frontal, evitando multas milionárias por infração sanitária.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 5 */}
      <Accordion sx={{ borderRadius: "12px !important", mb: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AutoAwesomeIcon sx={{ color: COR }} />
            <Typography fontWeight={700}>5. Assistente de IA / Guia de Consultoria</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Sua segunda mente. Um assistente IA especialista em Legislação Sanitária.
          </Typography>
          <Typography variant="body2">
            <strong>O que faz:</strong> Permite que você tire dúvidas complexas sobre resoluções e normativas. Ex: "A RDC 216 permite pias de acionamento manual na desossa?" A IA do Vertos é parametrizada para atuar como um auditor sênior, fundamentando decisões em decretos vigentes.
          </Typography>
        </AccordionDetails>
      </Accordion>

    </Box>
  );
}
