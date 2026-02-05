import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Types (would typically be imported from a types file)
type HealthStatus = 'healthy' | 'warning' | 'critical';

interface PlantFormData {
  id: string;
  healthStatus: HealthStatus;
}

// Validation schema
const plantSchema = z.object({
  id: z.string().uuid(),
  healthStatus: z.enum(['healthy', 'warning', 'critical']),
});

const PlantCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlantFormData>({
    id: uuidv4(), // Pre-generate UUID
    healthStatus: 'healthy',
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string[];
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    try {
      // Validate form data
      const validatedData = plantSchema.parse(formData);
      setIsLoading(true);

      // API call would go here
      // await createPlant(validatedData);

      // Success handling
      navigate('/plants'); // Redirect to plants list
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationErrors(err.flatten().fieldErrors);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/plants');
  };

  const handleReset = () => {
    setFormData({
      id: uuidv4(),
      healthStatus: 'healthy',
    });
    setValidationErrors({});
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Plant</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="id"
              className="block text-sm font-medium text-gray-700"
            >
              Plant ID
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100"
            />
            {validationErrors.id?.map((error, index) => (
              <p key={index} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>

          <div>
            <label
              htmlFor="healthStatus"
              className="block text-sm font-medium text-gray-700"
            >
              Health Status
            </label>
            <select
              id="healthStatus"
              name="healthStatus"
              value={formData.healthStatus}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            {validationErrors.healthStatus?.map((error, index) => (
              <p key={index} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Plant'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlantCreate;