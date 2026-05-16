import React from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Termos() {
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
        Termos de Uso — VERTOS OS
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={4}>
        Versão 1.0 · Vigência a partir de maio de 2025
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {[
        {
          titulo: "1. Aceitação",
          texto: `Ao criar uma conta no VERTOS OS, você declara ter lido, compreendido e concordado com estes Termos de Uso. Caso não concorde, não utilize o serviço.`
        },
        {
          titulo: "2. Descrição do serviço",
          texto: `O VERTOS OS é uma plataforma SaaS de gestão de compliance sanitário veterinário, voltada para Responsáveis Técnicos (RTs) e clínicas veterinárias. Oferece ferramentas de auditoria, geração de documentos, análise legislativa via inteligência artificial e controle de prazos regulatórios.`
        },
        {
          titulo: "3. Cadastro e responsabilidade",
          texto: `O usuário é responsável pela veracidade das informações cadastas, pela confidencialidade de sua senha e por todas as atividades realizadas em sua conta. Em caso de uso não autorizado, notifique-nos imediatamente.`
        },
        {
          titulo: "4. Uso permitido",
          texto: `O VERTOS OS é licenciado para uso profissional individual ou empresarial, conforme o plano contratado. É vedado: (a) compartilhar credenciais entre múltiplos usuários não autorizados; (b) reproduzir, revender ou sublicenciar o software; (c) utilizar o sistema para fins ilícitos ou que violem normas sanitárias.`
        },
        {
          titulo: "5. Inteligência artificial",
          texto: `As análises geradas pela IA do VERTOS OS têm caráter informativo e de apoio à decisão. Não substituem a avaliação técnica do Responsável Técnico nem constituem parecer jurídico. O usuário é o único responsável pelas decisões tomadas com base nas análises geradas.`
        },
        {
          titulo: "6. Planos e pagamentos",
          texto: `Os planos pagos são cobrados via Hotmart. O cancelamento pode ser feito a qualquer momento e tem efeito ao final do período já pago. Reembolsos seguem a política da Hotmart (7 dias de garantia para compras online, conforme CDC Art. 49).`
        },
        {
          titulo: "7. Disponibilidade",
          texto: `Nos empenhamos para manter o serviço disponível 24/7, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência.`
        },
        {
          titulo: "8. Limitação de responsabilidade",
          texto: `O VERTOS OS não se responsabiliza por autuações, multas ou sanções sanitárias decorrentes de informações incorretas fornecidas pelo usuário, ou do não atendimento às exigências regulatórias identificadas pela plataforma.`
        },
        {
          titulo: "9. Alterações",
          texto: `Estes termos podem ser atualizados. Notificaremos usuários ativos por e-mail com 15 dias de antecedência. O uso contínuo após a vigência das mudanças implica aceitação.`
        },
        {
          titulo: "10. Foro",
          texto: `Fica eleito o foro da Comarca de Campo Grande/MS para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia a qualquer outro, por mais privilegiado que seja.`
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
        Dúvidas sobre estes termos: suporte@vetflow.app.br
      </Typography>
    </Box>
  );
}
