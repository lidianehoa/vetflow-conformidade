import React from "react";
import { Box, Typography, Grid, Card, CardActionArea, CardContent, Button } from "@mui/material";
import { TIPOS_LAUDO } from "../data/laudoTypes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate } from "react-router-dom";

const COR = "#1b4332";

export default function NovaLaudoSelecao() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate("/laudos")}
          sx={{ color: COR, fontWeight: 700 }}
        >
          Voltar
        </Button>
        <Typography variant="h5" fontWeight={900} color={COR}>Selecione o Tipo de Laudo</Typography>
      </Box>

      <Grid container spacing={3}>
        {TIPOS_LAUDO.map((tipo) => (
          <Grid item xs={12} sm={6} md={4} key={tipo.id}>
            <Card 
              elevation={0} 
              sx={{ 
                height: "100%", 
                borderRadius: "16px", 
                border: "1px solid #e8f5e9",
                transition: "all 0.2s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 20px rgba(27,67,50,0.08)" }
              }}
            >
              <CardActionArea 
                onClick={() => navigate(`/laudos/emitir/${tipo.id}`)}
                sx={{ height: "100%", p: 1 }}
              >
                <CardContent>
                  <Box sx={{ 
                    width: 48, height: 48, borderRadius: "12px", bgcolor: "#f1f8f5", 
                    display: "flex", alignItems: "center", justifyContent: "center", mb: 2 
                  }}>
                    <DescriptionIcon sx={{ color: COR }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={800} color={COR} gutterBottom>
                    {tipo.nome}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, lineHeight: 1.4 }}>
                    {tipo.descricao}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COR, fontWeight: 700, bgcolor: "#e8f5e9", px: 1, py: 0.5, borderRadius: 1 }}>
                    {tipo.legislacao}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
