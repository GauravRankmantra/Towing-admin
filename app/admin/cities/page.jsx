'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import CityForm from '@/components/admin/CityForm';
import { Plus, Search, Building2, Edit, Trash2, MapPin, Eye } from 'lucide-react';

const mockCities = [
  {
    id: 1,
    cityName: 'Los Angeles',
    state: 'California',
    zipCodes: ['90210', '90211', '90212'],
    mapLink: 'https://maps.google.com/la',
    notes: 'Major metropolitan area with high towing demand',
    lastUpdated: '2024-01-15'
  },
  {
    id: 2,
    cityName: 'New York',
    state: 'New York',
    zipCodes: ['10001', '10002', '10003', '10004'],
    mapLink: 'https://maps.google.com/nyc',
    notes: 'Dense urban area, specialized equipment needed',
    lastUpdated: '2024-01-14'
  },
  {
    id: 3,
    cityName: 'Chicago',
    state: 'Illinois',
    zipCodes: ['60601', '60602'],
    mapLink: 'https://maps.google.com/chicago',
    notes: 'Winter weather considerations important',
    lastUpdated: '2024-01-13'
  }
];

export default function Cities() {
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [cities, setCities] = useState(mockCities);

  const states = [...new Set(cities.map(city => city.state))].sort();

  const filteredCities = cities.filter(city => {
    const matchesSearch = city.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         city.zipCodes.some(zip => zip.includes(searchTerm));
    const matchesState = !filterState || city.state === filterState;
    return matchesSearch && matchesState;
  });

  const handleAddCity = (data) => {
    if (editingCity) {
      setCities(prev => prev.map(city => 
        city.id === editingCity.id 
          ? { ...city, ...data, lastUpdated: new Date().toISOString().split('T')[0] }
          : city
      ));
      setEditingCity(null);
    } else {
      const newCity = {
        id: Date.now(),
        ...data,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setCities(prev => [...prev, newCity]);
    }
    setShowForm(false);
  };

  const handleEdit = (city) => {
    setEditingCity(city);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      setCities(prev => prev.filter(city => city.id !== id));
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingCity ? 'Edit City' : 'Add New City'}
            </h1>
            <p className="text-gray-600 mt-1">
              {editingCity ? 'Update city information and service areas' : 'Add a new city to your service network'}
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingCity(null);
            }}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to List
          </button>
        </div>

        <CityForm 
          onSubmit={handleAddCity}
          initialData={editingCity}
          onCancel={() => {
            setShowForm(false);
            setEditingCity(null);
          }}
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
          <h1 className="text-2xl font-bold text-gray-900">Cities & Service Areas</h1>
          <p className="text-gray-600 mt-1">Manage cities and their service coverage areas</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add City</span>
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
              placeholder="Search by city name or zip code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
          
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total: {cities.length} cities</span>
            <span>•</span>
            <span>Zip codes: {cities.reduce((acc, city) => acc + city.zipCodes.length, 0)}</span>
          </div>
        </div>
      </motion.div>

      {/* Cities Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredCities.map((city, index) => (
          <motion.div
            key={city.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{city.cityName}</h3>
                  <p className="text-gray-600">{city.state}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEdit(city)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(city.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Zip Codes</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {city.zipCodes.slice(0, 3).map(zip => (
                    <span key={zip} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      {zip}
                    </span>
                  ))}
                  {city.zipCodes.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      +{city.zipCodes.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-gray-500">{city.lastUpdated}</span>
              </div>

              {city.notes && (
                <div>
                  <span className="text-sm text-gray-600">Notes</span>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                    {city.notes}
                  </p>
                </div>
              )}

              {city.mapLink && (
                <div className="pt-3 border-t border-gray-100">
                  <a
                    href={city.mapLink}
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
                onClick={() => handleEdit(city)}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Edit City Details
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredCities.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No cities found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterState ? 'Try adjusting your search or filter criteria' : 'Get started by adding your first city'}
          </p>
          {!searchTerm && !filterState && (
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add City
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}