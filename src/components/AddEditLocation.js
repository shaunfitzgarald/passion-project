import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Chip,
  Typography,
  Divider,
  Paper,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Checkbox,
  Box as MuiBox,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  Add, 
  LocationOn,
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
  Phone,
  Email,
  Language,
  AccessTime,
  Help,
  PhotoCamera,
  Delete as DeleteIcon,
  SmartToy,
  Send,
} from '@mui/icons-material';
import { addLocation, updateLocation } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';
import { geocodeAddress, reverseGeocode } from '../services/geocodingService';
import { uploadLocationPhoto } from '../services/storageService';
import { extractLocationFromText } from '../services/geminiService';

// Predefined categories and resource types
const CATEGORY_OPTIONS = [
  'Food Assistance',
  'Housing',
  'Healthcare',
  'Mental Health',
  'Education',
  'Employment',
  'Legal Services',
  'Transportation',
  'Childcare',
  'Senior Services',
  'Youth Services',
  'Community Center',
  'Religious Organization',
  'Non-Profit',
  'Government',
  'Other',
];

const RESOURCE_OPTIONS = [
  'Food Pantry',
  'Hot Meals',
  'Soup Kitchen',
  'Emergency Shelter',
  'Transitional Housing',
  'Rental Assistance',
  'Medical Clinic',
  'Dental Services',
  'Mental Health Counseling',
  'Substance Abuse Treatment',
  'Prescription Assistance',
  'Vaccinations',
  'Health Screenings',
  'Job Training',
  'Resume Help',
  'Job Placement',
  'Legal Aid',
  'Immigration Services',
  'Public Benefits Assistance',
  'ID/Driver\'s License Help',
  'Computer/Internet Access',
  'Laundry Services',
  'Showers',
  'Mail Services',
  'Phone/Charging',
  'Clothing',
  'Personal Care Items',
  'Hygiene Products',
  'Bus Passes',
  'Childcare Services',
  'After School Programs',
  'Tutoring',
  'ESL Classes',
  'Financial Literacy',
  'Other',
];

const BENEFIT_OPTIONS = [
  'Free',
  'Low Cost',
  'Sliding Scale',
  'Insurance Accepted',
  'Medicaid Accepted',
  'Medicare Accepted',
  'SNAP Accepted',
  'WIC Accepted',
  'No ID Required',
  'Walk-in Welcome',
  'Appointment Required',
  'Multilingual Services',
  'Wheelchair Accessible',
  'LGBTQ+ Friendly',
  'Veteran Services',
];

// Icon options for locations
const ICON_OPTIONS = [
  { value: 'home', label: 'Home/Housing', icon: Home },
  { value: 'hotel', label: 'Shelter', icon: Hotel },
  { value: 'local_hospital', label: 'Healthcare', icon: LocalHospital },
  { value: 'restaurant', label: 'Food', icon: Restaurant },
  { value: 'restaurant_menu', label: 'Food Pantry', icon: RestaurantMenu },
  { value: 'school', label: 'Education', icon: School },
  { value: 'work', label: 'Employment', icon: Work },
  { value: 'directions_bus', label: 'Transportation', icon: DirectionsBus },
  { value: 'child_care', label: 'Childcare', icon: ChildCare },
  { value: 'local_library', label: 'Community Center', icon: LocalLibrary },
  { value: 'volunteer_activism', label: 'Non-Profit', icon: VolunteerActivism },
  { value: 'local_pharmacy', label: 'Pharmacy', icon: LocalPharmacy },
  { value: 'help', label: 'Other', icon: Help },
  { value: 'location_on', label: 'Default', icon: LocationOn },
];

