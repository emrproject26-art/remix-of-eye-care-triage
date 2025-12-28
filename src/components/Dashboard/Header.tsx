import React, { useState } from 'react';
import { Eye, Bell, LogOut, Clock, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProfileSettingsDialog } from './ProfileSettingsDialog';
import { PreferencesDialog } from './PreferencesDialog';

export function Header() {
  const { user, logout, sessionTimeout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatSessionTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes}m`;
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Eye className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-foreground leading-tight">ARTS Dashboard</h1>
            <p className="text-xs text-muted-foreground">Aravind Retina Triage System</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Session Timer */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Session: {formatSessionTime(sessionTimeout)}</span>
          </div>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-urgent rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-tight">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowProfileSettings(true)}>
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPreferences(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Notifications
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                  Mark all as read
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              Recent activity and updates
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatNotificationTime(notification.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Profile Settings Dialog */}
      <ProfileSettingsDialog 
        open={showProfileSettings} 
        onOpenChange={setShowProfileSettings} 
      />

      {/* Preferences Dialog */}
      <PreferencesDialog 
        open={showPreferences} 
        onOpenChange={setShowPreferences} 
      />
    </>
  );
}
