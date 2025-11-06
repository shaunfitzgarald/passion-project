import React, { useState } from 'react';
import {
  Box,
  TextField,
  Chip,
  Paper,
  Typography,
  IconButton,
  Collapse,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material';
import {
  FilterList,
  Search,
  ExpandMore,
  ExpandLess,
  Favorite,
} from '@mui/icons-material';
import {
  Home,
  LocalHospital,
  Restaurant,
  School,
  Work,
  DirectionsBus,
  ChildCare,
  LocalLibrary,
  VolunteerActivism,
  LocalPharmacy,
  RestaurantMenu,
  Hotel,
  Help,
  LocationOn,
} from '@mui/icons-material';

const ICON_OPTIONS = [
  { value: 'home', label: 'Housing', icon: Home, color: '#4CAF50' },
  { value: 'hotel', label: 'Shelter', icon: Hotel, color: '#FF9800' },
  { value: 'local_hospital', label: 'Healthcare', icon: LocalHospital, color: '#F44336' },
  { value: 'restaurant', label: 'Food', icon: Restaurant, color: '#E91E63' },
  { value: 'restaurant_menu', label: 'Food Pantry', icon: RestaurantMenu, color: '#9C27B0' },
  { value: 'school', label: 'Education', icon: School, color: '#2196F3' },
  { value: 'work', label: 'Employment', icon: Work, color: '#00BCD4' },
  { value: 'directions_bus', label: 'Transportation', icon: DirectionsBus, color: '#3F51B5' },
  { value: 'child_care', label: 'Childcare', icon: ChildCare, color: '#FFC107' },
  { value: 'local_library', label: 'Community', icon: LocalLibrary, color: '#795548' },
  { value: 'volunteer_activism', label: 'Non-Profit', icon: VolunteerActivism, color: '#009688' },
  { value: 'local_pharmacy', label: 'Pharmacy', icon: LocalPharmacy, color: '#8BC34A' },
  { value: 'help', label: 'Other', icon: Help, color: '#9E9E9E' },
  { value: 'location_on', label: 'Default', icon: LocationOn, color: '#1976d2' },
];

const MapFilters = ({ filters, onFiltersChange, showFavorites = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');

  const handleIconToggle = (iconType) => {
    const currentTypes = filters.iconTypes || [];
    const newTypes = currentTypes.includes(iconType)
      ? currentTypes.filter(t => t !== iconType)
      : [...currentTypes, iconType];
    
    onFiltersChange({
      ...filters,
      iconTypes: newTypes,
    });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    onFiltersChange({
      ...filters,
      searchTerm: value,
    });
  };

  const handleFavoritesToggle = (checked) => {
    onFiltersChange({
      ...filters,
      favoritesOnly: checked,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({
      iconTypes: [],
      searchTerm: '',
      favoritesOnly: false,
    });
  };

  const activeFilterCount = (filters.iconTypes?.length || 0) + 
    (filters.searchTerm ? 1 : 0) + 
    (filters.favoritesOnly ? 1 : 0);

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        bgcolor: '#1a1a1a',
        color: '#fff',
        minWidth: 300,
        maxWidth: 400,
      }}
    >
      {/* Search Bar */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid #444' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: '#999', mr: 1 }} />,
            sx: {
              bgcolor: '#2a2a2a',
              color: '#fff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#555',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#777',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976d2',
              },
            },
          }}
          inputProps={{
            style: { color: '#fff' },
          }}
        />
      </Box>

      {/* Filter Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#2a2a2a' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList sx={{ color: '#fff' }} />
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>
            Filters
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={activeFilterCount}
              size="small"
              sx={{
                bgcolor: '#1976d2',
                color: '#fff',
                height: 20,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>
        <IconButton size="small" sx={{ color: '#fff' }}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Filter Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: 1.5, borderTop: '1px solid #444' }}>
          {/* Favorites Filter */}
          {showFavorites && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.favoritesOnly || false}
                  onChange={(e) => handleFavoritesToggle(e.target.checked)}
                  sx={{
                    color: '#fff',
                    '&.Mui-checked': {
                      color: '#f44336',
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Favorite sx={{ fontSize: 18, color: '#f44336' }} />
                  <Typography variant="body2" sx={{ color: '#fff' }}>
                    Favorites Only
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />
          )}

          {/* Icon Type Filters */}
          <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1 }}>
            Location Types:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {ICON_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              const isSelected = (filters.iconTypes || []).includes(option.value);
              
              return (
                <Chip
                  key={option.value}
                  icon={<IconComponent sx={{ fontSize: 16, color: isSelected ? '#fff' : option.color }} />}
                  label={option.label}
                  onClick={() => handleIconToggle(option.value)}
                  sx={{
                    bgcolor: isSelected ? option.color : '#2a2a2a',
                    color: '#fff',
                    border: isSelected ? 'none' : `1px solid ${option.color}`,
                    '&:hover': {
                      bgcolor: isSelected ? option.color : '#3a3a3a',
                    },
                    fontSize: '0.75rem',
                    height: 28,
                  }}
                />
              );
            })}
          </Box>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={clearFilters}
              fullWidth
              sx={{
                borderColor: '#555',
                color: '#fff',
                '&:hover': {
                  borderColor: '#777',
                  bgcolor: '#2a2a2a',
                },
              }}
            >
              Clear All Filters
            </Button>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default MapFilters;

