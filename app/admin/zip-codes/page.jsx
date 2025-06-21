"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Corrected import path for ZipCodeForm to be relative
import ZipCodeForm from "../../../components/admin/ZipCodeForm";
import axios from "axios";
import toast from "react-hot-toast"; // Using react-hot-toast for notifications
import { Plus, Search, MapPin, Edit, Trash2, Eye, Loader2 } from "lucide-react";

// Base URL for your API
const API_BASE_URL = "https://towing-backend.onrender.com/api/v1/zip";

export default function ZipCodes() {
  const [showForm, setShowForm] = useState(false); // Controls visibility of the form
  const [editingZipCode, setEditingZipCode] = useState(null); // Holds data of zip code being edited
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [zipCodes, setZipCodes] = useState([]); // Stores fetched zip code data
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial fetch and actions
  const [error, setError] = useState(null); // Error state for API issues

  /**
   * Fetches all zip codes from the backend API.
   */
  const fetchZipCodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_BASE_URL);
      // Assuming the API returns an array of zip codes directly
      setZipCodes(response.data.data);
     
    } catch (err) {
      console.error("Error fetching zip codes:", err);
      setError("Failed to load zip codes. Please try again.");
      toast.error("Failed to load zip codes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch zip codes on component mount
  useEffect(() => {
    fetchZipCodes();
  }, [fetchZipCodes]);

  /**
   * Handles adding or updating a zip code and its companies.
   * This function receives the entire form data from ZipCodeForm.
   * @param {object} data The complete form data including zipCode, cityName, mapLink, and companies array.
   */
  const handleFormSubmit = async (data) => {
    setIsLoading(true); // Set loading for the entire submission process
    setError(null);

    try {
      let currentZipCodeId = editingZipCode?._id; // Use existing ID if editing

      // 1. Handle Zip Code (Add or Update)
      if (editingZipCode) {
        // Update existing zip code

        const zipCodeUpdatePayload = {
          zipCode: data.zipCode,
          cityName: data.cityName,
          mapLink: data.mapLink,
        };

        await axios.put(
          `${API_BASE_URL}/updateZip/${currentZipCodeId}`,
          zipCodeUpdatePayload
        );
        toast.success("Zip code details updated.");
      } else {
        // Add new zip code
        const zipCodeAddPayload = {
          zipCode: data.zipCode,
          cityName: data.cityName,
          mapLink: data.mapLink,
        };

        const res = await axios.post(
          `${API_BASE_URL}/addZipCode`,
          zipCodeAddPayload
        );
        currentZipCodeId = res.data.data._id; // Store the new zip code ID
        toast.success("New zip code added successfully.");
      }

      // 2. Handle Companies (Add or Update)
      const companyPromises = data.companies.map(async (company) => {
        const companyFormData = new FormData();
        companyFormData.append("zipCodeId", currentZipCodeId);

        // Append company details as a JSON string (excluding images which are handled separately)
        const companyDetailsWithoutImages = { ...company };
        delete companyDetailsWithoutImages.images; // Remove images property
        companyFormData.append(
          "companyDetails",
          JSON.stringify(companyDetailsWithoutImages)
        );

        // Append image files individually
        company.images.forEach((imageFile) => {
          // imageFile here is the actual File object because of ZipCodeForm's new logic
          companyFormData.append("images", imageFile);
        });

        if (company._id) {
          // If company has an _id, it means it exists, so update it
          try {
            await axios.put(
              `${API_BASE_URL}/updatecompany/${company._id}`, // Assuming this endpoint exists
              companyFormData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );
            toast.success(`Company '${company.name}' updated.`);
          } catch (companyUpdateErr) {
            console.error(
              `Error updating company ${company.name}:`,
              companyUpdateErr
            );
            toast.error(`Failed to update company '${company.name}'.`);
          }
        } else {
          // If no _id, it's a new company, so add it
          try {
            await axios.post(`${API_BASE_URL}/addCompany`, companyFormData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success(`Company '${company.name}' added.`);
          } catch (companyAddErr) {
            console.error(
              `Error adding company ${company.name}:`,
              companyAddErr
            );
            toast.error(`Failed to add company '${company.name}'.`);
          }
        }
      });

      await Promise.all(companyPromises); // Wait for all company operations to complete

      // After all operations, refetch zip codes to update the list
      await fetchZipCodes();
      setShowForm(false);
      setEditingZipCode(null);
    } catch (err) {
      console.error(
        "Overall submission error:",
        err.response ? err.response.data : err.message
      );
      setError("Failed to save data. Please check the form and try again.");
      toast.error("Failed to save data.");
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  /**
   * Handles initiating the edit mode for a specific zip code.
   * Fetches full zip code data including companies to populate the form.
   * @param {object} zipCode The summary zip code object from the list.
   */
  const handleEdit = async (zipCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/${zipCode._id}`);
      // Assuming response.data.data contains the full zip code object with companies
      setEditingZipCode(response.data.data);
      setShowForm(true);
    } catch (err) {
      console.error("Error fetching zip code for edit:", err);
      setError("Failed to load zip code details for editing.");
      toast.error("Failed to load zip code for edit.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles deleting a zip code.
   * @param {string} id The ID of the zip code to delete.
   */
  const handleDelete = async (id) => {
    // Replaced window.confirm with a toast-based confirmation for better UX
    toast(
      (t) => (
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-gray-800 mb-2">
            Are you sure you want to delete this zip code?
          </p>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition-colors"
              onClick={async () => {
                toast.dismiss(t.id);
                setIsLoading(true);
                setError(null);
                try {
                  await axios.delete(`${API_BASE_URL}/deleteZip/${id}`);
                  await fetchZipCodes(); // Refetch to update the list
                  toast.success("Zip code deleted successfully.");
                } catch (err) {
                  console.error("Error deleting zip code:", err);
                  setError("Failed to delete zip code.");
                  toast.error("Failed to delete zip code.");
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              Delete
            </button>
            <button
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-xs hover:bg-gray-300 transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    ); // Make toast persistent until user acts
  };

  // Filter zip codes based on search term
  const filteredZipCodes = zipCodes.filter(
    (zipCode) =>
      zipCode.zipCode.includes(searchTerm) ||
      zipCode.cityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render the ZipCodeForm if showForm is true
  if (showForm) {
    return (
      <div className="space-y-6  mx-auto p-2 md:p-6 ">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingZipCode ? "Edit Zip Code" : "Add New Zip Code"}
            </h1>
            <p className="text-gray-600 mt-1">
              {editingZipCode
                ? "Update zip code information and towing companies"
                : "Add a new zip code area with associated towing companies"}
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingZipCode(null); // Clear editing state when going back
            }}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Back to List
          </button>
        </div>

        {/* Pass the full editingZipCode data for initial form population */}
        <ZipCodeForm onSubmit={handleFormSubmit} initialData={editingZipCode} />
      </div>
    );
  }

  // Render the Zip Codes list
  return (
    <div className="space-y-6 p-4 md:p-6 ">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Zip Code Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage zip codes and their associated towing companies
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add Zip Code</span>
        </motion.button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by zip code or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total: {zipCodes.length} zip codes</span>
            <span>•</span>
            <span>
              Companies:{" "}
              {zipCodes.reduce(
                (acc, zip) => acc + (zip.companiesCount || 0),
                0
              )}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-blue-600">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <p className="text-lg">Loading zip codes...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-600">
          <p className="text-lg font-medium">Error: {error}</p>
          <button
            onClick={fetchZipCodes}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Zip Codes Grid */}
      {!isLoading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredZipCodes.map((zipCode, index) => (
              <motion.div
                key={zipCode._id} // Use backend ID as key
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {zipCode.zipCode}
                      </h3>
                      <p className="text-gray-600">{zipCode.cityName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleEdit(zipCode);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Zip Code"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleDelete(zipCode._id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Zip Code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Companies</span>
                    <span className="text-sm font-medium text-gray-900">
                      {zipCode.companies?.length || 0} {/* Use 0 if not present */}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm text-gray-500">
                      {zipCode.updatedAt
                        ? new Date(zipCode.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>

                  {zipCode.mapLink && (
                    <div className="pt-3 border-t border-gray-100 mt-3">
                      <a
                        href={zipCode.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View on Map</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(zipCode)} // Re-using handleEdit to show the form
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Manage Companies
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* No Zip Codes Found */}
      {!isLoading && !error && filteredZipCodes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No zip codes found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by adding your first zip code"}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                Add Zip Code
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
