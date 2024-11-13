import Box from '@mui/material/Box';
import { styled, SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import MuiDrawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';

import { useStore } from '@nanostores/react';
import { getPagePath } from '@nanostores/router';
import { $router } from '../router';

import logo from '../assets/logo-v1.png';

function Logo({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box
      width={240}
      sx={{
        display: 'flex',
        bgcolor: 'background.secondary',
        padding: '10px',
        ...sx,
      }}
    >
      <Box
        width={48}
        height={48}
        bgcolor="#D9D9D9"
        borderRadius={1.5}
        marginRight={1}
        overflow="hidden"
      >
        <img src={logo} width={48} height={48} alt="Budget Mind Logo" />
      </Box>
      <Box textAlign="left">
        <Typography noWrap fontSize={18} fontWeight="bold" color="text.primary">
          Budget Mind
        </Typography>
        <Typography noWrap fontSize={14} color="text.secondary" lineHeight={1}>
          Personal finance
        </Typography>
      </Box>
    </Box>
  );
}

const drawerWidth = 240;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

function MainMenu() {
  const page = useStore($router);

  return (
    <List component="nav" sx={{ flexGrow: 1 }}>
      <ListItemButton
        href={getPagePath($router, 'dashboard')}
        selected={page?.route === 'dashboard'}
      >
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>
      <ListItemButton
        href={getPagePath($router, 'transactions')}
        selected={page?.route === 'transactions'}
      >
        <ListItemIcon>
          <ReceiptLongIcon />
        </ListItemIcon>
        <ListItemText primary="Transactions" />
      </ListItemButton>
      <ListItemButton
        href={getPagePath($router, 'reports')}
        selected={page?.route === 'reports'}
      >
        <ListItemIcon>
          <AssessmentIcon />
        </ListItemIcon>
        <ListItemText primary="Reports" />
      </ListItemButton>
    </List>
  );
}

function SecondaryMenu() {
  const page = useStore($router);

  return (
    <List component="nav" sx={{ paddingBottom: '24px' }}>
      <Divider sx={{ my: 1 }} />
      <ListSubheader
        component="div"
        inset
        sx={{
          bgcolor: 'inherit',
          paddingLeft: '16px',
          textTransform: 'uppercase',
        }}
      >
        General
      </ListSubheader>
      <ListItemButton
        href={getPagePath($router, 'settings')}
        selected={page?.route === 'settings'}
      >
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItemButton>
      <ListItemButton>
        <ListItemIcon>
          <InfoIcon />
        </ListItemIcon>
        <ListItemText primary="Support" />
      </ListItemButton>
    </List>
  );
}

export default function MenuSidebar() {
  return (
    <Drawer
      variant="permanent"
      open
      PaperProps={{
        sx: { bgcolor: 'background.secondary', border: 0, zIndex: 1 },
      }}
    >
      <Logo
        sx={{
          height: '68px',
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
        }}
      />
      <MainMenu />
      <SecondaryMenu />
    </Drawer>
  );
}
