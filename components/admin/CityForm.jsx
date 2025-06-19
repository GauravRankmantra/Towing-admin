'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Building2, MapPin, Plus, X } from 'lucide-react';

const stateOptions = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export default function CityForm({ onSubmit, initialData = null, onCancel }) {
  const [formData, setFormData] = useState({
    cityName: initialData?.cityName || '',
    state: initialData?.state || '',
    zipCodes: initialData?.zipCodes || [''],
    mapLink: initialData?.mapLink || '',
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cityName.trim()) {
      newErrors.cityName = 'City name is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    const validZipCodes = formData.zipCodes.filter(zip => zip.trim());
    if (validZipCodes.length === 0) {
      newErrors.zipCodes = 'At least one zip code is required';
    } else {
      formData.zipCodes.forEach((zip, index) => {
        if (zip.trim() && !/^\d{5}(-\d{4})?$/.test(zip.trim())) {
          newErrors[`zipCode_${index}`] = 'Invalid zip code format';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const submitData = {
        ...formData,
        zipCodes: formData.zipCodes.filter(zip => zip.trim())
      };
      
      if (onSubmit) {
        onSubmit(submitData);
      }
      
      toast.success(initialData ? 'City updated successfully!' : 'City added successfully!');
      
      if (!initialData) {
        // Reset form for new entries
        setFormData({
          cityName: '',
          state: '',
          zipCodes: [''],
          mapLink: '',
          notes: ''
        });
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addZipCode = () => {
    setFormData(prev => ({
      ...prev,
      zipCodes: [...prev.zipCodes, '']
    }));
  };

  const removeZipCode = (index) => {
    if (formData.zipCodes.length === 1) {
      toast.error('At least one zip code is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      zipCodes: prev.zipCodes.filter((_, i) => i !== index)
    }));
  };

  const updateZipCode = (index, value) => {
    setFormData(prev => ({
      ...prev,
      zipCodes: prev.zipCodes.map((zip, i) => i === index ? value : zip)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-blue-600" />
          {initialData ? 'Edit City' : 'Add New City'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City Name *
            </label>
            <input
              type="text"
              value={formData.cityName}
              onChange={(e) => setFormData(prev => ({ ...prev, cityName: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.cityName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Los Angeles"
            />
            {errors.cityName && (
              <p className="text-red-600 text-sm mt-1">{errors.cityName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <select
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select State</option>
              {stateOptions.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-600 text-sm mt-1">{errors.state}</p>
            )}
          </div>
        </div>

        {/* Zip Codes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Zip Codes *
            </label>
            <button
              type="button"
              onClick={addZipCode}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Zip Code</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.zipCodes.map((zipCode, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => updateZipCode(index, e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors[`zipCode_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="90210"
                  />
                  {errors[`zipCode_${index}`] && (
                    <p className="text-red-600 text-sm mt-1">{errors[`zipCode_${index}`]}</p>
                  )}
                </div>
                {formData.zipCodes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeZipCode(index)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
          {errors.zipCodes && (
            <p className="text-red-600 text-sm mt-1">{errors.zipCodes}</p>
          )}
        </div>

        {/* Map Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Map Link
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="url"
              value={formData.mapLink}
              onChange={(e) => setFormData(prev => ({ ...prev, mapLink: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Additional information about this city or service area..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            className={`px-8 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors ${
              isSubmitting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update City' : 'Add City')}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}