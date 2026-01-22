import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Building2, Users, DollarSign, Bell, Plus, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, isWithinInterval, isPast, addDays } from 'date-fns';

import StatsCard from '@/components/dashboard/StatsCard';
import ReminderCard from '@/components/dashboard/ReminderCard';
import ActivityItem from '@/components/dashboard/ActivityItem';
import PropertyCard from '@/components/properties/PropertyCard';
import ReminderForm from '@/components/reminders/ReminderForm';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showReminderForm, setShowReminderForm] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date')
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date')
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => base44.entities.Reminder.list('-due_date')
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions'],
    queryFn: () => base44.entities.Interaction.list('-created_date', 10)
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => base44.entities.Commission.list('-created_date')
  });

  const updateReminderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Reminder.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] })
  });

  // Stats calculations
  const activeListings = properties.filter(p => p.status === 'available').length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  
  const thisMonth = {
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  };
  
  const monthlyCommissions = commissions
    .filter(c => c.closing_date && isWithinInterval(new Date(c.closing_date), thisMonth))
    .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const upcomingReminders = pendingReminders
    .filter(r => !isPast(new Date(r.due_date)) || isPast(new Date(r.due_date)))
    .slice(0, 5);

  // Contract renewal alerts
  const contractAlerts = properties.filter(p => {
    if (!p.contract_end_date) return false;
    const endDate = new Date(p.contract_end_date);
    return isWithinInterval(endDate, { start: new Date(), end: addDays(new Date(), 30) });
  });

  const handleCompleteReminder = (reminder) => {
    updateReminderMutation.mutate({ id: reminder.id, data: { status: 'completed' } });
  };

  const handleDismissReminder = (reminder) => {
    updateReminderMutation.mutate({ id: reminder.id, data: { status: 'dismissed' } });
  };

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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's your real estate overview.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title="Active Listings"
            value={activeListings}
            subtitle={`${properties.length} total properties`}
            icon={Building2}
            accentColor="bg-amber-500"
          />
          <StatsCard
            title="Active Clients"
            value={activeClients}
            subtitle={`${clients.length} total clients`}
            icon={Users}
            accentColor="bg-blue-500"
          />
          <StatsCard
            title="Monthly Revenue"
            value={formatCurrency(monthlyCommissions)}
            subtitle={format(new Date(), 'MMMM yyyy')}
            icon={DollarSign}
            accentColor="bg-emerald-500"
          />
          <StatsCard
            title="Pending Tasks"
            value={pendingReminders.length}
            subtitle={`${contractAlerts.length} contract alerts`}
            icon={Bell}
            accentColor="bg-rose-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reminders Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-slate-100">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">Upcoming Reminders</CardTitle>
                <Button size="sm" onClick={() => setShowReminderForm(true)} className="bg-slate-900 hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-1" /> Add Reminder
                </Button>
              </CardHeader>
              <CardContent>
                {upcomingReminders.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingReminders.map(reminder => (
                      <ReminderCard
                        key={reminder.id}
                        reminder={reminder}
                        clients={clients}
                        properties={properties}
                        onComplete={handleCompleteReminder}
                        onDismiss={handleDismissReminder}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming reminders</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contract Renewal Alerts */}
            {contractAlerts.length > 0 && (
              <Card className="shadow-sm border-amber-200 bg-amber-50/50 mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2 text-amber-800">
                    <Calendar className="w-5 h-5" />
                    Contract Renewals Due Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {contractAlerts.map(property => (
                      <div key={property.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{property.title}</p>
                          <p className="text-sm text-slate-500">{property.address}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-amber-700">
                            {format(new Date(property.contract_end_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="shadow-sm border-slate-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {interactions.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {interactions.map(interaction => (
                      <ActivityItem
                        key={interaction.id}
                        interaction={interaction}
                        client={clients.find(c => c.id === interaction.client_id)}
                        property={properties.find(p => p.id === interaction.property_id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Properties */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Recent Listings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.slice(0, 3).map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
        </div>
      </div>

      {showReminderForm && (
        <ReminderForm
          clients={clients}
          properties={properties}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
            setShowReminderForm(false);
          }}
          onClose={() => setShowReminderForm(false)}
        />
      )}
    </div>
  );
}