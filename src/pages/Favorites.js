import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Paper,
  CircularProgress,
  Collapse,
  Divider,
  Link,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { LocationOn, Favorite, FavoriteBorder, ExpandMore, ExpandLess, Phone, Email, Language, AccessTime, Cloud } from '@mui/icons-material';
import { getLocations } from '../services/locationService';
import { getFavorites, removeFavorite } from '../services/favoritesService';
import { useAuth } from '../contexts/AuthContext';

const Favorites = ({ onLocationClick, onFavoriteToggle }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLocation, setExpandedLocation] = useState(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const favoritesResult = await getFavorites(user.uid);
      if (!favoritesResult.error) {
        setFavorites(favoritesResult.favorites);
        
        // Load location details for favorites
        const locationsResult = await getLocations();
        if (!locationsResult.error) {
          const favoriteLocations = locationsResult.documents.filter(loc => 
            favoritesResult.favorites.includes(loc.id)
          );
          setLocations(favoriteLocations);
        }
      }
    } catch (error) {
      console.warn('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (locationId) => {
    if (!user) return;
    const result = await removeFavorite(user.uid, locationId);
    if (!result.error) {
      await loadFavorites();
      if (onFavoriteToggle) {
        onFavoriteToggle(locationId);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderLocationCard = (location) => {
    const isExpanded = expandedLocation === location.id;
    
    return (
      <Grid item xs={12} sm={6} md={4} key={location.id}>
        <Card
          sx={{
            bgcolor: '#2a2a2a',
            color: '#fff',
            '&:hover': {
              bgcolor: '#333',
              transform: 'translateY(-2px)',
              transition: 'all 0.2s',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ mb: 0, flexGrow: 1, cursor: 'pointer' }}
                onClick={() => onLocationClick && onLocationClick(location)}
              >
                {location.name}
              </Typography>
              {location.onlineOnly && (
                <Chip
                  icon={<Cloud />}
                  label="Online"
                  size="small"
                  sx={{ bgcolor: '#1976d2', color: '#fff' }}
                />
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedLocation(isExpanded ? null : location.id);
                }}
                sx={{ color: '#fff' }}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            {location.address && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {location.address}
                {location.city && `, ${location.city}`}
                {location.state && ` ${location.state}`}
                {location.zipCode && ` ${location.zipCode}`}
              </Typography>
            )}
            {location.website && !location.address && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                🌐 {location.website}
              </Typography>
            )}
            {location.description && (
              <Typography variant="body2" sx={{ mb: 2 }} noWrap={!isExpanded}>
                {location.description}
              </Typography>
            )}
            {location.categories && location.categories.length > 0 && (
              <Box sx={{ mb: 1 }}>
                {location.categories.slice(0, 3).map((category, index) => (
                  <Chip
                    key={index}
                    label={category}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5, bgcolor: '#3a3a3a' }}
                  />
                ))}
                {location.categories.length > 3 && (
                  <Chip
                    label={`+${location.categories.length - 3}`}
                    size="small"
                    sx={{ bgcolor: '#3a3a3a' }}
                  />
                )}
              </Box>
            )}

            {/* Expanded Details */}
            <Collapse in={isExpanded}>
              <Divider sx={{ my: 2, bgcolor: '#444' }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {location.description && (
                  <Typography variant="body2" sx={{ color: '#fff' }}>
                    {location.description}
                  </Typography>
                )}

                {location.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 16, color: '#999' }} />
                    <Link href={`tel:${location.phone}`} sx={{ color: '#90caf9' }}>
                      {location.phone}
                    </Link>
                  </Box>
                )}

                {location.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: 16, color: '#999' }} />
                    <Link href={`mailto:${location.email}`} sx={{ color: '#90caf9' }}>
                      {location.email}
                    </Link>
                  </Box>
                )}

                {location.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Language sx={{ fontSize: 16, color: '#999' }} />
                    <Link
                      href={location.website.startsWith('http') ? location.website : `https://${location.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#90caf9' }}
                    >
                      {location.website}
                    </Link>
                  </Box>
                )}

                {location.hours && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 16, color: '#999' }} />
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {location.hours}
                    </Typography>
                  </Box>
                )}

                {location.resources && location.resources.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Resources:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {location.resources.map((resource, idx) => (
                        <Chip
                          key={idx}
                          label={resource}
                          size="small"
                          sx={{ bgcolor: '#1a5490', color: '#fff', fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {location.benefits && location.benefits.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Benefits:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {location.benefits.map((benefit, idx) => (
                        <Chip
                          key={idx}
                          label={benefit}
                          size="small"
                          sx={{ bgcolor: '#4caf50', color: '#fff', fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {location.photos && location.photos.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Photos:
                    </Typography>
                    <ImageList sx={{ width: '100%', height: 150 }} cols={3} rowHeight={150}>
                      {location.photos.slice(0, 6).map((photoUrl, idx) => (
                        <ImageListItem key={idx}>
                          <img
                            src={photoUrl}
                            alt={`Location photo ${idx + 1}`}
                            loading="lazy"
                            style={{ objectFit: 'cover', width: '100%', height: '100%', cursor: 'pointer' }}
                            onClick={() => window.open(photoUrl, '_blank')}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}

                {location.notes && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
                      Notes:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', fontStyle: 'italic' }}>
                      {location.notes}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Collapse>
          </CardContent>
          <CardActions>
            {!location.onlineOnly && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onLocationClick) {
                    onLocationClick(location);
                  }
                }}
                sx={{ color: '#fff' }}
                title="View on map"
              >
                <LocationOn />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFavorite(location.id);
              }}
              sx={{ color: '#f44336' }}
              title="Remove from favorites"
            >
              <Favorite />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, color: '#fff' }}>
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#2a2a2a' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Sign in to view favorites
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please sign in to see your favorite locations.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, color: '#fff' }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        My Favorites ({locations.length})
      </Typography>

      {locations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#2a2a2a' }}>
          <FavoriteBorder sx={{ fontSize: 64, color: '#555', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No favorites yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click the heart icon on locations to add them to your favorites.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {locations.map((location) => renderLocationCard(location))}
        </Grid>
      )}
    </Box>
  );
};

export default Favorites;

