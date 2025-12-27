import React, { useState } from 'react';
import { Search, Filter, SortAsc, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PatientCard } from './PatientCard';
import { usePatients } from '@/contexts/PatientContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PatientQueue() {
  const { getPendingPatients, getReviewedPatients, selectedPatient, selectPatient } = usePatients();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const pendingPatients = getPendingPatients();
  const reviewedPatients = getReviewedPatients();

  const filterPatients = (patients: ReturnType<typeof getPendingPatients>) => {
    if (!searchQuery) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.uid.toLowerCase().includes(query) ||
      p.phone.includes(query)
    );
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Patient Queue</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, UID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <SortAsc className="w-3.5 h-3.5 mr-1.5" />
            Sort
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-3 grid grid-cols-2">
          <TabsTrigger value="pending" className="text-xs">
            Pending ({pendingPatients.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="text-xs">
            Reviewed ({reviewedPatients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="flex-1 m-0 p-0">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="p-4 space-y-3">
              {filterPatients(pendingPatients).map((patient, index) => (
                <div
                  key={patient.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PatientCard
                    patient={patient}
                    isSelected={selectedPatient?.id === patient.id}
                    onClick={() => selectPatient(patient)}
                  />
                </div>
              ))}
              {filterPatients(pendingPatients).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">No pending patients found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="reviewed" className="flex-1 m-0 p-0">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="p-4 space-y-3">
              {filterPatients(reviewedPatients).map((patient, index) => (
                <div
                  key={patient.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PatientCard
                    patient={patient}
                    isSelected={selectedPatient?.id === patient.id}
                    onClick={() => selectPatient(patient)}
                  />
                </div>
              ))}
              {filterPatients(reviewedPatients).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">No reviewed patients yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
