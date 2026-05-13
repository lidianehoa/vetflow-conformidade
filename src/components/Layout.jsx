import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Avatar, Chip, Tooltip,
  Select, MenuItem, FormControl, Button, AppBar, Toolbar, IconButton,
  Badge, Menu, Grid,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ChecklistIcon from "@mui/icons-material/Checklist";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BusinessIcon from "@mui/icons-material/Business";
import LogoutIcon from "@mui/icons-material/Logout";
import TableViewIcon from "@mui/icons-material/TableView";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ScienceIcon from "@mui/icons-material/Science";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useUserData } from "./ProtectedRoute";
import { usePlano, LABEL_PLANO } from "../hooks/usePlano";
import { VENCIMENTOS_POR_TIPO } from "../data/checklistsRT";
import { getAreaById } from "../data/rtTypes";

const DRAWER_WIDTH = 220;

const MENU_ITEMS = [
  { label: "⚡ Cockpit",          icon: <DashboardIcon />,          path: "/dashboard",       recurso: "dashboard" },
  { label: "🏢 Estabelecimentos", icon: <BusinessCenterIcon />,     path: "/central-rt",     recurso: null },
  { label: "✅ Auditar",          icon: <AssignmentIcon />,         path: "/auditorias",      recurso: "novaAuditoria", badge: "PRINCIPAL" },
  { label: "📋 Rotina Diária",    icon: <CalendarMonthIcon />,      path: "/rotina",         recurso: null },
  { label: "📁 Documentação",     icon: <FolderIcon />,             path: "/documentacao",    recurso: null },
  { label: "💊 SIPEAGRO / GTA",   icon: <ScienceIcon />,            path: "/controlados",    recurso: null },
  { label: "👤 Meu Perfil",       icon: <BusinessIcon />,           path: "/perfil",         recurso: null },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useUserData();
  const { pode, label: planLabel, plan } = usePlano(userData);
  const [clinicas, setClinicas] = useState([]);
  const [loadingClinicas, setLoadingClinicas] = useState(true);
  const [anchorNotif, setAnchorNotif] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);

  // Busca de alertas reais
  useEffect(() => {
    if (!userData?.selectedClinicaId) return;
    const fetchAlerts = async () => {
      const alerts = [];
      const hoje = new Date();

      // 1. Vencimentos da Clínica selecionada
      if (userData?.selectedClinicaId && typeof userData.selectedClinicaId === 'string' && userData.selectedClinicaId.trim() !== '') {
        const cSnap = await getDoc(doc(db, "clinicas", userData.selectedClinicaId));
        if (cSnap.exists()) {
          const d = cSnap.data();
          const camposVenc = VENCIMENTOS_POR_TIPO[d.tipo] || [];
          
          camposVenc.forEach(c => {
            if (d[c.campo]) {
              const v = new Date(d[c.campo]);
              const diff = (v - hoje) / (1000 * 60 * 60 * 24);
              if (diff <= 0) {
                alerts.push({ id: c.campo, titulo: "VENCIDO", desc: `${c.label} expirou!`, tipo: "error" });
              } else if (diff <= (c.diasAlerta || 30)) {
                alerts.push({ id: c.campo, titulo: "Vencimento", desc: `${c.label} vence em ${Math.ceil(diff)}d`, tipo: "warning" });
              }
            }
          });
        }
      }

      // 2. Estoque de Controlados
      if (userData?.uid) {
        const qE = query(collection(db, "controlados", userData.uid, "estoque"), where("status", "==", "ativo"));
        const eSnap = await getDocs(qE);
        eSnap.forEach(docE => {
          const item = docE.data();
          if (item.volumeTotal > 0 && (item.volumeRestante / item.volumeTotal) <= 0.1) {
            alerts.push({ id: docE.id, titulo: "Estoque Baixo", desc: `${item.substancia} (< 10%)`, tipo: "warning" });
          }
        });
      }

      // 3. Documentos Pessoais do RT (User Profile)
      const camposRT = [
        { key: "vencArtPessoal",          label: "A.R.T. Pessoal (1562/23)" },
        { key: "vencCertificadoPessoal",  label: "Certificado de Regularidade" },
        { key: "vencCarteiraCrmv",        label: "Cédula CRMV" }
      ];
      camposRT.forEach(c => {
        if (userData[c.key]) {
          const v = new Date(userData[c.key]);
          const diff = (v - hoje) / (1000 * 60 * 60 * 24);
          if (diff <= 0) alerts.push({ id: c.key, titulo: "RT: VENCIDO", desc: `${c.label} expirou!`, tipo: "error" });
          else if (diff <= 30) alerts.push({ id: c.key, titulo: "RT: Vencimento", desc: `${c.label} vence em ${Math.ceil(diff)}d`, tipo: "warning" });
        }
      });

      setNotificacoes(alerts);
    };
    fetchAlerts();
  }, [userData?.selectedClinicaId, userData?.uid]);

  useEffect(() => {
    if (!userData?.uid) return;
    (async () => {
      try {
        const q = query(collection(db, "clinicas"), where("userId", "==", userData.uid));
        const snap = await getDocs(q);
        const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setClinicas(lista);
        
        // Se não tiver nada selecionado mas tiver clínicas, seleciona a primeira
        if (!userData.selectedClinicaId && lista.length > 0) {
          userData.setSelectedClinicaId(lista[0].id);
        }
      } catch (e) {
        console.error("Erro ao carregar clínicas no layout:", e);
      } finally {
        setLoadingClinicas(false);
      }
    })();
  }, [userData?.uid]);

  const clinicaAtiva = clinicas.find(c => c.id === userData?.selectedClinicaId);
  const area = clinicaAtiva?.tipo ? getAreaById(clinicaAtiva.tipo) : null;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const planColor = userData?.role === "admin" 
    ? "#6a1b9a" // Roxo para Admin
    : {
        trial:   "#0d47a1",
        pro:     "#1b4332",
        expired: "#d32f2f",
        pending: "#757575",
      }[userData?.plan ?? "pending"];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f0fdf4" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #e8f5e9",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Logo / Brand */}
        <Box sx={{ px: 2, py: 2, borderBottom: "1px solid #e8f5e9", textAlign: "center" }}>
          <img 
            src="/logo-verde.png" 
            alt="VERTOS Logo" 
            style={{ width: "100%", maxWidth: "160px", height: "auto" }} 
          />
          <Box mt={1.5}>
            <Typography 
              color="primary" 
              fontWeight={900} 
              sx={{ letterSpacing: 2, textTransform: "uppercase", fontSize: 14, color: "#1b4332" }}
            >
              VERTOS
            </Typography>
          </Box>
          <Box mt={2}>
            <FormControl fullWidth size="small">
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, ml: 0.5, fontSize: 9, textTransform: "uppercase" }}>
                Unidade Ativa
              </Typography>
              <Select
                value={userData?.selectedClinicaId || ""}
                onChange={(e) => userData.setSelectedClinicaId(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: 2,
                  fontSize: 12,
                  fontWeight: 700,
                  bgcolor: "#f9fdfa",
                  "& .MuiSelect-select": { py: 1 },
                }}
              >
                <MenuItem value="" disabled>
                  <Typography variant="caption">Selecione uma unidade...</Typography>
                </MenuItem>
                {clinicas.map((c) => (
                  <MenuItem key={c.id} value={c.id} sx={{ fontSize: 12, fontWeight: 600 }}>
                    {c.nomeFantasia || c.razaoSocial}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {clinicaAtiva && area && (
              <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Chip
                  label={`${area.emoji} ${area.label.split("—")[0].trim()}`}
                  size="small"
                  sx={{
                    background: area.bg,
                    color: area.cor,
                    fontWeight: 700,
                    fontSize: 10,
                    height: 20,
                    borderRadius: 1,
                    "& .MuiChip-label": { px: 1 }
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Menu */}
        <List sx={{ flex: 1, py: 1.5, px: 1 }}>
          {MENU_ITEMS.map((item) => {
            // Oculta itens baseados em permissões
            if (item.recurso && !pode(item.recurso)) return null;

            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    background: isActive ? "rgba(82,183,136,0.10)" : "transparent",
                    "&:hover": { background: "rgba(82,183,136,0.06)" },
                    py: 1,
                    px: 1.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 34,
                      color: isActive ? "#1b4332" : "#90a4ae",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        {item.label}
                        {item.badge && (
                          <Chip label={item.badge} size="small" sx={{ height: 16, fontSize: 8, fontWeight: 900, bgcolor: "#1b4332", color: "#fff" }} />
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#1b4332" : "#546e7a",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ mx: 2, opacity: 0.5 }} />
        
        <List sx={{ px: 1, py: 1 }}>
          <ListItem disablePadding>
            <ListItemButton
              component="a"
              href="https://vetflow.app.br/manual-vertos/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderRadius: 2,
                "&:hover": { background: "rgba(82,183,136,0.06)" },
                py: 1,
                px: 1.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: "#90a4ae" }}>
                <HelpOutlineIcon />
              </ListItemIcon>
              <ListItemText
                primary="Manual do Usuário"
                primaryTypographyProps={{ fontSize: 13, fontWeight: 500, color: "#546e7a" }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        {/* Bottom: user info + logout */}
        <Box sx={{ borderTop: "1px solid #e8f5e9", p: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, px: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#1b4332", fontSize: 13 }}>
              {(userData?.displayName || userData?.email || "U")[0].toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: "hidden" }}>
              <Typography variant="caption" fontWeight={600} color="#1b4332" noWrap display="block">
                {userData?.displayName || "Usuário"}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block" fontSize={10}>
                {userData?.email}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ px: 0.5, mb: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
              <Typography variant="caption" fontWeight={800} sx={{ fontSize: 9, color: "#90a4ae", textTransform: "uppercase" }}>
                Plano Atual
              </Typography>
              <Chip 
                label={planLabel} 
                size="small" 
                sx={{ 
                  height: 18, fontSize: 9, fontWeight: 800, 
                  bgcolor: plan === "pro" ? "#1b4332" : "#f0fdf4", 
                  color: plan === "pro" ? "#fff" : "#1b4332",
                  border: "1px solid #1b433230"
                }} 
              />
            </Box>
            {plan === "core" && (
              <Button
                variant="contained"
                fullWidth
                size="small"
                onClick={() => navigate("/pagamento")}
                sx={{ 
                  bgcolor: "#1b4332", color: "#fff", fontSize: 10, fontWeight: 900, 
                  borderRadius: 2, mt: 0.5, py: 0.5,
                  "&:hover": { bgcolor: "#2d6a4f" }
                }}
              >
                UPGRADE PRO
              </Button>
            )}
          </Box>

          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 0.8,
              px: 1.5,
              color: "#d32f2f",
              "&:hover": { background: "rgba(211,47,47,0.05)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: "#d32f2f" }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Sair"
              primaryTypographyProps={{ fontSize: 13, fontWeight: 600, color: "#d32f2f" }}
            />
          </ListItemButton>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: "100vh",
          background: "#f0fdf4",
          overflow: "auto",
        }}
      >
        <AppBar 
          position="sticky" 
          elevation={0} 
          sx={{ background: "transparent", backdropFilter: "blur(8px)", borderBottom: "1px solid #e8f5e9" }}
        >
          <Toolbar sx={{ justifyContent: "flex-end", gap: 2 }}>
            <IconButton onClick={(e) => setAnchorNotif(e.currentTarget)}>
              <Badge badgeContent={notificacoes.length} color="error">
                <NotificationsIcon sx={{ color: "#1b4332" }} />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={anchorNotif}
              open={Boolean(anchorNotif)}
              onClose={() => setAnchorNotif(null)}
              PaperProps={{ sx: { width: 320, borderRadius: 3, mt: 1, maxHeight: 400, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" } }}
            >
              <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle2" fontWeight={800} color="#1b4332">Notificações de Compliance</Typography>
                <Chip label={notificacoes.length} size="small" sx={{ bgcolor: "#1b4332", color: "#fff", fontWeight: 700 }} />
              </Box>
              <Divider />
              <List sx={{ p: 0 }}>
                {notificacoes.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary">Tudo em conformidade! ✅</Typography>
                  </Box>
                ) : (
                  notificacoes.map((n) => (
                    <ListItem key={n.id} divider sx={{ "&:hover": { bgcolor: "#f9fdfa" } }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {n.tipo === "error" ? <ErrorIcon color="error" /> : <WarningIcon color="warning" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={n.titulo} 
                        secondary={n.desc}
                        primaryTypographyProps={{ fontSize: 12, fontWeight: 700, color: n.tipo === "error" ? "#d32f2f" : "#f59e0b" }}
                        secondaryTypographyProps={{ fontSize: 11 }}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 0, minHeight: "calc(100vh - 64px)" }}>
          <Outlet />
        </Box>

        {/* Footer Jurídico & Blindagem 360° */}
        <Box 
          component="footer" 
          sx={{ 
            p: 3, 
            bgcolor: "#fff", 
            borderTop: "1px solid #e8f5e9", 
            textAlign: "center" 
          }}
        >
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="text.secondary">
                © {new Date().getFullYear()} VERTOS RT OS — Blindagem 360° (v2023.1)
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button 
                size="small" 
                href="https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" 
                target="_blank"
                sx={{ fontSize: 10, color: "#1b4332", fontWeight: 700, textTransform: "none" }}
              >
                Código de Defesa do Consumidor (CDC)
              </Button>
              <Button 
                size="small" 
                onClick={() => navigate("/suporte")}
                sx={{ fontSize: 10, color: "#1b4332", fontWeight: 700, textTransform: "none" }}
              >
                Ouvidoria RT
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ color: "#52b788", fontWeight: 800 }}>
                🛡️ Sistema em conformidade com as novas diretrizes CFMV/MAPA 2023.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
