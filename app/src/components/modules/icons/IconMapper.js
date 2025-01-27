// src/components/modules/icons/IconMapper.js
'use client';

import { 
  Handshake, Calculator, ClipboardList, Target, Calendar, Settings, 
  FileText, Package, Fuel, Car, User, Truck, FileBarChart, Database, Lock 
} from 'lucide-react';

const icons = {
  Handshake: <Handshake size={20} />,
  Calculator: <Calculator size={20} />,
  ClipboardList: <ClipboardList size={20} />,
  Target: <Target size={20} />,
  Calendar: <Calendar size={20} />,
  Settings: <Settings size={20} />,
  FileText: <FileText size={20} />,
  Package: <Package size={20} />,
  Fuel: <Fuel size={20} />,
  Car: <Car size={20} />,
  User: <User size={20} />,
  Truck: <Truck size={20} />,
  FileBarChart: <FileBarChart size={20} />,
  Database: <Database size={20} />,
  Lock: <Lock size={20} />
};

export const getIconComponent = (iconName) => icons[iconName] || <FileText size={20} />;
