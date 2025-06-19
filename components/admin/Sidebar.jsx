'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MapPin, 
  Building2, 
  MessageSquare, 
  X 
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Zip Codes',
    href: '/admin/zip-codes',
    icon: MapPin,
  },
  {
    name: 'Cities',
    href: '/admin/cities',
    icon: Building2,
  },
  {
    name: 'Contact Inquiries',
    href: '/admin/contacts',
    icon: MessageSquare,
  },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">TowingAdmin</h1>
            <p className="text-xs text-slate-400">Management Panel</p>
          </div>
        </motion.div>
        
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 text-center">
          © 2025 TowingAdmin Panel
        </div>
      </div>
    </div>
  );
}