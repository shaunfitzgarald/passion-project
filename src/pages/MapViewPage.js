import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, AppBar, Tabs, Tab, Fab, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Typography, Badge, Button } from '@mui/material';
import { Map, List, Add, Settings as SettingsIcon, AdminPanelSettings, Person, Logout, MoreVert, ArrowBack, Favorite, CompareArrows, History as HistoryIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import MapFilters from '../components/MapFilters';
import Locations from '../pages/Locations';
import Favorites from '../pages/Favorites';
import LocationHistory from '../pages/LocationHistory';
import AddLocationDialog from '../components/AddLocationDialog';
import AdminDashboard from '../pages/AdminDashboard';
import EmergencyResources from '../components/EmergencyResources';
import LocationComparison from '../components/LocationComparison';
import { getLocations } from '../services/locationService';
import { getFavorites, addFavorite, removeFavorite } from '../services/favoritesService';
import { defaultMapCenter, defaultMapZoom } from '../config/googleMaps';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { logOut } from '../services/authService';

const MapViewPage = ({ children }) => {
  const { isAdmin, user } = useAuth();
  const { pendingCount, updatePendingCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [locations, setLocations] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultMapCenter);
  const [mapZoom, setMapZoom] = useState(defaultMapZoom);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [filters, setFilters] = useState({
    iconTypes: [],
    searchTerm: '',
    favoritesOnly: false,
    maxDistance: 50,
    openStatus: 'all',
  });
  const [favorites, setFavorites] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);

  // Check if we're on profile or settings page
  const isProfilePage = location.pathname === '/profile';
  const isSettingsPage = location.pathname === '/settings';
  const isAdminPage = location.pathname === '/admin';

  useEffect(() => {
    loadLocations();
  }, []);

  // Set tab value based on current route
  useEffect(() => {
    if (location.pathname === '/') {
      setTabValue(0); // Map
    } else if (location.pathname === '/locations') {
      setTabValue(1); // Locations
    } else if (location.pathname === '/favorites') {
      setTabValue(2); // Favorites
    } else if (location.pathname === '/history') {
      setTabValue(3); // History
    } else if (location.pathname === '/admin') {
      // Admin tab index depends on whether user is logged in
      setTabValue(user ? 4 : 1); // Admin
    }
  }, [location.pathname, user]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    const result = await getFavorites(user.uid);
    if (!result.error) {
      setFavorites(result.favorites);
    }
  };

  const handleFavoriteToggle = async (locationId) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const isFavorited = favorites.includes(locationId);
    let result;
    
    if (isFavorited) {
      result = await removeFavorite(user.uid, locationId);
    } else {
      result = await addFavorite(user.uid, locationId);
    }

    if (!result.error) {
      await loadFavorites();
    } else {
      alert('Error updating favorite: ' + result.error);
    }
  };

  const handleUserLocationRequest = (loc) => {
    setUserLocation(loc);
  };

  const loadLocations = async () => {
    try {
      const result = await getLocations();
      if (!result.error) {
        setLocations(result.documents);
      } else {
        console.warn('Could not load locations:', result.error);
        // Don't block map from loading if locations fail
        setLocations([]);
      }
    } catch (error) {
      console.warn('Error loading locations:', error);
      setLocations([]);
    }
  };

  // Filter out online-only locations from map markers (they don't have physical locations)
  const markers = locations
    .filter((loc) => !loc.onlineOnly && loc.latitude && loc.longitude)
    .map((loc, index) => ({
      position: {
        lat: typeof loc.latitude === 'number' ? loc.latitude : parseFloat(loc.latitude),
        lng: typeof loc.longitude === 'number' ? loc.longitude : parseFloat(loc.longitude),
      },
      title: loc.name,
      location: {
        ...loc,
        id: loc.id || loc.name || `location_${index}` // Ensure ID is present
      },
    }));

  const handleTabChange = (event, newValue) => {
    // This is called by MUI Tabs onChange, but we're also handling clicks directly
    // Keep this for the visual tab selection, but navigation is handled by onClick
    console.log('Tabs onChange event:', newValue);
  };

  const handleAddSuccess = () => {
    setOpenAddDialog(false);
    setEditingLocation(null);
    loadLocations();
    // Update pending count if admin
    if (isAdmin) {
      updatePendingCount();
    }
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setOpenAddDialog(true);
  };


  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    if (!user) {
      navigate('/auth/login');
    } else {
      navigate('/profile');
    }
  };

  const handleSettings = () => {
    handleMenuClose();
    if (!user) {
      navigate('/auth/login');
    } else {
      navigate('/settings');
    }
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logOut();
    navigate('/auth/login');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Tabs */}
      <AppBar position="static" sx={{ bgcolor: '#1a1a1a', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!children && (
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="inherit"
              variant="fullWidth"
              sx={{
                flexGrow: 1,
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: '#fff',
                  },
                },
              }}
            >
                <Tab 
                  icon={<Map />} 
                  label="Map" 
                  iconPosition="start"
                  onClick={() => {
                    console.log('Map tab clicked - navigating to /');
                    navigate('/');
                  }}
                />
                {user && (
                  <>
                    <Tab 
                      icon={<List />} 
                      label="Locations" 
                      iconPosition="start"
                      onClick={() => {
                        console.log('Locations tab clicked - navigating to /locations');
                        navigate('/locations');
                      }}
                    />
                    <Tab 
                      icon={<Favorite />} 
                      label="Favorites" 
                      iconPosition="start"
                      onClick={() => {
                        console.log('Favorites tab clicked - navigating to /favorites');
                        navigate('/favorites');
                      }}
                    />
                    <Tab 
                      icon={<HistoryIcon />} 
                      label="History" 
                      iconPosition="start"
                      onClick={() => {
                        console.log('History tab clicked - navigating to /history');
                        navigate('/history');
                      }}
                    />
                  </>
                )}
                {isAdmin && (
                  <Tab
                    icon={
                      <Badge badgeContent={pendingCount} color="error" max={99}>
                        <AdminPanelSettings />
                      </Badge>
                    }
                    label="Admin"
                    iconPosition="start"
                    onClick={() => {
                      console.log('Admin tab clicked - navigating to /admin');
                      navigate('/admin');
                    }}
                  />
                )}
            </Tabs>
          )}
          {children && (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 2 }}>
              <IconButton
                onClick={() => navigate('/')}
                sx={{ color: '#fff', mr: 1 }}
                aria-label="back to map"
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" sx={{ color: '#fff' }}>
                {isProfilePage ? 'Your Profile' : isSettingsPage ? 'Settings' : isAdminPage ? 'Admin Dashboard' : ''}
              </Typography>
              {isAdminPage && pendingCount > 0 && (
                <Badge badgeContent={pendingCount} color="error" sx={{ ml: 2 }}>
                  <Box />
                </Badge>
              )}
            </Box>
          )}
          {user ? (
            <IconButton
              onClick={handleMenuOpen}
              sx={{ color: '#fff', mr: 1 }}
            >
              <MoreVert />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/auth/login')}
                sx={{ color: '#fff', borderColor: '#555', '&:hover': { borderColor: '#777' } }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/auth/signup')}
                sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </AppBar>

      {/* Dropdown Menu - Only show if user is logged in */}
      {user && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              bgcolor: '#1e3a5f',
              color: '#fff',
              minWidth: 280,
              mt: 1,
              borderRadius: 2,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          MenuListProps={{
            sx: { py: 0.5 },
          }}
        >
          <MenuItem 
            onClick={handleProfile}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              <Person sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Your Profile"
              primaryTypographyProps={{ style: { color: '#fff' } }}
            />
          </MenuItem>
          <MenuItem 
            onClick={handleSettings}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              <SettingsIcon sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Settings"
              primaryTypographyProps={{ style: { color: '#fff' } }}
            />
          </MenuItem>
          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 1 }} />
          <MenuItem 
            onClick={handleLogout}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon>
              <Logout sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              primaryTypographyProps={{ style: { color: '#fff' } }}
            />
          </MenuItem>
        </Menu>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Render children if provided (Profile/Settings/Admin pages) */}
        {children && (
          <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#1a1a1a', color: '#fff' }}>
            {React.cloneElement(children, { 
              onLocationApproved: () => {
                loadLocations();
                updatePendingCount();
              }
            })}
          </Box>
        )}
        
        {/* Otherwise render tabs content */}
        {!children && (
          <>
            {tabValue === 0 && (
              <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
                <MapFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  showFavorites={!!user}
                  userLocation={userLocation}
                />
                <EmergencyResources />
                <MapView
                  center={mapCenter}
                  zoom={mapZoom}
                  markers={markers}
                  filters={filters}
                  favorites={favorites}
                  onFavoriteToggle={handleFavoriteToggle}
                  userLocation={userLocation}
                  onUserLocationRequest={handleUserLocationRequest}
                  onLocationEdit={isAdmin ? handleEditLocation : null}
                  allLocations={locations}
                  onLocationClick={(location) => {
                    // Center map on clicked location
                    if (location.latitude && location.longitude) {
                      setMapCenter({ lat: location.latitude, lng: location.longitude });
                      setMapZoom(15);
                    }
                  }}
                />
                {/* Floating Action Button for Comparison - Bottom Right */}
                {user && (
                  <Box sx={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000 }}>
                    <Fab
                      color="secondary"
                      aria-label="compare locations"
                      onClick={() => setComparisonDialogOpen(true)}
                      sx={{ 
                        bgcolor: '#9c27b0', 
                        '&:hover': { bgcolor: '#7b1fa2' },
                        width: 48,
                        height: 48,
                      }}
                    >
                      <CompareArrows />
                    </Fab>
                  </Box>
                )}
              </Box>
            )}
                {tabValue === 1 && user && (
                  <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#1a1a1a', color: '#fff' }}>
                    <Locations 
                      onLocationClick={(location) => {
                        setMapCenter({ lat: location.latitude, lng: location.longitude });
                        setMapZoom(15);
                        setTabValue(0);
                      }}
                      onLocationEdit={handleEditLocation}
                      userLocation={userLocation}
                    />
                  </Box>
                )}
                {tabValue === 2 && user && (
                  <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#1a1a1a', color: '#fff' }}>
                    <Favorites
                      onLocationClick={(location) => {
                        if (location.latitude && location.longitude) {
                          setMapCenter({ lat: location.latitude, lng: location.longitude });
                          setMapZoom(15);
                          setTabValue(0);
                        }
                      }}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </Box>
                )}
                {tabValue === 3 && user && (
                  <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#1a1a1a', color: '#fff' }}>
                    <LocationHistory
                      onLocationClick={(location) => {
                        if (location.latitude && location.longitude) {
                          setMapCenter({ lat: location.latitude, lng: location.longitude });
                          setMapZoom(15);
                          setTabValue(0);
                        }
                      }}
                    />
                  </Box>
                )}
                {((user && tabValue === 4) || (!user && tabValue === 1)) && isAdmin && (
                  <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#1a1a1a', color: '#fff' }}>
                    <AdminDashboard onLocationApproved={loadLocations} />
                  </Box>
                )}
          </>
        )}
      </Box>

      {/* Bottom Navigation - Only show on main pages and if user is logged in */}
      {!children && user && (
        <AppBar position="static" sx={{ bgcolor: '#1a1a1a', boxShadow: 'none', top: 'auto', bottom: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', py: 1 }}>
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => setOpenAddDialog(true)}
              sx={{ position: 'relative', zIndex: 1 }}
            >
              <Add />
            </Fab>
          </Box>
        </AppBar>
      )}
      
      {/* Show sign in prompt for unauthenticated users */}
      {!children && !user && (
        <AppBar position="static" sx={{ bgcolor: '#1a1a1a', boxShadow: 'none', top: 'auto', bottom: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2, px: 2 }}>
            <Typography variant="body2" sx={{ color: '#fff', mr: 2 }}>
              Sign in to add locations
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/auth/login')}
              sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              Sign In
            </Button>
          </Box>
        </AppBar>
      )}

      {/* Add/Edit Location Dialog */}
      <AddLocationDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          setEditingLocation(null);
        }}
        onSuccess={handleAddSuccess}
        location={editingLocation}
      />

      {/* Location Comparison Dialog */}
      <LocationComparison
        locations={locations}
        open={comparisonDialogOpen}
        onClose={() => setComparisonDialogOpen(false)}
        userLocation={userLocation}
      />
    </Box>
  );
};

export default MapViewPage;

