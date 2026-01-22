import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit, Trash2, User, Mail, Phone, MapPin, DollarSign,
  Plus, Home, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import ClientForm from '@/components/clients/ClientForm';
import InteractionForm from '@/components/interactions/InteractionForm';
import ActivityItem from '@/components/dashboard/ActivityItem';
import PropertyCard from '@/components/properties/PropertyCard';

const typeColors = {
  buyer: 'bg-blue-100 text-blue-700',
  seller: 'bg-purple-100 text-purple-700',
  both: 'bg-amber-100 text-amber-700'
};

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
  closed: 'bg-rose-100 text-rose-700'
};

export default function ClientDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => base44.entities.Client.list().then(clients => clients.find(c => c.id === clientId)),
    enabled: !!clientId
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list()
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions', clientId],
    queryFn: () => base44.entities.Interaction.filter({ client_id: clientId }, '-created_date'),
    enabled: !!clientId
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Client.delete(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigate(createPageUrl('Clients'));
    }
  });

  // Properties owned by this client or related to them
  const clientProperties = properties.filter(p => p.owner_client_id === clientId);

  const formatBudget = (min, max) => {
    const format = (n) => {
      if (!n) return null;
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
      return `$${n}`;
    };
    const minStr = format(min);
    const maxStr = format(max);
    if (minStr && maxStr) return `${minStr} - ${maxStr}`;
    if (minStr) return `From ${minStr}`;
    if (maxStr) return `Up to ${maxStr}`;
    return 'Not specified';
  };

  if (isLoading || !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading client...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link to={createPageUrl('Clients')}>
          <Button variant="ghost" className="mb-6 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clients
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-slate-100">
                <CardContent className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                      {client.avatar_url ? (
                        <img src={client.avatar_url} alt={client.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
                          <div className="flex gap-2 mt-2">
                            <Badge className={typeColors[client.client_type]}>{client.client_type}</Badge>
                            <Badge className={statusColors[client.status]}>{client.status}</Badge>
                            {client.source && (
                              <Badge variant="outline">{client.source.replace('_', ' ')}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {client.email && (
                          <p className="text-slate-600 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" /> {client.email}
                          </p>
                        )}
                        {client.phone && (
                          <p className="text-slate-600 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" /> {client.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs defaultValue="interactions" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="interactions">Interactions ({interactions.length})</TabsTrigger>
                  <TabsTrigger value="properties">Properties ({clientProperties.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="interactions">
                  <Card className="border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">Recent Interactions</CardTitle>
                      <Button size="sm" onClick={() => setShowInteractionForm(true)} className="bg-slate-900 hover:bg-slate-800">
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {interactions.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {interactions.map(interaction => (
                            <ActivityItem
                              key={interaction.id}
                              interaction={interaction}
                              client={client}
                              property={properties.find(p => p.id === interaction.property_id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-slate-400">
                          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No interactions yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="properties">
                  {clientProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clientProperties.map((property, index) => (
                        <PropertyCard key={property.id} property={property} index={index} />
                      ))}
                    </div>
                  ) : (
                    <Card className="border-slate-100">
                      <CardContent className="py-12 text-center text-slate-400">
                        <Home className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No properties associated</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-slate-100">
                <CardContent className="p-4 space-y-3">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={() => setShowEditForm(true)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit Client
                  </Button>
                  <Button variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Client
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Budget */}
            {(client.budget_min || client.budget_max) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-slate-100">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" /> Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatBudget(client.budget_min, client.budget_max)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Preferences */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-slate-100">
                <CardHeader>
                  <CardTitle className="text-lg">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client.preferred_locations?.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Preferred Locations</p>
                      <div className="flex flex-wrap gap-2">
                        {client.preferred_locations.map((loc, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-100 rounded-full text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {client.preferred_property_types?.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Property Types</p>
                      <div className="flex flex-wrap gap-2">
                        {client.preferred_property_types.map((type, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {!client.preferred_locations?.length && !client.preferred_property_types?.length && (
                    <p className="text-slate-400 text-sm">No preferences set</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes */}
            {client.notes && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-slate-100">
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-sm leading-relaxed">{client.notes}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {showEditForm && (
        <ClientForm
          client={client}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['client', clientId] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setShowEditForm(false);
          }}
          onClose={() => setShowEditForm(false)}
        />
      )}

      {showInteractionForm && (
        <InteractionForm
          clientId={clientId}
          properties={properties}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['interactions', clientId] });
            setShowInteractionForm(false);
          }}
          onClose={() => setShowInteractionForm(false)}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{client.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}