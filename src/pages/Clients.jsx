import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ClientCard from '@/components/clients/ClientCard';
import ClientForm from '@/components/clients/ClientForm';

const CLIENT_TYPES = ['all', 'buyer', 'seller', 'both'];
const STATUSES = ['all', 'active', 'inactive', 'closed'];

export default function Clients() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    client_type: 'all',
    status: 'all'
  });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date')
  });

  const filteredClients = clients.filter(client => {
    const matchesSearch = !search || 
      client.name?.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase()) ||
      client.phone?.includes(search);
    
    const matchesType = filters.client_type === 'all' || client.client_type === filters.client_type;
    const matchesStatus = filters.status === 'all' || client.status === filters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    setShowForm(false);
    setEditingClient(null);
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clients</h1>
            <p className="text-slate-500 mt-1">{clients.length} clients in your database</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-2" /> Add Client
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
                  placeholder="Search clients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Tabs value={filters.client_type} onValueChange={(v) => setFilters(f => ({ ...f, client_type: v }))}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="buyer">Buyers</TabsTrigger>
                <TabsTrigger value="seller">Sellers</TabsTrigger>
                <TabsTrigger value="both">Both</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Clients Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClients.map((client, index) => (
              <ClientCard key={client.id} client={client} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Users className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No clients found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your filters or add a new client</p>
            <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Client
            </Button>
          </motion.div>
        )}
      </div>

      {showForm && (
        <ClientForm
          client={editingClient}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
}