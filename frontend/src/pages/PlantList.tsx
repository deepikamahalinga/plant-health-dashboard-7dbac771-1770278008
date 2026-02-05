import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Skeleton
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon 
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { Plant, HealthStatus } from '../types/plant';
import { fetchPlants, deletePlant } from '../api/plants';

const HEALTH_STATUS_COLORS = {
  healthy: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800'
};

const PlantList: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Plant>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery(
    ['plants', page, rowsPerPage, searchTerm, sortBy, sortOrder],
    () => fetchPlants({ page, limit: rowsPerPage, search: searchTerm, sortBy, sortOrder })
  );

  const handleSort = (column: keyof Plant) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlant(id);
      refetch();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting plant:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={60} className="mb-2" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-4">Error loading plants: {error?.message}</p>
        <Button variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data?.plants.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 mb-4">No plants found</p>
        <Button 
          variant="contained" 
          onClick={() => router.push('/plants/new')}
        >
          Add New Plant
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <TextField
            placeholder="Search plants..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon className="text-gray-400 mr-2" />,
            }}
            className="w-64"
          />
        </div>
        <Button 
          variant="contained" 
          onClick={() => router.push('/plants/new')}
        >
          Add New Plant
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                onClick={() => handleSort('id')}
                className="cursor-pointer"
              >
                ID
              </TableCell>
              <TableCell 
                onClick={() => handleSort('healthStatus')}
                className="cursor-pointer"
              >
                Health Status
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.plants.map((plant) => (
              <TableRow key={plant.id}>
                <TableCell>{plant.id}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${HEALTH_STATUS_COLORS[plant.healthStatus]}`}>
                    {plant.healthStatus}
                  </span>
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => router.push(`/plants/${plant.id}`)}
                    size="small"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => router.push(`/plants/${plant.id}/edit`)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => {
                      setPlantToDelete(plant.id);
                      setDeleteDialogOpen(true);
                    }}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        component="div"
        count={data.total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this plant?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => plantToDelete && handleDelete(plantToDelete)}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PlantList;