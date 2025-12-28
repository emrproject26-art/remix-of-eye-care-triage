import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Volume2, Monitor, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreferencesDialog({ open, onOpenChange }: PreferencesDialogProps) {
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [theme, setTheme] = useState('system');

  const handleSave = () => {
    toast.success('Preferences saved successfully');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
          <DialogDescription>
            Customize your dashboard experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive alerts for urgent cases</p>
              </div>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          {/* Sound Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="sound">Sound Alerts</Label>
                <p className="text-xs text-muted-foreground">Play sound for new patients</p>
              </div>
            </div>
            <Switch
              id="sound"
              checked={soundAlerts}
              onCheckedChange={setSoundAlerts}
            />
          </div>

          {/* Auto Refresh */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label htmlFor="autoRefresh">Auto Refresh Queue</Label>
                <p className="text-xs text-muted-foreground">Automatically update patient queue</p>
              </div>
            </div>
            <Switch
              id="autoRefresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>

          {/* Refresh Interval */}
          {autoRefresh && (
            <div className="space-y-2 pl-7">
              <Label>Refresh Interval</Label>
              <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Every 15 seconds</SelectItem>
                  <SelectItem value="30">Every 30 seconds</SelectItem>
                  <SelectItem value="60">Every 1 minute</SelectItem>
                  <SelectItem value="120">Every 2 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Theme */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <Label>Theme</Label>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
