import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
} from '@mui/material';
import {
  Close,
  CompareArrows,
  LocationOn,
  Phone,
  Email,
  Language,
  AccessTime,
  Delete,
} from '@mui/icons-material';
import { calculateDistance, formatDistance, checkOpenStatus } from '../utils/locationUtils';

const LocationComparison = ({ locations, open, onClose, userLocation }) => {
  const [selectedLocations, setSelectedLocations] = useState([]);

  const handleToggleLocation = (locationId) => {
    if (selectedLocations.includes(locationId)) {
      setSelectedLocations(selectedLocations.filter(id => id !== locationId));
    } else {
      if (selectedLocations.length < 5) { // Limit to 5 locations
        setSelectedLocations([...selectedLocations, locationId]);
      }
    }
  };

  const handleRemoveLocation = (locationId) => {
    setSelectedLocations(selectedLocations.filter(id => id !== locationId));
  };

  const compareLocations = locations.filter(loc => selectedLocations.includes(loc.id));

  const getComparisonData = () => {
    if (compareLocations.length === 0) return null;

    const data = {
      names: compareLocations.map(loc => loc.name || 'N/A'),
      addresses: compareLocations.map(loc => 
        loc.address ? `${loc.address}, ${loc.city || ''} ${loc.state || ''}` : 'N/A'
      ),
      phones: compareLocations.map(loc => loc.phone || 'N/A'),
      emails: compareLocations.map(loc => loc.email || 'N/A'),
      websites: compareLocations.map(loc => loc.website || 'N/A'),
      hours: compareLocations.map(loc => {
        const status = checkOpenStatus(loc.hours);
        return {
          hours: loc.hours || 'N/A',
          status: status.status,
          isOpen: status.isOpen,
        };
      }),
      distances: userLocation ? compareLocations.map(loc => {
        if (loc.latitude && loc.longitude) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            loc.latitude,
            loc.longitude
          );
          return distance !== null ? formatDistance(distance) : 'N/A';
        }
        return 'N/A';
      }) : compareLocations.map(() => 'N/A'),
      categories: compareLocations.map(loc => loc.categories || []),
      resources: compareLocations.map(loc => loc.resources || []),
      descriptions: compareLocations.map(loc => loc.description || 'N/A'),
    };

    return data;
  };

  const comparisonData = getComparisonData();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'background.paper', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrows />
          <Typography variant="h6">Compare Locations</Typography>
          {selectedLocations.length > 0 && (
            <Chip label={`${selectedLocations.length} selected`} size="small" sx={{ ml: 1 }} />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: 'background.default', minHeight: 400 }}>
        {selectedLocations.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CompareArrows sx={{ fontSize: 64, color: '#555', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
              Select Locations to Compare
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose up to 5 locations from the list below to compare them side-by-side.
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {locations.map((location) => (
                <Paper
                  key={location.id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    bgcolor: 'background.paper',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleToggleLocation(location.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      checked={selectedLocations.includes(location.id)}
                      onChange={() => handleToggleLocation(location.id)}
                      size="small"
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {location.name}
                      </Typography>
                      {location.address && (
                        <Typography variant="caption" color="text.secondary">
                          {location.address}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        ) : (
          <Box>
            {/* Selected Locations Header */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {compareLocations.map((location) => (
                <Chip
                  key={location.id}
                  label={location.name}
                  onDelete={() => handleRemoveLocation(location.id)}
                  deleteIcon={<Delete />}
                  sx={{ bgcolor: 'primary.main', color: '#fff' }}
                />
              ))}
              {selectedLocations.length < 5 && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    // Show location picker
                  }}
                >
                  + Add Location
                </Button>
              )}
            </Box>

            {/* Comparison Table */}
            {comparisonData && (
              <TableContainer component={Paper} sx={{ bgcolor: 'background.paper' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Property</TableCell>
                      {comparisonData.names.map((name, idx) => (
                        <TableCell key={idx} sx={{ fontWeight: 600, maxWidth: 200 }}>
                          {name}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                      {comparisonData.addresses.map((addr, idx) => (
                        <TableCell key={idx}>{addr}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Distance</TableCell>
                      {comparisonData.distances.map((dist, idx) => (
                        <TableCell key={idx}>{dist}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                      {comparisonData.phones.map((phone, idx) => (
                        <TableCell key={idx}>
                          {phone !== 'N/A' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Phone sx={{ fontSize: 14 }} />
                              <a href={`tel:${phone.replace(/\D/g, '')}`} style={{ color: 'inherit' }}>
                                {phone}
                              </a>
                            </Box>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      {comparisonData.emails.map((email, idx) => (
                        <TableCell key={idx}>
                          {email !== 'N/A' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Email sx={{ fontSize: 14 }} />
                              <a href={`mailto:${email}`} style={{ color: 'inherit' }}>
                                {email}
                              </a>
                            </Box>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Website</TableCell>
                      {comparisonData.websites.map((website, idx) => (
                        <TableCell key={idx}>
                          {website !== 'N/A' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Language sx={{ fontSize: 14 }} />
                              <a
                                href={website.startsWith('http') ? website : `https://${website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'inherit' }}
                              >
                                Visit Website
                              </a>
                            </Box>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Hours / Status</TableCell>
                      {comparisonData.hours.map((hourData, idx) => (
                        <TableCell key={idx}>
                          <Box>
                            <Typography variant="body2">{hourData.hours}</Typography>
                            {hourData.isOpen === true && (
                              <Chip label={hourData.status} size="small" sx={{ bgcolor: '#4caf50', color: '#fff', mt: 0.5 }} />
                            )}
                            {hourData.isOpen === false && (
                              <Chip label={hourData.status} size="small" sx={{ bgcolor: '#f44336', color: '#fff', mt: 0.5 }} />
                            )}
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Categories</TableCell>
                      {comparisonData.categories.map((cats, idx) => (
                        <TableCell key={idx}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {cats.length > 0 ? (
                              cats.slice(0, 3).map((cat, catIdx) => (
                                <Chip key={catIdx} label={cat} size="small" />
                              ))
                            ) : (
                              <Typography variant="caption" color="text.secondary">None</Typography>
                            )}
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Resources</TableCell>
                      {comparisonData.resources.map((resources, idx) => (
                        <TableCell key={idx}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {resources.length > 0 ? (
                              resources.slice(0, 3).map((res, resIdx) => (
                                <Chip key={resIdx} label={res} size="small" color="primary" />
                              ))
                            ) : (
                              <Typography variant="caption" color="text.secondary">None</Typography>
                            )}
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      {comparisonData.descriptions.map((desc, idx) => (
                        <TableCell key={idx}>
                          <Typography variant="body2" sx={{ maxHeight: 100, overflow: 'auto' }}>
                            {desc}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        {selectedLocations.length > 0 && (
          <Button onClick={() => setSelectedLocations([])}>
            Clear Selection
          </Button>
        )}
        <Button onClick={onClose}>
          {selectedLocations.length > 0 ? 'Close' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationComparison;

