import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

import CommissionCard from '@/components/commissions/CommissionCard';
import CommissionForm from '@/components/commissions/CommissionForm';
import StatsCard from '@/components/dashboard/StatsCard';

export default function Commissions() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => base44.entities.Commission.list('-closing_date')
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list()
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const now = new Date();
  const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
  const thisYear = { start: startOfYear(now), end: endOfYear(now) };

  const filteredCommissions = commissions.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    let matchesPeriod = true;
    if (periodFilter === 'month' && c.closing_date) {
      matchesPeriod = isWithinInterval(new Date(c.closing_date), thisMonth);
    } else if (periodFilter === 'year' && c.closing_date) {
      matchesPeriod = isWithinInterval(new Date(c.closing_date), thisYear);
    }

    return matchesStatus && matchesPeriod;
  });

  // Stats
  const totalCommissions = commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
  const paidCommissions = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.commission_amount || 0), 0);
  const pendingCommissions = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.commission_amount || 0), 0);
  const monthlyCommissions = commissions
    .filter(c => c.closing_date && isWithinInterval(new Date(c.closing_date), thisMonth))
    .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Commissions</h1>
            <p className="text-slate-500 mt-1">Track your earnings and deals</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="w-4 h-4 mr-2" /> Record Commission
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title="Total Earnings"
            value={formatCurrency(totalCommissions)}
            subtitle={`${commissions.length} deals`}
            icon={DollarSign}
            accentColor="bg-emerald-500"
          />
          <StatsCard
            title="This Month"
            value={formatCurrency(monthlyCommissions)}
            subtitle={format(now, 'MMMM yyyy')}
            icon={TrendingUp}
            accentColor="bg-blue-500"
          />
          <StatsCard
            title="Paid"
            value={formatCurrency(paidCommissions)}
            subtitle={`${commissions.filter(c => c.status === 'paid').length} deals`}
            icon={CheckCircle}
            accentColor="bg-amber-500"
          />
          <StatsCard
            title="Pending"
            value={formatCurrency(pendingCommissions)}
            subtitle={`${commissions.filter(c => c.status === 'pending').length} deals`}
            icon={Clock}
            accentColor="bg-rose-500"
          />
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-8"
        >
          <div className="flex flex-wrap items-center gap-4">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="partially_paid">Partial</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Commissions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />
            ))}
          </div>
        ) : filteredCommissions.length > 0 ? (
          <div className="space-y-4">
            {filteredCommissions.map((commission, index) => (
              <CommissionCard
                key={commission.id}
                commission={commission}
                property={properties.find(p => p.id === commission.property_id)}
                client={clients.find(c => c.id === commission.client_id)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <DollarSign className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No commissions found</h3>
            <p className="text-slate-400 mb-6">Start tracking your earnings</p>
            <Button onClick={() => setShowForm(true)} className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" /> Record Your First Commission
            </Button>
          </motion.div>
        )}
      </div>

      {showForm && (
        <CommissionForm
          properties={properties}
          clients={clients}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['commissions'] });
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}