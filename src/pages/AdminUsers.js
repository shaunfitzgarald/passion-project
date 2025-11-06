import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getAllUsers, updateUserRole } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

const AdminUsers = () => {
  const { isAdmin: currentUserIsAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUserIsAdmin) {
      loadUsers();
    }
  }, [currentUserIsAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    const result = await getAllUsers();
    if (!result.error) {
      setUsers(result.documents);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    const result = await updateUserRole(userId, newRole);
    if (!result.error) {
      await loadUsers();
    } else {
      alert('Error updating user role: ' + result.error);
    }
  };

  if (!currentUserIsAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">You do not have admin access.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, color: '#fff' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        User Management
      </Typography>

      <TableContainer component={Paper} sx={{ bgcolor: '#2a2a2a' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>Email</TableCell>
              <TableCell sx={{ color: '#fff' }}>Display Name</TableCell>
              <TableCell sx={{ color: '#fff' }}>Role</TableCell>
              <TableCell sx={{ color: '#fff' }}>Created</TableCell>
              <TableCell sx={{ color: '#fff' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ color: '#fff', textAlign: 'center' }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell sx={{ color: '#fff' }}>{user.email || user.id}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{user.displayName || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role || 'user'}
                      color={user.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#fff' }}>
                    {user.createdAt
                      ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={user.role || 'user'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        sx={{
                          color: '#fff',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#555',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#777',
                          },
                          '& .MuiSvgIcon-root': {
                            color: '#fff',
                          },
                        }}
                      >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminUsers;

