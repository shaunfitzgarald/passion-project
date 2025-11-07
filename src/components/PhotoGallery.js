import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
  Button,
} from '@mui/material';
import {
  Close,
  ChevronLeft,
  ChevronRight,
  Fullscreen,
  ZoomIn,
} from '@mui/icons-material';

const PhotoGallery = ({ photos, locationName }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const handleOpenLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrevious(e);
    if (e.key === 'ArrowRight') handleNext(e);
    if (e.key === 'Escape') handleCloseLightbox();
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #444' }}>
        <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>
          Photos ({photos.length}):
        </Typography>
        <ImageList sx={{ width: '100%', height: 150 }} cols={photos.length >= 3 ? 3 : photos.length} rowHeight={150}>
          {photos.slice(0, 6).map((photoUrl, idx) => (
            <ImageListItem
              key={idx}
              sx={{
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
                position: 'relative',
              }}
              onClick={() => handleOpenLightbox(idx)}
            >
              <img
                src={photoUrl}
                alt={`${locationName} photo ${idx + 1}`}
                loading="lazy"
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                }}
              />
              <ImageListItemBar
                sx={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                }}
                actionIcon={
                  <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                    size="small"
                  >
                    <ZoomIn />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
        {photos.length > 6 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Fullscreen />}
            onClick={() => handleOpenLightbox(0)}
            sx={{
              mt: 1,
              borderColor: '#555',
              color: '#fff',
              '&:hover': { borderColor: '#777', bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            View All {photos.length} Photos
          </Button>
        )}
      </Box>

      {/* Lightbox Dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={handleCloseLightbox}
        onKeyDown={handleKeyDown}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            m: 0,
            maxWidth: '100vw',
            maxHeight: '100vh',
            width: '100vw',
            height: '100vh',
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            height: '100%',
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleCloseLightbox}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1301,
              color: '#fff',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
            }}
          >
            <Close />
          </IconButton>

          {/* Previous Button */}
          {photos.length > 1 && (
            <IconButton
              onClick={handlePrevious}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1301,
                color: '#fff',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
              }}
            >
              <ChevronLeft sx={{ fontSize: 40 }} />
            </IconButton>
          )}

          {/* Image */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              p: 4,
            }}
          >
            <Box
              component="img"
              src={photos[currentIndex]}
              alt={`${locationName} photo ${currentIndex + 1}`}
              sx={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: 1,
              }}
            />
            {photos.length > 1 && (
              <Typography
                variant="body2"
                sx={{
                  color: '#fff',
                  mt: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                {currentIndex + 1} / {photos.length}
              </Typography>
            )}
          </Box>

          {/* Next Button */}
          {photos.length > 1 && (
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1301,
                color: '#fff',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
              }}
            >
              <ChevronRight sx={{ fontSize: 40 }} />
            </IconButton>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoGallery;

