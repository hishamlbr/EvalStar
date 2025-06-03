// src/components/common/Layout.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  ExitToApp as LogoutIcon,
  StarRate as StarIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { USER_TYPES } from '../../utils/constants';

const drawerWidth = 240;

function Layout({ children }) {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Définir les éléments de navigation selon le type d'utilisateur
  const getNavItems = () => {
    switch (userType) {
      case USER_TYPES.ADMIN:
        return [
          { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin/dashboard' },
          { text: 'Enseignants', icon: <PersonIcon />, path: '/admin/teachers' },
          { text: 'Étudiants', icon: <GroupIcon />, path: '/admin/students' },
          { text: 'Niveaux', icon: <SchoolIcon />, path: '/admin/levels' },
          { text: 'Groupes', icon: <GroupIcon />, path: '/admin/groups' },
          { text: 'Matières', icon: <BookIcon />, path: '/admin/subjects' },
          //{ text: 'Evaluations', icon: <AssignmentIcon />, path: '/admin/tasks' },
        ];
      case USER_TYPES.TEACHER:
        return [
          { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/teacher/dashboard' },
          { text: 'Mes groupes', icon: <GroupIcon />, path: '/teacher/groups' },
          { text: 'Mes Evaluations', icon: <AssignmentIcon />, path: '/teacher/tasks' },
          { text: 'Créer une Evaluation', icon: <AddIcon />, path: '/teacher/tasks/create' },
        ];
      case USER_TYPES.STUDENT:
        return [
          { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/student/dashboard' },
          { text: 'Mes Evaluations', icon: <AssignmentIcon />, path: '/student/tasks' },
          { text: 'Classement de la classe', icon: <StarIcon />, path: '/student/ranking' },
        ];
      default:
        return [];
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          EvalStar
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getNavItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {userType === USER_TYPES.ADMIN && 'Panneau d\'administration'}
            {userType === USER_TYPES.TEACHER && 'Panneau enseignant'}
            {userType === USER_TYPES.STUDENT && 'Portail étudiant'}
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {user.first_name} {user.last_name}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Déconnexion
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Meilleure performance sur mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
