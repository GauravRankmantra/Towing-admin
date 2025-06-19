"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Plus,
  X,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Image,
} from "lucide-react";

export default function ZipCodeForm({ onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    zipCode: initialData?.zipCode || "",
    cityName: initialData?.cityName || "",
    mapLink: initialData?.mapLink || "",
    companies: initialData?.companies || [],
  });

  const [zipCodeId, setZipCodeId] = useState(initialData?._id || null);
  const [errors, setErrors] = useState({});
  const [isSubmittingZip, setIsSubmittingZip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateZip = () => {
    const newErrors = {};
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Invalid zip code format";
    }
    if (!formData.cityName.trim()) {
      newErrors.cityName = "City name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const serviceOptions = [
    "Flatbed Towing",
    "Heavy-Duty Towing",
    "Roadside Assistance",
    "Jump Start",
    "Tire Change",
    "Lockout Service",
    "Fuel Delivery",
    "Winch Out",
    "Long Distance Towing",
    "Motorcycle Towing",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Invalid zip code format";
    }

    if (!formData.cityName.trim()) {
      newErrors.cityName = "City name is required";
    }

    formData.companies.forEach((company, index) => {
      if (!company.name.trim()) {
        newErrors[`company_${index}_name`] = "Company name is required";
      }
      if (!company.phone.trim()) {
        newErrors[`company_${index}_phone`] = "Phone number is required";
      } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(company.phone)) {
        newErrors[`company_${index}_phone`] = "Invalid phone number format";
      }
      if (company.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email)) {
        newErrors[`company_${index}_email`] = "Invalid email format";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleZipCodeSubmit = async () => {
    if (!validateZip()) {
      toast.error("Please fix errors before submitting zip code info");
      return;
    }

    setIsSubmittingZip(true);
    try {
      const payload = {
        zipCode: formData.zipCode,
        cityName: formData.cityName,
        mapLink: formData.mapLink,
      };
      const res = initialData
        ? await axios.put(
            `http://localhost:5000/api/v1/zip/updateZipCompany/${initialData._id}`,
            payload
          )
        : await axios.post(
            "http://localhost:5000/api/v1/zip/addZipCompany",
            payload
          );

      const newId = res.data?.zipCode?._id || res.data?._id;
      if (newId) {
        setZipCodeId(newId);
        toast.success(
          initialData ? "Zip Code updated" : "Zip Code added successfully"
        );
      } else {
        throw new Error("No ID returned");
      }
    } catch (err) {
      toast.error("Failed to submit zip code info");
    } finally {
      setIsSubmittingZip(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      if (onSubmit) {
        onSubmit(formData);
      }

      toast.success(
        initialData
          ? "Zip code updated successfully!"
          : "Zip code added successfully!"
      );

      if (!initialData) {
        // Reset form for new entries
        setFormData({
          zipCode: "",
          cityName: "",
          mapLink: "",
          companies: [
            {
              id: Date.now(),
              name: "",
              phone: "",
              email: "",
              website: "",
              location: "",
              exactAddress: "",
              distance: "",
              operatingHours: "",
              services: [],
              images: [],
              mapLink: "",
            },
          ],
        });
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCompany = () => {
    setFormData((prev) => ({
      ...prev,
      companies: [
        ...prev.companies,
        {
          id: Date.now(),
          name: "",
          phone: "",
          email: "",
          website: "",
          location: "",
          exactAddress: "",
          distance: "",
          operatingHours: "",
          services: [],
          images: [],
          mapLink: "",
        },
      ],
    }));
  };

  const removeCompany = (id) => {
    if (formData.companies.length === 1) {
      toast.error("At least one company is required");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      companies: prev.companies.filter((company) => company.id !== id),
    }));
  };

  const updateCompany = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      companies: prev.companies.map((company) =>
        company.id === id ? { ...company, [field]: value } : company
      ),
    }));
  };

  const toggleService = (companyId, service) => {
    setFormData((prev) => ({
      ...prev,
      companies: prev.companies.map((company) =>
        company.id === companyId
          ? {
              ...company,
              services: company.services.includes(service)
                ? company.services.filter((s) => s !== service)
                : [...company.services, service],
            }
          : company
      ),
    }));
  };

  const handleImageUpload = (companyId, event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          updateCompany(companyId, "images", [
            ...formData.companies.find((c) => c.id === companyId).images,
            {
              id: Date.now() + Math.random(),
              url: e.target.result,
              name: file.name,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (companyId, imageId) => {
    const company = formData.companies.find((c) => c.id === companyId);
    updateCompany(
      companyId,
      "images",
      company.images.filter((img) => img.id !== imageId)
    );
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          Zip Code Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zip Code *
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, zipCode: e.target.value }))
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.zipCode ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="90210"
            />
            {errors.zipCode && (
              <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City Name *
            </label>
            <input
              type="text"
              value={formData.cityName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cityName: e.target.value }))
              }
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.cityName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Beverly Hills"
            />
            {errors.cityName && (
              <p className="text-red-600 text-sm mt-1">{errors.cityName}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Map Link
            </label>
            <input
              type="url"
              value={formData.mapLink}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mapLink: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addCompany}
          className="bg-green-600 mt-5 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Zip Info </span>
        </motion.button>
      </div>

      {/* Towing Companies */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-green-600" />
            Towing Companies ({formData.companies.length})
          </h2>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addCompany}
            disabled={!zipCodeId}
            className={`bg-green-600 ${
              zipCodeId ? `cursor-pointer` : `cursor-not-allowed`
            } hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2`}
          >
            <Plus className="w-4 h-4" />
            <span
              title={
                zipCodeId ? "Add a new company" : "First add zip code info"
              }
            >
              Add Company
            </span>
          </motion.button>
        </div>

        <AnimatePresence>
          {formData.companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Company #{index + 1}
                </h3>
                {formData.companies.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCompany(company.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) =>
                      updateCompany(company.id, "name", e.target.value)
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors[`company_${index}_name`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="ABC Towing Services"
                  />
                  {errors[`company_${index}_name`] && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors[`company_${index}_name`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={company.phone}
                      onChange={(e) =>
                        updateCompany(company.id, "phone", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors[`company_${index}_phone`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  {errors[`company_${index}_phone`] && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors[`company_${index}_phone`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={company.email}
                      onChange={(e) =>
                        updateCompany(company.id, "email", e.target.value)
                      }
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors[`company_${index}_email`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="contact@company.com"
                    />
                  </div>
                  {errors[`company_${index}_email`] && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors[`company_${index}_email`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="url"
                      value={company.website}
                      onChange={(e) =>
                        updateCompany(company.id, "website", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="https://company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (City, State)
                  </label>
                  <input
                    type="text"
                    value={company.location}
                    onChange={(e) =>
                      updateCompany(company.id, "location", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Los Angeles, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance from Zip Code
                  </label>
                  <input
                    type="text"
                    value={company.distance}
                    onChange={(e) =>
                      updateCompany(company.id, "distance", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="5 miles"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exact Address
                  </label>
                  <input
                    type="text"
                    value={company.exactAddress}
                    onChange={(e) =>
                      updateCompany(company.id, "exactAddress", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="123 Main St, Los Angeles, CA 90210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating Hours
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={company.operatingHours}
                      onChange={(e) =>
                        updateCompany(
                          company.id,
                          "operatingHours",
                          e.target.value
                        )
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="24/7 or Mon-Fri 8AM-6PM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Map Link
                  </label>
                  <input
                    type="url"
                    value={company.mapLink}
                    onChange={(e) =>
                      updateCompany(company.id, "mapLink", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              {/* Services */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Services Offered
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {serviceOptions.map((service) => (
                    <label
                      key={service}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
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

              {/* Image Upload */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Company Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(company.id, e)}
                    className="hidden"
                    id={`images-${company.id}`}
                  />
                  <label
                    htmlFor={`images-${company.id}`}
                    className="cursor-pointer"
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload images or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {company.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {company.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(company.id, image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`${zipCodeId ? `flex` : `hidden`} justify-end space-x-4`}
      >
        <button
          type="button"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
          className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {isSubmitting
            ? "Saving..."
            : initialData
            ? "Update Zip Code"
            : "Add Zip Code"}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
