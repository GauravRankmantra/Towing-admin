'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ZipCodeForm from '@/components/admin/ZipCodeForm';
import { Plus, Search, MapPin, Edit, Trash2, Eye } from 'lucide-react';

const mockZipCodes = [
  {
    id: 1,
    zipCode: '90210',
    cityName: 'Beverly Hills',
    companiesCount: 5,
    lastUpdated: '2024-01-15',
    mapLink: 'https://maps.google.com/90210'
  },
  {
    id: 2,
    zipCode: '10001',
    cityName: 'New York',
    companiesCount: 8,
    lastUpdated: '2024-01-14',
    mapLink: 'https://maps.google.com/10001'
  },
  {
    id: 3,
    zipCode: '60601',
    cityName: 'Chicago',
    companiesCount: 6,
    lastUpdated: '2024-01-13',
    mapLink: 'https://maps.google.com/60601'
  }
];

export default function ZipCodes() {
  const [showForm, setShowForm] = useState(false);
  const [editingZipCode, setEditingZipCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zipCodes, setZipCodes] = useState(mockZipCodes);

  const filteredZipCodes = zipCodes.filter(zipCode =>
    zipCode.zipCode.includes(searchTerm) ||
    zipCode.cityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddZipCode = (data) => {
    if (editingZipCode) {
      setZipCodes(prev => prev.map(zip => 
        zip.id === editingZipCode.id 
          ? { ...zip, ...data, companiesCount: data.companies.length, lastUpdated: new Date().toISOString().split('T')[0] }
          : zip
      ));
      setEditingZipCode(null);
    } else {
      const newZipCode = {
        id: Date.now(),
        ...data,
        companiesCount: data.companies.length,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setZipCodes(prev => [...prev, newZipCode]);
    }
    setShowForm(false);
  };

  const handleEdit = (zipCode) => {
    setEditingZipCode(zipCode);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this zip code?')) {
      setZipCodes(prev => prev.filter(zip => zip.id !== id));
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingZipCode ? 'Edit Zip Code' : 'Add New Zip Code'}
            </h1>
            <p className="text-gray-600 mt-1">
              {editingZipCode ? 'Update zip code information and towing companies' : 'Add a new zip code area with associated towing companies'}
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingZipCode(null);
            }}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to List
          </button>
        </div>

        <ZipCodeForm 
          onSubmit={handleAddZipCode}
          initialData={editingZipCode}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zip Code Management</h1>
          <p className="text-gray-600 mt-1">Manage zip codes and their associated towing companies</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
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
            <span>Companies: {zipCodes.reduce((acc, zip) => acc + zip.companiesCount, 0)}</span>
          </div>
        </div>
      </motion.div>

      {/* Zip Codes Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredZipCodes.map((zipCode, index) => (
          <motion.div
            key={zipCode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{zipCode.zipCode}</h3>
                  <p className="text-gray-600">{zipCode.cityName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEdit(zipCode)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(zipCode.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Companies</span>
                <span className="text-sm font-medium text-gray-900">
                  {zipCode.companiesCount}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-500">{zipCode.lastUpdated}</span>
              </div>

              {zipCode.mapLink && (
                <div className="pt-3 border-t border-gray-100">
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
                onClick={() => handleEdit(zipCode)}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Manage Companies
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredZipCodes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No zip codes found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first zip code'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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