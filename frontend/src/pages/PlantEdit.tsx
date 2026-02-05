import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Plant } from '../types/Plant';
import { getPlant, updatePlant } from '../api/plants';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Select } from '../components/Select';

// Validation schema
const plantSchema = z.object({
  id: z.string().uuid(),
  healthStatus: z.enum(['healthy', 'warning', 'critical'])
});

type PlantFormData = z.infer<typeof plantSchema>;

const PlantEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plant, setPlant] = useState<Plant | null>(null);
  const [formData, setFormData] = useState<PlantFormData>({
    id: '',
    healthStatus: 'healthy'
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof PlantFormData, string>>
  >({});

  // Fetch plant data
  useEffect(() => {
    const fetchPlant = async () => {
      try {
        if (!id) return;
        const data = await getPlant(id);
        setPlant(data);
        setFormData({
          id: data.id,
          healthStatus: data.healthStatus
        });
      } catch (err) {
        setError('Plant not found');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchPlant();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    if (plant) {
      setFormData({
        id: plant.id,
        healthStatus: plant.healthStatus
      });
    }
    setValidationErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    try {
      // Validate form data
      const validated = plantSchema.parse(formData);
      
      setLoading(true);
      await updatePlant(validated);
      navigate(`/plants/${formData.id}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Partial<Record<keyof PlantFormData, string>> = {};
        err.errors.forEach(error => {
          if (error.path[0]) {
            errors[error.path[0] as keyof PlantFormData] = error.message;
          }
        });
        setValidationErrors(errors);
      } else {
        setError('Failed to update plant');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="m-4">
        {error}
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Plant</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Health Status
          </label>
          <Select
            name="healthStatus"
            value={formData.healthStatus}
            onChange={handleChange}
            className="mt-1"
            options={[
              { value: 'healthy', label: 'Healthy' },
              { value: 'warning', label: 'Warning' },
              { value: 'critical', label: 'Critical' }
            ]}
          />
          {validationErrors.healthStatus && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.healthStatus}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Updating...' : 'Update Plant'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={resetForm}
            className="flex-1"
          >
            Reset
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/plants/${id}`)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PlantEdit;