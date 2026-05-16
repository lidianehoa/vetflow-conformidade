import React from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Privacidade() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 760, mx: "auto", py: 6, px: 3 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 4, color: "#1b4332", fontWeight: 700 }}
      >
        Voltar
      </Button>

      <Typography variant="h4" fontWeight={900} color="#1b4332" gutterBottom>
        Política de Privacidade — VERTOS OS
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={4}>
        Versão 1.0 · Em conformidade com a LGPD (Lei 13.709/2018)
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {[
        {
          titulo: "1. Controlador dos dados",
          texto: `Os dados pessoais coletados pelo VERTOS OS são controlados por Vet.Flow App, com sede em Campo Grande/MS. Contato do encarregado (DPO): contato@vetflow.app.br.`
        },
        {
          titulo: "2. Dados coletados",
          texto: `Coletamos: (a) dados de cadastro: nome, e-mail, CRMV, dados da clínica; (b) dados de uso: auditorias realizadas, documentos gerados, logs de acesso; (c) dados de pagamento: processados exclusivamente pela Hotmart — não armazenamos dados de cartão; (d) documentos enviados: PDFs de boletins de vistoria e laudos enviados para análise via IA.`
        },
        {
          titulo: "3. Finalidade do tratamento",
          texto: `Seus dados são utilizados para: prestação do serviço de compliance veterinário; geração de análises por inteligência artificial; envio de alertas de vencimentos e comunicações do sistema; cumprimento de obrigações legais; melhoria contínua da plataforma.`
        },
        {
          titulo: "4. Base legal (LGPD Art. 7)",
          texto: `O tratamento é realizado com base em: (a) execução de contrato — para operar o serviço contratado; (b) consentimento — para comunicações de marketing, revogável a qualquer momento; (c) legítimo interesse — para segurança e prevenção a fraudes; (d) cumprimento de obrigação legal — quando exigido por autoridades competentes.`
        },
        {
          titulo: "5. Compartilhamento de dados",
          texto: `Não vendemos seus dados. Compartilhamos apenas com: Google Firebase (infraestrutura de armazenamento e autenticação); Google AI / Gemini (processamento de documentos para análise legislativa); Hotmart (processamento de pagamentos). Todos os fornecedores operam sob acordos de proteção de dados adequados.`
        },
        {
          titulo: "6. Retenção",
          texto: `Dados de conta são mantidos enquanto a conta estiver ativa. Após encerramento, os dados são anonimizados ou excluídos em até 90 dias, salvo obrigação legal de retenção maior (ex: registros contábeis por 5 anos).`
        },
        {
          titulo: "7. Seus direitos (LGPD Art. 18)",
          texto: `Você tem direito a: confirmar a existência de tratamento; acessar seus dados; corrigir dados incompletos ou incorretos; solicitar anonimização ou exclusão; revogar consentimento; portabilidade dos dados; informação sobre compartilhamento. Exerça seus direitos em: contato@vetflow.app.br.`
        },
        {
          titulo: "8. Segurança",
          texto: `Adotamos medidas técnicas e organizacionais para proteger seus dados: autenticação via Firebase Auth, regras de acesso por tenant (isolamento total entre contas), comunicação criptografada via HTTPS, e trilha de auditoria imutável nos registros críticos.`
        },
        {
          titulo: "9. Cookies",
          texto: `Utilizamos apenas cookies essenciais para autenticação e funcionamento do sistema. Não utilizamos cookies de rastreamento ou publicidade.`
        },
        {
          titulo: "10. Contato e DPO",
          texto: `Para exercer seus direitos ou tirar dúvidas sobre privacidade: contato@vetflow.app.br. Prazo de resposta: até 15 dias úteis.`
        },
      ].map(({ titulo, texto }) => (
        <Box key={titulo} mb={4}>
          <Typography variant="subtitle1" fontWeight={800} color="#1b4332" gutterBottom>
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" lineHeight={1.8} textAlign="justify">
            {texto}
          </Typography>
        </Box>
      ))}

      <Divider sx={{ my: 4 }} />
      <Typography variant="caption" color="text.secondary">
        DPO: contato@vetflow.app.br · Campo Grande/MS
      </Typography>
    </Box>
  );
}