// Format phone number to (xxx) xxx-xxxx
const formatPhoneNumber = (value) => {
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

// Parse hours string into structured format
const parseHoursString = (hoursString) => {
  if (!hoursString) return { days: {}, specialHours: '' };
  
  const days = {
    monday: { open: '', close: '', closed: false },
    tuesday: { open: '', close: '', closed: false },
    wednesday: { open: '', close: '', closed: false },
    thursday: { open: '', close: '', closed: false },
    friday: { open: '', close: '', closed: false },
    saturday: { open: '', close: '', closed: false },
    sunday: { open: '', close: '', closed: false },
  };
  
  // Try to parse common formats
  // For now, if it's a simple string, keep it as special hours
  return { days, specialHours: hoursString };
};

// Format structured hours back to string
const formatHoursString = (hoursData) => {
  if (hoursData.specialHours) return hoursData.specialHours;
  
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayAbbrevs = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  let result = [];
  let currentRange = null;
  
  for (let i = 0; i < dayNames.length; i++) {
    const day = dayNames[i];
    const dayData = hoursData.days[day];
    
    if (dayData.closed) {
      if (currentRange) {
        result.push(currentRange);
        currentRange = null;
      }
      continue;
    }
    
    const hours = dayData.open && dayData.close ? `${dayData.open}-${dayData.close}` : '';
    
    if (!currentRange) {
      currentRange = { start: i, end: i, hours };
    } else if (currentRange.hours === hours) {
      currentRange.end = i;
    } else {
      result.push(currentRange);
      currentRange = { start: i, end: i, hours };
    }
  }
  
  if (currentRange) result.push(currentRange);
  
  return result.map(range => {
    if (range.start === range.end) {
      return `${dayAbbrevs[range.start]}${range.hours ? ` ${range.hours}` : ''}`;
    } else {
      return `${dayAbbrevs[range.start]}-${dayAbbrevs[range.end]}${range.hours ? ` ${range.hours}` : ''}`;
    }
  }).join(', ');
};

const AddEditLocation = ({ location, onClose, onSave, userId }) => {
  const { user, isAdmin } = useAuth();
  const actualUserId = userId || user?.uid;
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    hours: '',
    categories: [],
    resources: [],
    benefits: [],
    notes: '',
    icon: 'location_on', // Default icon
    photos: [], // Array of photo URLs
    onlineOnly: false, // Flag for online-only services
  });
  const [useStructuredHours, setUseStructuredHours] = useState(false);
  const [structuredHours, setStructuredHours] = useState({
    days: {
      monday: { open: '', close: '', closed: false },
      tuesday: { open: '', close: '', closed: false },
      wednesday: { open: '', close: '', closed: false },
      thursday: { open: '', close: '', closed: false },
      friday: { open: '', close: '', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false },
    },
    specialHours: '',
  });
  const [customResource, setCustomResource] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        // Generate a temporary ID for the location (or use existing)
        const tempLocationId = location?.id || `temp_${Date.now()}`;
        const result = await uploadLocationPhoto(file, tempLocationId, actualUserId);

        if (!result.error && result.url) {
          uploadedUrls.push(result.url);
        } else {
          alert(`Error uploading ${file.name}: ${result.error}`);
        }
      }

      if (uploadedUrls.length > 0) {
        handleChange('photos', [...formData.photos, ...uploadedUrls]);
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading photos: ' + error.message);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handlePhotoRemove = (photoUrl) => {
    handleChange('photos', formData.photos.filter(url => url !== photoUrl));
  };

  const handleAiExtract = async () => {
    if (!aiQuery.trim()) {
      setAiError('Please enter a description of the location');
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const result = await extractLocationFromText(aiQuery);
      
      if (result.error) {
        setAiError(result.error);
      } else if (result.locationData) {
        const data = result.locationData;
        
        // Update form with AI-extracted data
        setFormData((prev) => ({
          ...prev,
          name: data.name || prev.name,
          address: data.address || prev.address,
          city: data.city || prev.city,
          state: data.state || prev.state,
          zipCode: data.zipCode || prev.zipCode,
          description: data.description || prev.description,
          phone: data.phone ? formatPhoneNumber(data.phone) : prev.phone,
          email: data.email || prev.email,
          website: data.website || prev.website,
          hours: data.hours || prev.hours,
          categories: data.categories && data.categories.length > 0 ? data.categories : prev.categories,
          resources: data.resources && data.resources.length > 0 ? data.resources : prev.resources,
          benefits: data.benefits && data.benefits.length > 0 ? data.benefits : prev.benefits,
          icon: data.icon || prev.icon,
          notes: data.notes || prev.notes,
        }));

        // If address is provided, trigger geocoding
        if (data.address) {
          setTimeout(() => {
            // Trigger geocoding by simulating address change
            const addressParts = [data.address, data.city, data.state, data.zipCode].filter(Boolean);
            if (addressParts.length > 0) {
              geocodeAddress(addressParts.join(', '), data.city, data.state, data.zipCode)
                .then((geoResult) => {
                  if (!geoResult.error && geoResult.latitude && geoResult.longitude) {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: geoResult.latitude.toString(),
                      longitude: geoResult.longitude.toString(),
                    }));
                  }
                });
            }
          }, 500);
        }

        setAiQuery('');
        setShowAiAssistant(false);
      }
    } catch (error) {
      console.error('AI extraction error:', error);
      setAiError('Failed to extract location information. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      // Format phone number if it exists
      const formattedPhone = location.phone ? formatPhoneNumber(location.phone) : '';
      
      setFormData({
        name: location.name || '',
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        zipCode: location.zipCode || '',
        latitude: location.latitude ? location.latitude.toString() : '',
        longitude: location.longitude ? location.longitude.toString() : '',
        description: location.description || '',
        phone: formattedPhone,
        email: location.email || '',
        website: location.website || '',
        hours: location.hours || '',
        categories: location.categories || [],
        resources: location.resources || [],
        benefits: location.benefits || [],
        notes: location.notes || '',
        icon: location.icon || 'location_on',
        photos: location.photos || [],
        onlineOnly: location.onlineOnly || false,
      });
      
      // Try to parse hours into structured format
      if (location.hours) {
        const parsed = parseHoursString(location.hours);
        setStructuredHours(parsed);
      }
    }
  }, [location]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleChange('phone', formatted);
  };

  const handleStructuredHoursChange = (day, field, value) => {
    setStructuredHours((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          [field]: value,
        },
      },
    }));
    // Auto-update the hours string
    const updatedHours = {
      ...structuredHours,
      days: {
        ...structuredHours.days,
        [day]: {
          ...structuredHours.days[day],
          [field]: value,
        },
      },
    };
    handleChange('hours', formatHoursString(updatedHours));
  };

  // Debounce timer for geocoding
  const geocodeTimerRef = useRef(null);
  const reverseGeocodeTimerRef = useRef(null);

  // Geocode address when address fields change
  useEffect(() => {
    if (geocodeTimerRef.current) {
      clearTimeout(geocodeTimerRef.current);
    }

    // Only geocode if address is provided and lat/lng are empty
    const hasAddress = formData.address.trim();
    const lat = formData.latitude?.toString().trim();
    const lng = formData.longitude?.toString().trim();
    const hasCoordinates = lat && lng && lat !== '0' && lng !== '0';

    // Only geocode if we have an address and no valid coordinates
    if (hasAddress && !hasCoordinates) {
      geocodeTimerRef.current = setTimeout(async () => {
        setGeocoding(true);
        console.log('Geocoding address:', formData.address, formData.city, formData.state, formData.zipCode);
        const result = await geocodeAddress(
          formData.address,
          formData.city,
          formData.state,
          formData.zipCode
        );

        console.log('Geocoding result:', result);
        if (!result.error && result.latitude && result.longitude) {
          setFormData((prev) => {
            // Only update if coordinates are still empty
            const currentLat = prev.latitude?.toString().trim();
            const currentLng = prev.longitude?.toString().trim();
            if (currentLat && currentLng && currentLat !== '0' && currentLng !== '0') {
              // User has manually entered coordinates, don't overwrite
              return prev;
            }
            
            return {
              ...prev,
              latitude: result.latitude.toString(),
              longitude: result.longitude.toString(),
              // Auto-fill address components if they're empty
              address: prev.address || result.addressComponents.street || result.formattedAddress.split(',')[0],
              city: prev.city || result.addressComponents.city,
              state: prev.state || result.addressComponents.state,
              zipCode: prev.zipCode || result.addressComponents.zipCode,
            };
          });
        } else if (result.error) {
          console.error('Geocoding error:', result.error);
        }
        setGeocoding(false);
      }, 1000); // Wait 1 second after user stops typing
    }

    return () => {
      if (geocodeTimerRef.current) {
        clearTimeout(geocodeTimerRef.current);
      }
    };
  }, [formData.address, formData.city, formData.state, formData.zipCode]);

  // Reverse geocode when coordinates change
  useEffect(() => {
    if (reverseGeocodeTimerRef.current) {
      clearTimeout(reverseGeocodeTimerRef.current);
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && !formData.address.trim()) {
      reverseGeocodeTimerRef.current = setTimeout(async () => {
        setGeocoding(true);
        const result = await reverseGeocode(lat, lng);

        if (!result.error && result.addressComponents) {
          setFormData((prev) => ({
            ...prev,
            address: prev.address || result.addressComponents.street || result.formattedAddress.split(',')[0],
            city: prev.city || result.addressComponents.city,
            state: prev.state || result.addressComponents.state,
            zipCode: prev.zipCode || result.addressComponents.zipCode,
          }));
        }
        setGeocoding(false);
      }, 1000); // Wait 1 second after user stops typing
    }

    return () => {
      if (reverseGeocodeTimerRef.current) {
        clearTimeout(reverseGeocodeTimerRef.current);
      }
    };
  }, [formData.latitude, formData.longitude]);

  const handleAddCustomResource = () => {
    if (customResource.trim() && !formData.resources.includes(customResource.trim())) {
      handleChange('resources', [...formData.resources, customResource.trim()]);
      setCustomResource('');
    }
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !formData.categories.includes(customCategory.trim())) {
      handleChange('categories', [...formData.categories, customCategory.trim()]);
      setCustomCategory('');
    }
  };

  const handleRemoveItem = (field, item) => {
    handleChange(field, formData[field].filter((i) => i !== item));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    // For online-only services, address and coordinates are optional
    if (!formData.onlineOnly) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.latitude || !formData.longitude) {
        if (!formData.latitude) newErrors.latitude = 'Latitude is required';
        if (!formData.longitude) newErrors.longitude = 'Longitude is required';
      }
    } else {
      // For online-only services, website or contact info should be provided
      if (!formData.website.trim() && !formData.email.trim() && !formData.phone.trim()) {
        newErrors.onlineOnly = 'Please provide at least a website, email, or phone number for online services';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const locationData = {
      ...formData,
      // Only include coordinates if not online-only
      ...(formData.onlineOnly ? {} : {
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      }),
      createdBy: user?.uid || null,
    };

    let result;
    if (location) {
      result = await updateLocation(location.id, locationData);
    } else {
      // Pass isAdmin flag so admins can add directly without approval
      result = await addLocation(locationData, actualUserId, isAdmin);
    }

    setLoading(false);
    if (result.error) {
      alert('Error saving location: ' + result.error);
    } else {
      onSave();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* AI Assistant */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<SmartToy />}
          onClick={() => setShowAiAssistant(!showAiAssistant)}
          fullWidth
          sx={{
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#1565c0',
              bgcolor: 'rgba(25, 118, 210, 0.1)',
            },
          }}
        >
          {showAiAssistant ? 'Hide' : 'Show'} AI Assistant
        </Button>
        
        <Collapse in={showAiAssistant}>
          <Paper sx={{ mt: 2, p: 2, bgcolor: '#2a2a2a' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#fff' }}>
              Describe the location in natural language and AI will fill out the form for you:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g., 'Add a homeless shelter at 123 Main St, San Diego, CA. It's open 24/7 and provides meals and beds.'"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAiExtract();
                  }
                }}
                disabled={aiLoading}
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#1a1a1a',
                    color: '#fff',
                    '& fieldset': {
                      borderColor: '#555',
                    },
                    '&:hover fieldset': {
                      borderColor: '#777',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
                inputProps={{
                  style: { color: '#fff' },
                }}
              />
              <IconButton
                onClick={handleAiExtract}
                disabled={aiLoading || !aiQuery.trim()}
                sx={{
                  bgcolor: '#1976d2',
                  color: '#fff',
                  '&:hover': { bgcolor: '#1565c0' },
                  '&:disabled': { bgcolor: '#555' },
                }}
              >
                {aiLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <Send />}
              </IconButton>
            </Box>
            {aiError && (
              <Alert severity="error" sx={{ mt: 1, bgcolor: '#3a1a1a', color: '#fff' }}>
                {aiError}
              </Alert>
            )}
            <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>
              💡 Example: "Add a food pantry called Community Kitchen at 456 Oak Avenue, San Diego. It's open Monday-Friday 9am-5pm and accepts SNAP benefits."
            </Typography>
          </Paper>
        </Collapse>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Name *"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.onlineOnly}
                onChange={(e) => handleChange('onlineOnly', e.target.checked)}
                sx={{ color: '#fff' }}
              />
            }
            label={
              <Typography variant="body1" sx={{ color: '#fff' }}>
                Online Only Service (no physical location)
              </Typography>
            }
          />
          {formData.onlineOnly && (
            <Alert severity="info" sx={{ mt: 1, bgcolor: '#1a3a5f', color: '#fff' }}>
              This service is provided online only. Address and coordinates are not required, but please provide a website, email, or phone number.
            </Alert>
          )}
          {errors.onlineOnly && (
            <Typography variant="caption" sx={{ color: '#f44336', display: 'block', mt: 0.5 }}>
              {errors.onlineOnly}
            </Typography>
          )}
        </Grid>

        {!formData.onlineOnly && (
          <>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Address *"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address || (geocoding ? 'Looking up coordinates...' : 'Coordinates will be auto-filled')}
                required
                InputProps={{
                  endAdornment: geocoding && (
                    <InputAdornment position="end">
                      <LocationOn sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Zip Code"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Latitude *"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                error={!!errors.latitude}
                helperText={errors.latitude || (geocoding ? 'Looking up address...' : 'Auto-filled from address')}
                required
                InputProps={{
                  endAdornment: geocoding && (
                    <InputAdornment position="end">
                      <LocationOn sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Longitude *"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                error={!!errors.longitude}
                helperText={errors.longitude || (geocoding ? 'Looking up address...' : 'Auto-filled from address')}
                required
                InputProps={{
                  endAdornment: geocoding && (
                    <InputAdornment position="end">
                      <LocationOn sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
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
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <FormLabel component="legend" sx={{ mb: 2, color: '#fff' }}>
            Map Icon *
          </FormLabel>
          <RadioGroup
            row
            value={formData.icon}
            onChange={(e) => handleChange('icon', e.target.value)}
            sx={{ flexWrap: 'wrap', gap: 1 }}
          >
            {ICON_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              return (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={
                    <Radio
                      sx={{
                        color: '#fff',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconComponent sx={{ fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        {option.label}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    border: formData.icon === option.value ? '2px solid' : '1px solid',
                    borderColor: formData.icon === option.value ? 'primary.main' : '#555',
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    m: 0,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(144, 202, 249, 0.1)',
                    },
                  }}
                />
              );
            })}
          </RadioGroup>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="(xxx) xxx-xxxx"
            InputProps={{
              startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#999' }} /></InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Website"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useStructuredHours}
                  onChange={(e) => setUseStructuredHours(e.target.checked)}
                  sx={{ color: '#fff' }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  Use structured hours input (day-by-day)
                </Typography>
              }
            />
          </Box>
          
          {useStructuredHours ? (
            <Paper sx={{ p: 2, bgcolor: '#2a2a2a', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#fff' }}>
                Operating Hours by Day
              </Typography>
              {[
                { key: 'monday', label: 'Monday' },
                { key: 'tuesday', label: 'Tuesday' },
                { key: 'wednesday', label: 'Wednesday' },
                { key: 'thursday', label: 'Thursday' },
                { key: 'friday', label: 'Friday' },
                { key: 'saturday', label: 'Saturday' },
                { key: 'sunday', label: 'Sunday' },
              ].map(({ key, label }) => (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Box sx={{ width: 100 }}>
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {label}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={structuredHours.days[key].closed}
                        onChange={(e) => {
                          const updated = {
                            ...structuredHours,
                            days: {
                              ...structuredHours.days,
                              [key]: {
                                ...structuredHours.days[key],
                                closed: e.target.checked,
                                open: e.target.checked ? '' : structuredHours.days[key].open,
                                close: e.target.checked ? '' : structuredHours.days[key].close,
                              },
                            },
                          };
                          setStructuredHours(updated);
                          handleChange('hours', formatHoursString(updated));
                        }}
                        sx={{ color: '#fff' }}
                      />
                    }
                    label={<Typography variant="caption" sx={{ color: '#999' }}>Closed</Typography>}
                  />
                  {!structuredHours.days[key].closed && (
                    <>
                      <TextField
                        size="small"
                        label="Open"
                        placeholder="09:00"
                        value={structuredHours.days[key].open}
                        onChange={(e) => handleStructuredHoursChange(key, 'open', e.target.value)}
                        sx={{ width: 120 }}
                        helperText="24-hour format (HH:MM)"
                        FormHelperTextProps={{ sx: { color: '#999', fontSize: '0.7rem' } }}
                      />
                      <Typography sx={{ color: '#fff' }}>to</Typography>
                      <TextField
                        size="small"
                        label="Close"
                        placeholder="17:00"
                        value={structuredHours.days[key].close}
                        onChange={(e) => handleStructuredHoursChange(key, 'close', e.target.value)}
                        sx={{ width: 120 }}
                        helperText="24-hour format (HH:MM)"
                        FormHelperTextProps={{ sx: { color: '#999', fontSize: '0.7rem' } }}
                      />
                    </>
                  )}
                </Box>
              ))}
              <TextField
                fullWidth
                size="small"
                label="Special Hours / Notes"
                placeholder="e.g., Closed on holidays, Extended hours during summer"
                value={structuredHours.specialHours}
                onChange={(e) => {
                  const updated = {
                    ...structuredHours,
                    specialHours: e.target.value,
                  };
                  setStructuredHours(updated);
                  handleChange('hours', formatHoursString(updated));
                }}
                sx={{ mt: 2 }}
              />
            </Paper>
          ) : (
            <TextField
              fullWidth
              label="Hours"
              placeholder="e.g., Mon-Fri 09:00-17:00, Sat 10:00-14:00"
              value={formData.hours}
              onChange={(e) => handleChange('hours', e.target.value)}
              helperText="Use 24-hour format (HH:MM). Example: Mon-Fri 09:00-17:00"
              InputProps={{
                startAdornment: <InputAdornment position="start"><AccessTime sx={{ color: '#999' }} /></InputAdornment>,
              }}
              FormHelperTextProps={{ sx: { color: '#999', fontSize: '0.75rem' } }}
            />
          )}
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Categories *
          </Typography>
          <Autocomplete
            multiple
            options={CATEGORY_OPTIONS}
            value={formData.categories}
            onChange={(event, newValue) => handleChange('categories', newValue)}
            renderInput={(params) => <TextField {...params} label="Select Categories" />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} key={option} />
              ))
            }
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField
              size="small"
              placeholder="Add custom category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomCategory();
                }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddCustomCategory}
            >
              Add
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Resources Provided *
          </Typography>
          <Autocomplete
            multiple
            options={RESOURCE_OPTIONS}
            value={formData.resources}
            onChange={(event, newValue) => handleChange('resources', newValue)}
            renderInput={(params) => <TextField {...params} label="Select Resources" />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                  onDelete={() => handleRemoveItem('resources', option)}
                />
              ))
            }
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField
              size="small"
              placeholder="Add custom resource"
              value={customResource}
              onChange={(e) => setCustomResource(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomResource();
                }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddCustomResource}
            >
              Add
            </Button>
          </Box>
          {formData.resources.length > 0 && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Selected Resources:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {formData.resources.map((resource) => (
                  <Chip
                    key={resource}
                    label={resource}
                    onDelete={() => handleRemoveItem('resources', resource)}
                    size="small"
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Benefits & Features
          </Typography>
          <Autocomplete
            multiple
            options={BENEFIT_OPTIONS}
            value={formData.benefits}
            onChange={(event, newValue) => handleChange('benefits', newValue)}
            renderInput={(params) => <TextField {...params} label="Select Benefits" />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} key={option} />
              ))
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>
            Photos
          </Typography>
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              multiple
              type="file"
              onChange={handlePhotoUpload}
              disabled={uploadingPhotos}
            />
            <label htmlFor="photo-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCamera />}
                disabled={uploadingPhotos}
                sx={{ mb: 2 }}
              >
                {uploadingPhotos ? 'Uploading...' : 'Upload Photos'}
              </Button>
            </label>
            {formData.photos.length > 0 && (
              <ImageList sx={{ width: '100%', height: 200 }} cols={3} rowHeight={200}>
                {formData.photos.map((photoUrl, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={photoUrl}
                      alt={`Location photo ${index + 1}`}
                      loading="lazy"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                    <ImageListItemBar
                      title=""
                      actionIcon={
                        <IconButton
                          sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                          onClick={() => handlePhotoRemove(photoUrl)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional Notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any additional information, requirements, or notes..."
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : location ? 'Update Location' : 'Add Location'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddEditLocation;

