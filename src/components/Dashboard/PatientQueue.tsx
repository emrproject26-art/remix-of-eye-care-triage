import React, { useState } from 'react';
import { Search, Filter, SortAsc, SortDesc, RefreshCw, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PatientCard } from './PatientCard';
import { usePatients } from '@/contexts/PatientContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Patient, ReviewDecision } from '@/types';

type SortOption = 'newest' | 'oldest' | 'aiScore' | 'name';
type FilterOption = 'all' | 'urgent' | 'pending' | ReviewDecision;

export function PatientQueue() {
  const { getPendingPatients, getReviewedPatients, selectedPatient, selectPatient } = usePatients();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const pendingPatients = getPendingPatients();
  const reviewedPatients = getReviewedPatients();

  const filterPatients = (patients: Patient[]) => {
    let filtered = patients;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.uid.toLowerCase().includes(query) ||
        p.phone.includes(query)
      );
    }

    // Apply status/decision filter
    if (filterBy !== 'all') {
      if (filterBy === 'urgent') {
        filtered = filtered.filter(p => p.status === 'urgent');
      } else if (filterBy === 'pending') {
        filtered = filtered.filter(p => p.status === 'pending');
      } else {
        // Filter by decision for reviewed patients
        filtered = filtered.filter(p => p.decision === filterBy);
      }
    }

    return filtered;
  };

  const sortPatients = (patients: Patient[]) => {
    const sorted = [...patients];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'aiScore':
        return sorted.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  };

  const processPatients = (patients: Patient[]) => {
    return sortPatients(filterPatients(patients));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterBy('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || filterBy !== 'all' || sortBy !== 'newest';

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Patient Queue</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Refresh">
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
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Filter
                {filterBy !== 'all' && (
                  <span className="ml-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                    1
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterBy === 'all'}
                onCheckedChange={() => setFilterBy('all')}
              >
                All Patients
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterBy === 'urgent'}
                onCheckedChange={() => setFilterBy('urgent')}
              >
                Urgent Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterBy === 'pending'}
                onCheckedChange={() => setFilterBy('pending')}
              >
                Pending Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Decision</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filterBy === 'normal'}
                onCheckedChange={() => setFilterBy('normal')}
              >
                Normal
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterBy === 'abnormal'}
                onCheckedChange={() => setFilterBy('abnormal')}
              >
                Abnormal
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterBy === 'urgent'}
                onCheckedChange={() => setFilterBy('urgent')}
              >
                Urgent Referral
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterBy === 'refer'}
                onCheckedChange={() => setFilterBy('refer')}
              >
                Refer
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                {sortBy === 'newest' || sortBy === 'oldest' ? (
                  sortBy === 'newest' ? <SortDesc className="w-3.5 h-3.5 mr-1.5" /> : <SortAsc className="w-3.5 h-3.5 mr-1.5" />
                ) : (
                  <SortAsc className="w-3.5 h-3.5 mr-1.5" />
                )}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                <SortDesc className="w-4 h-4 mr-2" />
                Newest First
                {sortBy === 'newest' && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                <SortAsc className="w-4 h-4 mr-2" />
                Oldest First
                {sortBy === 'oldest' && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('aiScore')}>
                AI Risk Score
                {sortBy === 'aiScore' && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Patient Name
                {sortBy === 'name' && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-3 grid grid-cols-2">
          <TabsTrigger value="pending" className="text-xs">
            Pending ({processPatients(pendingPatients).length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="text-xs">
            Reviewed ({processPatients(reviewedPatients).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="flex-1 m-0 p-0">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="p-4 space-y-3">
              {processPatients(pendingPatients).map((patient, index) => (
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
              {processPatients(pendingPatients).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">No pending patients found</p>
                  {hasActiveFilters && (
                    <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="reviewed" className="flex-1 m-0 p-0">
          <ScrollArea className="h-[calc(100vh-380px)]">
            <div className="p-4 space-y-3">
              {processPatients(reviewedPatients).map((patient, index) => (
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
              {processPatients(reviewedPatients).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">No reviewed patients yet</p>
                  {hasActiveFilters && (
                    <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
