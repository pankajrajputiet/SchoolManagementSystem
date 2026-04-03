import { Box, Typography, Card, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import axiosInstance from '@/api/axiosInstance';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users?limit=100');
      // API returns { success, message, data: { data: users, pagination }, statusCode }
      const usersData = response.data.data?.data || response.data.data || [];
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      superadmin: 'primary',
      schooladmin: 'success',
      admin: 'success',
      teacher: 'info',
      student: 'warning',
    };
    return colors[role] || 'default';
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getRoleColor(params.value)}
          size="small"
        />
      ),
    },
    { field: 'phone', headerName: 'Phone', width: 150 },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'error'}
          size="small"
        />
      ),
    },
  ];

  const rows = users.map((u) => ({ ...u, id: u._id }));

  return (
    <Box>
      <Typography variant="h5" className="mb-4">
        User Management
      </Typography>

      <Card className="mb-4">
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            View and manage all users across schools. User creation and editing is done through individual school admins.
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
          />
        )}
      </Box>
    </Box>
  );
};

export default ManageUsers;
