import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  Grid,
  Autocomplete,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Close,
  Download,
  Edit,
  Delete,
  Save,
  Cancel,
  Description,
  InsertDriveFile,
} from '@mui/icons-material';
import { addLocation } from '../services/locationService';
import { geocodeAddress } from '../services/geocodingService';
import { useAuth } from '../contexts/AuthContext';
import { formatPhoneNumber } from './AddEditLocation';

const BatchImport = ({ onImportComplete }) => {
  const { user, isAdmin } = useAuth();
  const [file, setFile] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [jsonText, setJsonText] = useState('');

  // Expected location structure
  const expectedFields = [
    'name',
    'address',
    'city',
    'state',
    'latitude',
    'longitude',
    'description',
    'phone',
    'email',
    'website',
    'hours',
    'categories',
    'resources',
    'benefits',
    'icon',
    'notes',
    'onlineOnly',
    'photos',
  ];

  const processJsonData = (jsonData) => {
    try {
      // Handle both array and object with array property
      let locationsArray = [];
      if (Array.isArray(jsonData)) {
        locationsArray = jsonData;
      } else if (jsonData.locations && Array.isArray(jsonData.locations)) {
        locationsArray = jsonData.locations;
      } else if (jsonData.data && Array.isArray(jsonData.data)) {
        locationsArray = jsonData.data;
      } else {
        throw new Error('JSON must contain an array of locations');
      }

      if (locationsArray.length === 0) {
        alert('JSON contains no locations');
        return false;
      }

      // Validate and normalize locations
      const validatedLocations = locationsArray.map((loc, index) => {
        const validation = validateLocation(loc, index);
        return {
          ...validation.location,
          _index: index,
          _valid: validation.valid,
          _errors: validation.errors,
          _selected: validation.valid, // Auto-select valid locations
        };
      });

      setLocations(validatedLocations);
      setSelectedLocations(validatedLocations.filter(loc => loc._valid).map(loc => loc._index));
      setPreviewOpen(true);
      return true;
    } catch (error) {
      alert('Error parsing JSON: ' + error.message);
      return false;
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.json')) {
      alert('Please select a JSON file');
      return;
    }

    setFile(selectedFile);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        processJsonData(jsonData);
      } catch (error) {
        alert('Error parsing JSON file: ' + error.message);
        setFile(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleTextSubmit = () => {
    if (!jsonText.trim()) {
      alert('Please enter JSON data');
      return;
    }

    setResults(null);
    try {
      const jsonData = JSON.parse(jsonText);
      if (processJsonData(jsonData)) {
        setJsonText(''); // Clear text after successful parse
      }
    } catch (error) {
      alert('Error parsing JSON: ' + error.message);
    }
  };

  const validateLocation = (location, index) => {
    const errors = [];
    const normalized = { ...location };

    // Required fields
    if (!location.name || !location.name.trim()) {
      errors.push('Missing required field: name');
    }

    // Validate onlineOnly flag
    const isOnlineOnly = location.onlineOnly === true || location.onlineOnly === 'true';
    normalized.onlineOnly = isOnlineOnly;

    if (!isOnlineOnly) {
      // Physical locations need address and coordinates
      if (!location.address || !location.address.trim()) {
        errors.push('Missing required field: address');
      }
      
      // Try to get coordinates
      if (!location.latitude || !location.longitude) {
        if (location.address) {
          // Will geocode later
          normalized._needsGeocoding = true;
        } else {
          errors.push('Missing required fields: latitude and longitude (or address for geocoding)');
        }
      } else {
        normalized.latitude = parseFloat(location.latitude);
        normalized.longitude = parseFloat(location.longitude);
        if (isNaN(normalized.latitude) || isNaN(normalized.longitude)) {
          errors.push('Invalid latitude/longitude values');
        }
      }
    } else {
      // Online-only services need contact info
      if (!location.website && !location.email && !location.phone) {
        errors.push('Online-only services must have at least one: website, email, or phone');
      }
    }

    // Format phone number if present
    if (location.phone) {
      normalized.phone = formatPhoneNumber(location.phone);
    }

    // Ensure arrays are arrays
    normalized.categories = Array.isArray(location.categories) ? location.categories : [];
    normalized.resources = Array.isArray(location.resources) ? location.resources : [];
    normalized.benefits = Array.isArray(location.benefits) ? location.benefits : [];
    normalized.photos = Array.isArray(location.photos) ? location.photos : [];

    // Set default icon if not provided
    if (!normalized.icon) {
      normalized.icon = 'location_on';
    }

    // Ensure state is uppercase 2-letter code
    if (normalized.state) {
      normalized.state = normalized.state.toUpperCase().substring(0, 2);
    }

    return {
      location: normalized,
      valid: errors.length === 0,
      errors,
    };
  };

  const handleToggleLocation = (index) => {
    if (selectedLocations.includes(index)) {
      setSelectedLocations(selectedLocations.filter(i => i !== index));
    } else {
      setSelectedLocations([...selectedLocations, index]);
    }
  };

  const handleRemoveLocation = (index) => {
    // Remove the location
    const updated = locations.filter(loc => loc._index !== index);
    
    // Re-index remaining locations
    const reindexed = updated.map((loc, idx) => ({
      ...loc,
      _index: idx,
    }));
    
    setLocations(reindexed);
    
    // Update selected locations - remove the deleted one and adjust indices
    const newSelected = selectedLocations
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i); // Decrement indices after the removed item
    
    setSelectedLocations(newSelected);
  };

  const handleEditLocation = (location) => {
    setEditingLocation({ ...location });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingLocation) return;
    
    const validation = validateLocation(editingLocation, editingLocation._index);
    const updated = {
      ...validation.location,
      _index: editingLocation._index,
      _valid: validation.valid,
      _errors: validation.errors,
      _selected: selectedLocations.includes(editingLocation._index),
    };

    setLocations(locations.map(loc => 
      loc._index === editingLocation._index ? updated : loc
    ));
    
    if (!validation.valid && selectedLocations.includes(editingLocation._index)) {
      setSelectedLocations(selectedLocations.filter(i => i !== editingLocation._index));
    }
    
    setEditDialogOpen(false);
    setEditingLocation(null);
  };

  const handleImport = async () => {
    if (selectedLocations.length === 0) {
      alert('Please select at least one location to import');
      return;
    }

    const locationsToImport = locations.filter((loc) => 
      selectedLocations.includes(loc._index) && loc._valid
    );
    
    if (locationsToImport.length === 0) {
      alert('No valid locations selected to import');
      return;
    }

    setImporting(true);
    setProgress(0);
    setPreviewOpen(false);
    const results = {
      total: locationsToImport.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < locationsToImport.length; i++) {
      const loc = locationsToImport[i];
      try {
        let locationData = { ...loc };
        
        // Remove internal validation fields
        delete locationData._index;
        delete locationData._valid;
        delete locationData._errors;
        delete locationData._needsGeocoding;

        // Geocode if needed
        if (loc._needsGeocoding && loc.address) {
          const geoResult = await geocodeAddress(
            loc.address,
            loc.city,
            loc.state,
            loc.zipCode
          );
          if (!geoResult.error && geoResult.latitude && geoResult.longitude) {
            locationData.latitude = geoResult.latitude;
            locationData.longitude = geoResult.longitude;
            // Auto-fill address components if empty
            if (!locationData.city && geoResult.addressComponents.city) {
              locationData.city = geoResult.addressComponents.city;
            }
            if (!locationData.state && geoResult.addressComponents.state) {
              locationData.state = geoResult.addressComponents.state;
            }
            if (!locationData.zipCode && geoResult.addressComponents.zipCode) {
              locationData.zipCode = geoResult.addressComponents.zipCode;
            }
          } else {
            results.failed++;
            results.errors.push({
              index: loc._index,
              name: loc.name || 'Unknown',
              error: 'Failed to geocode address: ' + (geoResult.error || 'Unknown error'),
            });
            setProgress(((i + 1) / locationsToImport.length) * 100);
            continue;
          }
        }

        // Ensure coordinates are numbers
        if (locationData.latitude) {
          locationData.latitude = parseFloat(locationData.latitude);
        }
        if (locationData.longitude) {
          locationData.longitude = parseFloat(locationData.longitude);
        }

        // Add location (admins add directly without approval)
        const result = await addLocation(locationData, user.uid, true);
        
        if (result.error) {
          results.failed++;
          results.errors.push({
            index: loc._index,
            name: loc.name || 'Unknown',
            error: result.error,
          });
        } else {
          results.success++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: loc._index,
          name: loc.name || 'Unknown',
          error: error.message || 'Unknown error',
        });
      }

      setProgress(((i + 1) / locationsToImport.length) * 100);
    }

    setResults(results);
    setImporting(false);
    setPreviewOpen(false);
    
    if (onImportComplete) {
      onImportComplete();
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Example Location Name',
        address: '123 Main Street',
        city: 'San Diego',
        state: 'CA',
        zipCode: '92101',
        latitude: 32.7157,
        longitude: -117.1611,
        description: 'Example description of the location',
        phone: '(619) 555-1234',
        email: 'contact@example.com',
        website: 'https://example.com',
        hours: 'Mon-Fri 09:00-17:00, Sat 10:00-14:00',
        categories: ['Food Assistance', 'Housing'],
        resources: ['Food Pantry', 'Hot Meals'],
        benefits: ['Free', 'SNAP Accepted'],
        icon: 'restaurant',
        notes: 'Additional notes here',
        onlineOnly: false,
        photos: [],
      },
      {
        name: 'Online Service Example',
        description: 'This is an online-only service',
        website: 'https://onlineservice.com',
        email: 'info@onlineservice.com',
        phone: '(619) 555-5678',
        categories: ['Mental Health'],
        resources: ['Online Counseling'],
        icon: 'help',
        onlineOnly: true,
      },
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'location-import-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <Alert severity="error">You must be an admin to use batch import.</Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#fff', fontWeight: 600 }}>
        Batch Import Locations
      </Typography>

      <Paper sx={{ p: 3, bgcolor: '#2a2a2a', mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2, color: '#fff' }}>
          Upload a JSON file or paste JSON directly to import multiple locations at once.
        </Typography>

        <Tabs
          value={inputMode}
          onChange={(e, newValue) => setInputMode(newValue)}
          sx={{ mb: 2, borderBottom: '1px solid #444' }}
        >
          <Tab
            icon={<InsertDriveFile />}
            label="Upload File"
            value="file"
            iconPosition="start"
            sx={{ color: '#fff' }}
          />
          <Tab
            icon={<Description />}
            label="Paste JSON"
            value="text"
            iconPosition="start"
            sx={{ color: '#fff' }}
          />
        </Tabs>

        {inputMode === 'file' ? (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ color: '#fff', borderColor: '#555' }}
            >
              Select JSON File
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleFileSelect}
              />
            </Button>

            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadTemplate}
              sx={{ color: '#fff', borderColor: '#555' }}
            >
              Download Template
            </Button>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='Paste your JSON here, e.g.:\n[\n  {\n    "name": "Location Name",\n    "address": "123 Main St",\n    "city": "San Diego",\n    "state": "CA",\n    "latitude": 32.7157,\n    "longitude": -117.1611\n  }\n]'
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#1a1a1a',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#777' },
                  '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleTextSubmit}
                disabled={!jsonText.trim()}
                sx={{ bgcolor: '#1976d2' }}
              >
                Process JSON
              </Button>
              <Button
                variant="outlined"
                onClick={() => setJsonText('')}
                sx={{ color: '#fff', borderColor: '#555' }}
              >
                Clear
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadTemplate}
                sx={{ color: '#fff', borderColor: '#555' }}
              >
                Download Template
              </Button>
            </Box>
          </Box>
        )}

        {locations.length > 0 && (
          <Alert severity="info" sx={{ bgcolor: '#1a3a5f', color: '#fff' }}>
            {file ? `Selected file: ${file.name}` : 'JSON data loaded'} ({locations.length} location{locations.length !== 1 ? 's' : ''} found)
          </Alert>
        )}

        {importing && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#fff' }}>
              Importing locations... {Math.round(progress)}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {results && (
          <Box sx={{ mt: 3 }}>
            <Alert
              severity={results.failed === 0 ? 'success' : 'warning'}
              sx={{ bgcolor: results.failed === 0 ? '#1a5f1a' : '#5f3a1a', color: '#fff', mb: 2 }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                Import Complete
              </Typography>
              <Typography>
                Successfully imported: {results.success} / {results.total}
              </Typography>
              {results.failed > 0 && (
                <Typography>Failed: {results.failed}</Typography>
              )}
            </Alert>

            {results.errors.length > 0 && (
              <TableContainer component={Paper} sx={{ bgcolor: '#1a1a1a', mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#fff' }}>Location</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.errors.map((error, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ color: '#fff' }}>{error.name}</TableCell>
                        <TableCell sx={{ color: '#f44336' }}>{error.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Preview Locations ({locations.length})</Typography>
          <IconButton onClick={() => setPreviewOpen(false)} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1a1a1a', maxHeight: '70vh', overflow: 'auto' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#fff' }}>
              Select locations to import. You can edit or remove locations before saving.
            </Typography>
            <Chip
              label={`${selectedLocations.length} selected`}
              sx={{ bgcolor: '#1976d2', color: '#fff' }}
            />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff', width: 50 }}>Select</TableCell>
                  <TableCell sx={{ color: '#fff' }}>#</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Name</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Address</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Status</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Errors</TableCell>
                  <TableCell sx={{ color: '#fff', width: 120 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locations.map((loc) => (
                  <TableRow 
                    key={loc._index}
                    sx={{
                      bgcolor: selectedLocations.includes(loc._index) ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedLocations.includes(loc._index)}
                        onChange={() => handleToggleLocation(loc._index)}
                        disabled={!loc._valid}
                        sx={{ color: '#fff' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#fff' }}>{loc._index + 1}</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 500 }}>{loc.name || 'N/A'}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      {loc.onlineOnly ? (
                        <Chip label="Online Only" size="small" sx={{ bgcolor: '#1976d2', color: '#fff' }} />
                      ) : (
                        `${loc.address || 'N/A'}, ${loc.city || ''} ${loc.state || ''}`
                      )}
                    </TableCell>
                    <TableCell>
                      {loc._valid ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Valid"
                          size="small"
                          sx={{ bgcolor: '#4caf50', color: '#fff' }}
                        />
                      ) : (
                        <Chip
                          icon={<ErrorIcon />}
                          label="Invalid"
                          size="small"
                          sx={{ bgcolor: '#f44336', color: '#fff' }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: '#f44336', fontSize: '0.7rem', maxWidth: 200 }}>
                      {loc._errors.length > 0 ? (
                        <Tooltip title={loc._errors.join(', ')}>
                          <Typography noWrap>{loc._errors[0]}...</Typography>
                        </Tooltip>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditLocation(loc)}
                            sx={{ color: '#1976d2' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveLocation(loc._index)}
                            sx={{ color: '#f44336' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #444' }}>
          <Button onClick={() => setPreviewOpen(false)} sx={{ color: '#fff' }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setSelectedLocations(locations.filter(l => l._valid).map(l => l._index));
            }}
            sx={{ color: '#fff' }}
          >
            Select All Valid
          </Button>
          <Button
            onClick={() => setSelectedLocations([])}
            sx={{ color: '#fff' }}
          >
            Deselect All
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={importing || selectedLocations.length === 0}
            startIcon={<Save />}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          >
            Save {selectedLocations.length} Location{selectedLocations.length !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingLocation(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a1a1a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Edit Location</Typography>
          <IconButton onClick={() => {
            setEditDialogOpen(false);
            setEditingLocation(null);
          }} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1a1a1a', maxHeight: '70vh', overflow: 'auto' }}>
          {editingLocation && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name *"
                  value={editingLocation.name || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editingLocation.onlineOnly || false}
                      onChange={(e) => setEditingLocation({ ...editingLocation, onlineOnly: e.target.checked })}
                      sx={{ color: '#fff' }}
                    />
                  }
                  label={<Typography sx={{ color: '#fff' }}>Online Only Service</Typography>}
                />
              </Grid>
              {!editingLocation.onlineOnly && (
                <>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={editingLocation.address || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, address: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="City"
                      value={editingLocation.city || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, city: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="State"
                      value={editingLocation.state || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, state: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Zip Code"
                      value={editingLocation.zipCode || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, zipCode: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      type="number"
                      value={editingLocation.latitude || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, latitude: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      type="number"
                      value={editingLocation.longitude || ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, longitude: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={editingLocation.description || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, description: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editingLocation.phone || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, phone: formatPhoneNumber(e.target.value) })}
                  placeholder="(xxx) xxx-xxxx"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editingLocation.email || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, email: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Website"
                  value={editingLocation.website || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, website: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hours"
                  value={editingLocation.hours || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, hours: e.target.value })}
                  placeholder="Mon-Fri 09:00-17:00"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={editingLocation.categories || []}
                  onChange={(e, newValue) => setEditingLocation({ ...editingLocation, categories: newValue })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Categories"
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip label={option} {...getTagProps({ index })} key={index} />
                    ))
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={editingLocation.resources || []}
                  onChange={(e, newValue) => setEditingLocation({ ...editingLocation, resources: newValue })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Resources"
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a', color: '#fff' } }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip label={option} {...getTagProps({ index })} key={index} />
                    ))
                  }
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1a1a1a', borderTop: '1px solid #444' }}>
          <Button
            onClick={() => {
              setEditDialogOpen(false);
              setEditingLocation(null);
            }}
            sx={{ color: '#fff' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            startIcon={<Save />}
            sx={{ bgcolor: '#1976d2' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchImport;

