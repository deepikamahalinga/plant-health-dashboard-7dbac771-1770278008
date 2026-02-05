import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Types (would typically be in separate files)
interface Plant {
  id: string;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

interface SoilData {
  id: string;
  plantId: string;
  timestamp: string;
  moisture: number;
}

// API client functions (would typically be in separate files)
const api = {
  getPlant: async (id: string): Promise<Plant> => {
    // Implementation would go here
    return {} as Plant;
  },
  getSoilData: async (plantId: string): Promise<SoilData[]> => {
    // Implementation would go here
    return [] as SoilData[];
  },
  deletePlant: async (id: string): Promise<void> => {
    // Implementation would go here
  }
};

const PlantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [soilData, setSoilData] = useState<SoilData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id) throw new Error('No plant ID provided');
      
      const [plantData, soilMeasurements] = await Promise.all([
        api.getPlant(id),
        api.getSoilData(id)
      ]);
      
      setPlant(plantData);
      setSoilData(soilMeasurements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      if (!plant?.id) return;
      await api.deletePlant(plant.id);
      navigate('/plants');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete plant');
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="p-4">
        <Alert severity="warning">Plant not found</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-gray-500">
          <li><a href="/plants" className="hover:text-blue-600">Plants</a></li>
          <li>/</li>
          <li className="text-gray-900">Plant Details</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Plant Details
        </h1>
        <div className="space-x-4">
          <Button
            variant="outlined"
            onClick={() => navigate(`/plants/${plant.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Plant Details */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{plant.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Health Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(plant.healthStatus)}`}>
                {plant.healthStatus}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Soil Data Chart */}
      {soilData.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Soil Moisture History</h2>
          <div className="h-[400px]">
            <LineChart
              width={800}
              height={350}
              data={soilData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="moisture" stroke="#8884d8" />
            </LineChart>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this plant? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PlantDetail;