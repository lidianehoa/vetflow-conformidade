import React, { useState, useEffect } from "react";
import { 
  Box, Drawer, AppBar, Toolbar, IconButton, Typography, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Avatar, Button, useMediaQuery, useTheme, Badge, Menu,
  MenuItem, Chip, Stack, Grid, BottomNavigation, BottomNavigationAction,
  Paper as MuiPaper, FormControl
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Folder as FolderIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  HelpOutline as HelpOutlineIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Science as ScienceIcon,
  CalendarMonth as CalendarMonthIcon,
  EmojiEvents as EmojiEventsIcon,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useUserData } from "./ProtectedRoute";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { usePlano } from "../hooks/usePlano";
import { getAreaById } from "../data/rtTypes";
import ClinicaSelector from "./ClinicaSelector";

const DRAWER_WIDTH = 260;

const MENU_ITEMS = [
  { label: "Cockpit",             icon: <DashboardIcon />,          path: "/dashboard" },
  { label: "✅ Auditar",          icon: <AssignmentIcon />,         path: "/auditorias",      recurso: "novaAuditoria", badge: "PRINCIPAL" },
  { label: "📂 Documentação",     icon: <FolderIcon />,             path: "/documentacao",    recurso: "documentos" },
  { label: "💊 Controlados",      icon: <ScienceIcon />,            path: "/controlados",     recurso: "controlados" },
  { label: "📅 Rotina Diária",    icon: <CalendarMonthIcon />,      path: "/rotina" },
  { label: "🏥 Minhas Clínicas",   icon: <BusinessIcon />,           path: "/clinicas" },
  { label: "🏆 Conquistas",       icon: <EmojiEventsIcon />,        path: "/conquistas" },
  { label: "👤 Meu Perfil",       icon: <PersonIcon />,             path: "/perfil" },
];

export default function Layout() {
  const userData = useUserData();
  const { pode } = usePlano(userData);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [anchorNotif, setAnchorNotif] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    if (!userData?.uid || !userData?.selectedClinicaId) return;

    const q = query(
      collection(db, "notificacoes"),
      where("tenantId", "==", userData.uid), // Isolamento multi-tenant
      where("clinicaId", "==", userData.selectedClinicaId),
      orderBy("criadoEm", "desc"),
      limit(5)
    );

    return onSnapshot(q, (snap) => {
      setNotificacoes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [userData?.uid, userData?.selectedClinicaId]);

  const clinicaAtiva = (userData?.clinicas || []).find(c => c.id === userData?.selectedClinicaId);
  const area = clinicaAtiva ? getAreaById(clinicaAtiva.tipo) : null;
  const planLabel = userData?.role === "admin" ? "ADMIN" : (userData?.plan || "trial").toUpperCase();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
          <ClinicaSelector />

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
          if (item.recurso && !pode(item.recurso)) return null;

          const isActive = location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
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
                bgcolor: userData?.plan === "pro" ? "#1b4332" : "#f0fdf4", 
                color: userData?.plan === "pro" ? "#fff" : "#1b4332",
                border: "1px solid #1b433230"
              }} 
            />
          </Box>
          {userData?.plan === "core" && (
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
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#f0fdf4" }}>
      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid #e8f5e9",
              background: "#fff",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid #e8f5e9",
              background: "#fff",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

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
          sx={{ background: "#fff", backdropFilter: "blur(8px)", borderBottom: "1px solid #e8f5e9" }}
        >
          <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, color: "#1b4332" }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="subtitle1" fontWeight={900} color="#1b4332">VERTOS</Typography>
            </Box>

            <Box sx={{ flex: 1, display: { xs: "none", md: "block" } }}>
              <ClinicaSelector />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={(e) => setAnchorNotif(e.currentTarget)}>
                <Badge badgeContent={notificacoes.length} color="error">
                  <NotificationsIcon sx={{ color: "#1b4332" }} />
                </Badge>
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorNotif}
              open={Boolean(anchorNotif)}
              onClose={() => setAnchorNotif(null)}
              PaperProps={{ sx: { width: 320, borderRadius: 3, mt: 1, maxHeight: 400, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" } }}
            >
              <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle2" fontWeight={800} color="#1b4332">Notificações</Typography>
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

        <Box sx={{ p: 0, minHeight: "calc(100vh - 64px)", pb: { xs: 8, md: 0 } }}>
          <Outlet />
        </Box>

        {/* Bottom Navigation for Mobile */}
        {isMobile && (
          <MuiPaper sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
            <BottomNavigation
              showLabels
              value={location.pathname}
              onChange={(event, newValue) => navigate(newValue)}
              sx={{ borderTop: "1px solid #e8f5e9" }}
            >
              <BottomNavigationAction label="Cockpit" value="/dashboard" icon={<DashboardIcon />} />
              <BottomNavigationAction label="Auditar" value="/auditorias" icon={<AssignmentIcon />} />
              <BottomNavigationAction label="Docs" value="/documentacao" icon={<FolderIcon />} />
              <BottomNavigationAction label="Perfil" value="/perfil" icon={<BusinessIcon />} />
            </BottomNavigation>
          </MuiPaper>
        )}

        {/* Footer */}
        <Box component="footer" sx={{ p: 3, bgcolor: "#fff", borderTop: "1px solid #e8f5e9", textAlign: "center", display: { xs: "none", md: "block" } }}>
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="text.secondary">
                © {new Date().getFullYear()} VERTOS RT OS — Blindagem 360°
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button size="small" href="https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" target="_blank" sx={{ fontSize: 10, color: "#1b4332", fontWeight: 700, textTransform: "none" }}>
                CDC
              </Button>
              <Button 
                size="small" 
                component="a"
                href="mailto:contato@vetflow.app.br?subject=Suporte Técnico - VERTOS OS"
                sx={{ fontSize: 10, color: "#1b4332", fontWeight: 700, textTransform: "none" }}
              >
                Suporte
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ color: "#52b788", fontWeight: 800 }}>
                🛡️ Sistema CFMV/MAPA 2023.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
