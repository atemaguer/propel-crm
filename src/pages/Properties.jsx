import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Grid, List, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import PropertyCard from '@/components/properties/PropertyCard';
import PropertyForm from '@/components/properties/PropertyForm';

const PROPERTY_TYPES = ['all', 'apartment', 'house', 'condo', 'townhouse', 'land', 'commercial'];
const STATUSES = ['all', 'available', 'under_contract', 'sold', 'rented', 'off_market'];
const LISTING_TYPES = ['all', 'sale', 'rent'];

export default function Properties() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    property_type: 'all',
    status: 'all',
    listing_type: 'all'
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date')
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const filteredProperties = properties.filter(property => {
    const matchesSearch = !search || 
      property.title?.toLowerCase().includes(search.toLowerCase()) ||
      property.address?.toLowerCase().includes(search.toLowerCase()) ||
      property.city?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filters.property_type === 'all' || property.property_type === filters.property_type;
    const matchesStatus = filters.status === 'all' || property.status === filters.status;
    const matchesListingType = filters.listing_type === 'all' || property.listing_type === filters.listing_type;

    return matchesSearch && matchesType && matchesStatus && matchesListingType;
  });

  const handleEdit = (property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    setShowForm(false);
    setEditingProperty(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Properties</h1>
            <p className="text-slate-500 mt-1">{properties.length} properties in your portfolio</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-2" /> Add Property
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-8"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search properties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.property_type} onValueChange={(v) => setFilters(f => ({ ...f, property_type: v }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map(t => (
                  <SelectItem key={t} value={t}>
                    {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {s === 'all' ? 'All Statuses' : s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={filters.listing_type} onValueChange={(v) => setFilters(f => ({ ...f, listing_type: v }))}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="sale">For Sale</TabsTrigger>
                <TabsTrigger value="rent">For Rent</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </motion.div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <MapPin className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No properties found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your filters or add a new property</p>
            <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Property
            </Button>
          </motion.div>
        )}
      </div>

      {showForm && (
        <PropertyForm
          property={editingProperty}
          clients={clients}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingProperty(null);
          }}
        />
      )}
    </div>
  );
}