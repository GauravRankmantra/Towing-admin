'use client';

import { motion } from 'framer-motion';
import StatsCard from '@/components/admin/StatsCard';
import { 
  MapPin, 
  Building2, 
  Truck, 
  MessageSquare,
  TrendingUp,
  Clock,
  Users,
  Phone
} from 'lucide-react';

const recentActivities = [
  {
    id: 1,
    type: 'zip_code',
    title: 'New zip code area added',
    description: '90210 - Beverly Hills, CA',
    time: '2 hours ago',
    icon: MapPin,
    color: 'blue'
  },
  {
    id: 2,
    type: 'company',
    title: 'Towing company updated',
    description: 'Quick Tow Services - Updated contact info',
    time: '4 hours ago',
    icon: Truck,
    color: 'green'
  },
  {
    id: 3,
    type: 'contact',
    title: 'New contact inquiry',
    description: 'John Doe requested towing service',
    time: '6 hours ago',
    icon: MessageSquare,
    color: 'purple'
  },
  {
    id: 4,
    type: 'city',
    title: 'City service area expanded',
    description: 'Los Angeles coverage updated',
    time: '1 day ago',
    icon: Building2,
    color: 'orange'
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your towing network.</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">System Active</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Zip Codes"
          value={127}
          icon={MapPin}
          color="blue"
          trend={12}
        />
        <StatsCard
          title="Towing Companies"
          value={89}
          icon={Truck}
          color="green"
          trend={8}
        />
        <StatsCard
          title="Cities Served"
          value={34}
          icon={Building2}
          color="purple"
          trend={5}
        />
        <StatsCard
          title="Contact Inquiries"
          value={256}
          icon={MessageSquare}
          color="orange"
          trend={-3}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600',
                green: 'bg-green-50 text-green-600',
                purple: 'bg-purple-50 text-purple-600',
                orange: 'bg-orange-50 text-orange-600'
              };
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[activity.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Add Zip Code</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Add City</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Truck className="w-4 h-4" />
                <span>Add Company</span>
              </motion.button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm text-gray-600">2 hours ago</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}