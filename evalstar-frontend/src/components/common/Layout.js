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
  Avatar,
  Chip,
  Badge,
  Tooltip,
  Fade,
  Slide,
  useTheme,
  alpha,
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
  AdminPanelSettings,
  Notifications,
  Settings,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { USER_TYPES } from '../../utils/constants';

const drawerWidth = 280;
const collapsedDrawerWidth = 72;

function Layout({ children }) {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerCollapse = () => {
    setDrawerCollapsed(!drawerCollapsed);
  };

  // Get user type configuration
  const getUserTypeConfig = () => {
    switch (userType) {
      case USER_TYPES.ADMIN:
        return {
          color: '#1976d2',
          gradient: 'linear-gradient(135deg, #1976d2, #1565c0)',
          icon: <AdminPanelSettings />,
          label: 'Administrateur',
          title: 'Panneau d\'administration'
        };
      case USER_TYPES.TEACHER:
        return {
          color: '#2e7d32',
          gradient: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
          icon: <PersonIcon />,
          label: 'Enseignant',
          title: 'Panneau enseignant'
        };
      case USER_TYPES.STUDENT:
        return {
          color: '#ed6c02',
          gradient: 'linear-gradient(135deg, #ed6c02, #e65100)',
          icon: <SchoolIcon />,
          label: 'Étudiant',
          title: 'Portail étudiant'
        };
      default:
        return {
          color: '#1976d2',
          gradient: 'linear-gradient(135deg, #1976d2, #1565c0)',
          icon: <PersonIcon />,
          label: 'Utilisateur',
          title: 'Tableau de bord'
        };
    }
  };

  // Définir les éléments de navigation selon le type d'utilisateur
  const getNavItems = () => {
    switch (userType) {
      case USER_TYPES.ADMIN:
        return [
          { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin/dashboard', badge: null },
          { text: 'Enseignants', icon: <PersonIcon />, path: '/admin/teachers', badge: null },
          { text: 'Étudiants', icon: <GroupIcon />, path: '/admin/students', badge: null },
          { text: 'Niveaux', icon: <SchoolIcon />, path: '/admin/levels', badge: null },
          { text: 'Groupes', icon: <GroupIcon />, path: '/admin/groups', badge: null },
          { text: 'Matières', icon: <BookIcon />, path: '/admin/subjects', badge: null },
          //{ text: 'Evaluations', icon: <AssignmentIcon />, path: '/admin/tasks', badge: null },
        ];
      case USER_TYPES.TEACHER:
        return [
          { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/teacher/dashboard', badge: null },
          { text: 'Mes groupes', icon: <GroupIcon />, path: '/teacher/groups', badge: 3 },
          { text: 'Mes Evaluations', icon: <AssignmentIcon />, path: '/teacher/tasks', badge: null },
          { text: 'Créer une Evaluation', icon: <AddIcon />, path: '/teacher/tasks/create', badge: null },
        ];
      case USER_TYPES.STUDENT:
        return [
          { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/student/dashboard', badge: null },
          { text: 'Mes Evaluations', icon: <AssignmentIcon />, path: '/student/tasks', badge: 2 },
          { text: 'Classement de la classe', icon: <StarIcon />, path: '/student/ranking', badge: null },
        ];
      default:
        return [];
    }
  };

  const userConfig = getUserTypeConfig();

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRight: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: userConfig.gradient,
          color: 'white',
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,255,255,0.3)',
                width: drawerCollapsed ? 40 : 48,
                height: drawerCollapsed ? 40 : 48,
                mr: drawerCollapsed ? 0 : 2,
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <StarIcon sx={{ fontSize: drawerCollapsed ? 20 : 24 }} />
            </Avatar>
            {!drawerCollapsed && (
              <Fade in={!drawerCollapsed} timeout={300}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  EvalStar
                </Typography>
              </Fade>
            )}
          </Box>
          
          {!drawerCollapsed && (
            <Fade in={!drawerCollapsed} timeout={400}>
              <Chip
                icon={userConfig.icon}
                label={userConfig.label}
                size="small"
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'white',
                  },
                }}
              />
            </Fade>
          )}
        </Box>

        {/* Collapse Button */}
        <IconButton
          onClick={handleDrawerCollapse}
          sx={{
            position: 'absolute',
            right: -16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            width: 32,
            height: 32,
            '&:hover': {
              background: '#f5f5f5',
              transform: 'translateY(-50%) scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          {drawerCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ p: 2, flex: 1 }}>
        <List sx={{ p: 0 }}>
          {getNavItems().map((item, index) => (
            <Slide
              key={item.text}
              direction="right"
              in
              timeout={300 + index * 100}
            >
              <ListItem sx={{ p: 0, mb: 1 }}>
                <Tooltip
                  title={drawerCollapsed ? item.text : ''}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      px: drawerCollapsed ? 1.5 : 2,
                      minHeight: 48,
                      transition: 'all 0.3s ease-in-out',
                      position: 'relative',
                      overflow: 'hidden',
                      '&.Mui-selected': {
                        background: `linear-gradient(135deg, ${userConfig.color}15, ${userConfig.color}08)`,
                        borderLeft: `4px solid ${userConfig.color}`,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(90deg, ${userConfig.color}20, transparent)`,
                        },
                        '& .MuiListItemIcon-root': {
                          color: userConfig.color,
                        },
                        '& .MuiListItemText-primary': {
                          fontWeight: 600,
                          color: userConfig.color,
                        },
                      },
                      '&:hover': {
                        background: `${userConfig.color}08`,
                        transform: 'translateX(4px)',
                        boxShadow: `0 4px 12px ${userConfig.color}20`,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: drawerCollapsed ? 0 : 40,
                        mr: drawerCollapsed ? 0 : 1,
                        justifyContent: 'center',
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      <Badge
                        badgeContent={item.badge}
                        color="error"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.6rem',
                            height: 16,
                            minWidth: 16,
                          },
                        }}
                      >
                        {item.icon}
                      </Badge>
                    </ListItemIcon>
                    {!drawerCollapsed && (
                      <Fade in={!drawerCollapsed} timeout={200}>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: 500,
                          }}
                        />
                      </Fade>
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            </Slide>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <Tooltip
          title={drawerCollapsed ? 'Déconnexion' : ''}
          placement="right"
          arrow
        >
          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: drawerCollapsed ? 1.5 : 2,
              minHeight: 48,
              color: '#dc2626',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                background: '#dc262610',
                transform: 'translateX(4px)',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: drawerCollapsed ? 0 : 40,
                mr: drawerCollapsed ? 0 : 1,
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!drawerCollapsed && (
              <Fade in={!drawerCollapsed} timeout={200}>
                <ListItemText
                  primary="Déconnexion"
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                />
              </Fade>
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: {
            sm: `calc(100% - ${drawerCollapsed ? collapsedDrawerWidth : drawerWidth}px)`
          },
          ml: {
            sm: `${drawerCollapsed ? collapsedDrawerWidth : drawerWidth}px`
          },
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          color: 'text.primary',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: 'none' },
              background: alpha(userConfig.color, 0.1),
              '&:hover': {
                background: alpha(userConfig.color, 0.2),
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              background: userConfig.gradient,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {userConfig.title}
          </Typography>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              

              

              {/* User Info */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  background: alpha(userConfig.color, 0.1),
                  borderRadius: 3,
                  py: 1,
                  px: 2,
                  border: `1px solid ${alpha(userConfig.color, 0.2)}`,
                }}
              >
                <Avatar
                  sx={{
                    background: userConfig.gradient,
                    width: 36,
                    height: 36,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </Avatar>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      lineHeight: 1.2,
                      color: 'text.primary',
                    }}
                  >
                    {user.first_name} {user.last_name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                    }}
                  >
                    {userConfig.label}
                  </Typography>
                </Box>
              </Box>

              {/* Logout Button */}
              <Button
                color="inherit"
                onClick={logout}
                startIcon={<LogoutIcon />}
                sx={{
                  color: '#dc2626',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    background: '#dc262610',
                  },
                  display: { xs: 'none', lg: 'flex' },
                }}
              >
                Déconnexion
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{
          width: { sm: drawerCollapsed ? collapsedDrawerWidth : drawerWidth },
          flexShrink: { sm: 0 },
          transition: 'width 0.3s ease-in-out',
        }}
        aria-label="navigation menu"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerCollapsed ? collapsedDrawerWidth : drawerWidth,
              border: 'none',
              transition: 'width 0.3s ease-in-out',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            sm: `calc(100% - ${drawerCollapsed ? collapsedDrawerWidth : drawerWidth}px)`
          },
          mt: 10,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          minHeight: '100vh',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Fade in timeout={600}>
          <Box>{children}</Box>
        </Fade>
      </Box>
    </Box>
  );
}

export default Layout;