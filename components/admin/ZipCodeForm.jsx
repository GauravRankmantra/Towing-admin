'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Plus, X, Upload, MapPin, Phone, Mail, Globe, Clock, Image as ImageIcon } from 'lucide-react'; // Renamed Image to ImageIcon to avoid conflict

export default function ZipCodeForm({ onSubmit, initialData = null }) {
  // State to hold the form data, including image files and their preview URLs
  const [formData, setFormData] = useState({
    zipCode: initialData?.zipCode || '',
    cityName: initialData?.cityName || '',
    mapLink: initialData?.mapLink || '',
    companies: initialData?.companies || [
      {
        id: Date.now(),
        name: '',
        phone: '',
        email: '',
        website: '',
        location: '',
        exactAddress: '',
        distance: '',
        operatingHours: '',
        services: [],
        // images will now store objects like { id, file, previewUrl, name }
        images: [], 
        mapLink: ''
      }
    ]
  });

  // State for form validation errors
  const [errors, setErrors] = useState({});
  // State to track submission status for UI feedback
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined options for services offered by companies
  const serviceOptions = [
    'Flatbed Towing',
    'Heavy-Duty Towing',
    'Roadside Assistance',
    'Jump Start',
    'Tire Change',
    'Lockout Service',
    'Fuel Delivery',
    'Winch Out',
    'Long Distance Towing',
    'Motorcycle Towing'
  ];

  /**
   * Validates the form fields before submission.
   * Sets errors in the state if validation fails.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate Zip Code
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid zip code format (e.g., 90210 or 90210-1234)';
    }

    // Validate City Name
    if (!formData.cityName.trim()) {
      newErrors.cityName = 'City name is required';
    }

    // Validate each company's details
    formData.companies.forEach((company, index) => {
      if (!company.name.trim()) {
        newErrors[`company_${index}_name`] = 'Company name is required';
      }
      if (!company.phone.trim()) {
        newErrors[`company_${index}_phone`] = 'Phone number is required';
      } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(company.phone)) {
        newErrors[`company_${index}_phone`] = 'Invalid phone number format';
      }
      if (company.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email)) {
        newErrors[`company_${index}_email`] = 'Invalid email format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the form submission.
   * Validates the form, simulates an API call, and calls the onSubmit prop with processed data.
   * @param {Event} e The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form before attempting submission
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call for 1 second
      
      // Prepare data for submission: convert images to an array of File objects
      const dataToSubmit = {
        ...formData,
        companies: formData.companies.map(company => ({
          ...company,
          // Map over the images array to extract only the 'file' object for submission
          images: company.images.map(img => img.file) 
        }))
      };

      if (onSubmit) {
        onSubmit(dataToSubmit); // Pass the transformed data to the onSubmit prop
      }
      
      toast.success(initialData ? 'Zip code updated successfully!' : 'Zip code added successfully!');
      
      // Reset form for new entries if it's not an update operation
      if (!initialData) {
        setFormData({
          zipCode: '',
          cityName: '',
          mapLink: '',
          companies: [{
            id: Date.now(),
            name: '',
            phone: '',
            email: '',
            website: '',
            location: '',
            exactAddress: '',
            distance: '',
            operatingHours: '',
            services: [],
            images: [],
            mapLink: ''
          }]
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Adds a new empty company entry to the form data.
   */
  const addCompany = () => {
    setFormData(prev => ({
      ...prev,
      companies: [
        ...prev.companies,
        {
          id: Date.now(), // Unique ID for the new company
          name: '',
          phone: '',
          email: '',
          website: '',
          location: '',
          exactAddress: '',
          distance: '',
          operatingHours: '',
          services: [],
          images: [],
          mapLink: ''
        }
      ]
    }));
  };

  /**
   * Removes a company entry from the form data by its ID.
   * Prevents removal if only one company remains.
   * @param {number} id The ID of the company to remove.
   */
  const removeCompany = (id) => {
    if (formData.companies.length === 1) {
      toast.error('At least one company is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      companies: prev.companies.filter(company => company.id !== id)
    }));
  };

  /**
   * Updates a specific field for a given company.
   * @param {number} id The ID of the company to update.
   * @param {string} field The name of the field to update (e.g., 'name', 'phone').
   * @param {any} value The new value for the field.
   */
  const updateCompany = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies.map(company =>
        company.id === id ? { ...company, [field]: value } : company
      )
    }));
  };

  /**
   * Toggles a service for a specific company (adds if not present, removes if present).
   * @param {number} companyId The ID of the company.
   * @param {string} service The service to toggle.
   */
  const toggleService = (companyId, service) => {
    setFormData(prev => ({
      ...prev,
      companies: prev.companies.map(company =>
        company.id === companyId
          ? {
              ...company,
              services: company.services.includes(service)
                ? company.services.filter(s => s !== service)
                : [...company.services, service]
            }
          : company
      )
    }));
  };

  /**
   * Handles the upload of image files for a specific company.
   * Reads files as Data URLs for preview and stores the File objects for submission.
   * @param {number} companyId The ID of the company to add images to.
   * @param {Event} event The file input change event.
   */
  const handleImageUpload = (companyId, event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      // Ensure the file is an image type
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Update the company's images array with both the File object and its preview URL
          updateCompany(companyId, 'images', [
            ...formData.companies.find(c => c.id === companyId).images,
            {
              id: Date.now() + Math.random(), // Unique ID for the image
              file: file, // Store the actual File object
              previewUrl: e.target.result, // Store the base64 string for image preview
              name: file.name // Original file name
            }
          ]);
        };
        reader.readAsDataURL(file); // Read the file as a Data URL for preview
      } else {
        toast.error(`File '${file.name}' is not an image.`);
      }
    });
  };

  /**
   * Removes an image from a specific company's image list.
   * @param {number} companyId The ID of the company.
   * @param {number} imageId The ID of the image to remove.
   */
  const removeImage = (companyId, imageId) => {
    const company = formData.companies.find(c => c.id === companyId);
    if (company) {
      updateCompany(companyId, 'images', company.images.filter(img => img.id !== imageId));
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      // Use Tailwind's spacing classes for overall layout
      className="space-y-8  sm:p-6 lg:p-8 max-w-4xl mx-auto font-sans" 
      onSubmit={handleSubmit}
    >
      {/* Zip Code Information Section */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          Zip Code Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
              Zip Code *
            </label>
            <input
              id="zipCode"
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.zipCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="90210"
            />
            {errors.zipCode && (
              <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="cityName" className="block text-sm font-medium text-gray-700 mb-2">
              City Name *
            </label>
            <input
              id="cityName"
              type="text"
              value={formData.cityName}
              onChange={(e) => setFormData(prev => ({ ...prev, cityName: e.target.value }))}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.cityName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Beverly Hills"
            />
            {errors.cityName && (
              <p className="text-red-600 text-sm mt-1">{errors.cityName}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="mapLink" className="block text-sm font-medium text-gray-700 mb-2">
              Map Link
            </label>
            <input
              id="mapLink"
              type="url"
              value={formData.mapLink}
              onChange={(e) => setFormData(prev => ({ ...prev, mapLink: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      </div>

      {/* Towing Companies Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-green-600" />
            Towing Companies ({formData.companies.length})
          </h2>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addCompany}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Company</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {formData.companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6 border-b pb-4 -mx-6 px-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Company #{index + 1}
                </h3>
                {formData.companies.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCompany(company.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={`Remove Company ${index + 1}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Basic Info Inputs */}
                <div>
                  <label htmlFor={`company-${company.id}-name`} className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    id={`company-${company.id}-name`}
                    type="text"
                    value={company.name}
                    onChange={(e) => updateCompany(company.id, 'name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors[`company_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ABC Towing Services"
                  />
                  {errors[`company_${index}_name`] && (
                    <p className="text-red-600 text-sm mt-1">{errors[`company_${index}_name`]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor={`company-${company.id}-phone`} className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id={`company-${company.id}-phone`}
                      type="tel"
                      value={company.phone}
                      onChange={(e) => updateCompany(company.id, 'phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors[`company_${index}_phone`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  {errors[`company_${index}_phone`] && (
                    <p className="text-red-600 text-sm mt-1">{errors[`company_${index}_phone`]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor={`company-${company.id}-email`} className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id={`company-${company.id}-email`}
                      type="email"
                      value={company.email}
                      onChange={(e) => updateCompany(company.id, 'email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors[`company_${index}_email`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="contact@company.com"
                    />
                  </div>
                  {errors[`company_${index}_email`] && (
                    <p className="text-red-600 text-sm mt-1">{errors[`company_${index}_email`]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor={`company-${company.id}-website`} className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id={`company-${company.id}-website`}
                      type="url"
                      value={company.website}
                      onChange={(e) => updateCompany(company.id, 'website', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="https://company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`company-${company.id}-location`} className="block text-sm font-medium text-gray-700 mb-2">
                    Location (City, State)
                  </label>
                  <input
                    id={`company-${company.id}-location`}
                    type="text"
                    value={company.location}
                    onChange={(e) => updateCompany(company.id, 'location', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Los Angeles, CA"
                  />
                </div>

                <div>
                  <label htmlFor={`company-${company.id}-distance`} className="block text-sm font-medium text-gray-700 mb-2">
                    Distance from Zip Code
                  </label>
                  <input
                    id={`company-${company.id}-distance`}
                    type="text"
                    value={company.distance}
                    onChange={(e) => updateCompany(company.id, 'distance', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="5 miles"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor={`company-${company.id}-address`} className="block text-sm font-medium text-gray-700 mb-2">
                    Exact Address
                  </label>
                  <input
                    id={`company-${company.id}-address`}
                    type="text"
                    value={company.exactAddress}
                    onChange={(e) => updateCompany(company.id, 'exactAddress', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="123 Main St, Los Angeles, CA 90210"
                  />
                </div>

                <div>
                  <label htmlFor={`company-${company.id}-hours`} className="block text-sm font-medium text-gray-700 mb-2">
                    Operating Hours
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id={`company-${company.id}-hours`}
                      type="text"
                      value={company.operatingHours}
                      onChange={(e) => updateCompany(company.id, 'operatingHours', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="24/7 or Mon-Fri 8AM-6PM"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`company-${company.id}-maplink`} className="block text-sm font-medium text-gray-700 mb-2">
                    Company Map Link
                  </label>
                  <input
                    id={`company-${company.id}-maplink`}
                    type="url"
                    value={company.mapLink}
                    onChange={(e) => updateCompany(company.id, 'mapLink', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              {/* Services Offered Section */}
              <div className="mt-6 border-t pt-6 -mx-6 px-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Services Offered
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {serviceOptions.map((service) => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={company.services.includes(service)}
                        onChange={() => toggleService(company.id, service)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="mt-6 border-t pt-6 -mx-6 px-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Company Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(company.id, e)}
                    className="hidden"
                    id={`images-${company.id}`}
                  />
                  <label htmlFor={`images-${company.id}`} className="cursor-pointer flex flex-col items-center justify-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload images or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>

                {/* Image Previews */}
                {company.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {company.images.map((image) => (
                      <div key={image.id} className="relative group aspect-w-16 aspect-h-9">
                        <img
                          // Use the previewUrl for displaying the image
                          src={image.previewUrl} 
                          alt={image.name}
                          className="w-full h-full object-cover rounded-lg shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(company.id, image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6"
                          aria-label={`Remove image ${image.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Submit and Cancel Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end space-x-4 pt-6 border-t border-gray-100"
      >
        <button
          type="button"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
          className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm ${
            isSubmitting 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Zip Code' : 'Add Zip Code')}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
