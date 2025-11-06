import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../services/authService';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logOut();
    handleMenuClose();
    navigate('/auth/login');
  };

  const getInitials = (email) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            Passion Project
          </Typography>
          {user && (
            <Button
              color="inherit"
              onClick={() => navigate('/locations')}
              sx={{ mr: 2 }}
            >
              Locations
            </Button>
          )}
          {user ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {user.email}
                </Typography>
                <Avatar
                  sx={{ bgcolor: 'secondary.main', cursor: 'pointer' }}
                  onClick={handleMenuOpen}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.email} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    getInitials(user.email)
                  )}
                </Avatar>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={() => navigate('/auth/login')}>
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;

