import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Clock,
  Calendar,
  Save,
  Plus,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { NotificationSettingsProps, NotificationChannel } from '../LowStockAlerts.types';
import { cn } from '@/lib/utils';

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  settings, 
  onSettingsUpdate 
}) => {
  const [formData, setFormData] = useState(settings);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const handleChannelToggle = (channel: NotificationChannel) => {
    const channels = formData.channels.includes(channel)
      ? formData.channels.filter(c => c !== channel)
      : [...formData.channels, channel];
    
    setFormData({ ...formData, channels });
    setHasChanges(true);
  };

  const handleAddEmail = () => {
    if (newEmail && !formData.emailRecipients.includes(newEmail)) {
      setFormData({
        ...formData,
        emailRecipients: [...formData.emailRecipients, newEmail]
      });
      setNewEmail('');
      setHasChanges(true);
    }
  };

  const handleRemoveEmail = (email: string) => {
    setFormData({
      ...formData,
      emailRecipients: formData.emailRecipients.filter(e => e !== email)
    });
    setHasChanges(true);
  };

  const handleAddPhone = () => {
    if (newPhone && !formData.phoneNumbers.includes(newPhone)) {
      setFormData({
        ...formData,
        phoneNumbers: [...formData.phoneNumbers, newPhone]
      });
      setNewPhone('');
      setHasChanges(true);
    }
  };

  const handleRemovePhone = (phone: string) => {
    setFormData({
      ...formData,
      phoneNumbers: formData.phoneNumbers.filter(p => p !== phone)
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSettingsUpdate?.(formData);
    setHasChanges(false);
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'push': return <Smartphone className="h-4 w-4" />;
      case 'in-app': return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelLabel = (channel: NotificationChannel) => {
    switch (channel) {
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      case 'push': return 'Push Notifications';
      case 'in-app': return 'In-App Notifications';
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose how you want to receive stock alerts
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {(['email', 'sms', 'push', 'in-app'] as NotificationChannel[]).map((channel) => (
              <div
                key={channel}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                  formData.channels.includes(channel) 
                    ? "bg-primary/5 border-primary" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleChannelToggle(channel)}
              >
                <div className="flex items-center gap-3">
                  {getChannelIcon(channel)}
                  <div>
                    <p className="font-medium">{getChannelLabel(channel)}</p>
                    <p className="text-xs text-muted-foreground">
                      {channel === 'email' && 'Detailed alerts via email'}
                      {channel === 'sms' && 'Critical alerts only'}
                      {channel === 'push' && 'Mobile app notifications'}
                      {channel === 'in-app' && 'Dashboard notifications'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.channels.includes(channel)}
                  onCheckedChange={() => handleChannelToggle(channel)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Recipients */}
      {formData.channels.includes('email') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Recipients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <Button onClick={handleAddEmail} disabled={!newEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.emailRecipients.map((email) => (
                <Badge key={email} variant="secondary" className="gap-1">
                  {email}
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SMS Recipients */}
      {formData.channels.includes('sms') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SMS Recipients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPhone()}
              />
              <Button onClick={handleAddPhone} disabled={!newPhone}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.phoneNumbers.map((phone) => (
                <Badge key={phone} variant="secondary" className="gap-1">
                  {phone}
                  <button
                    onClick={() => handleRemovePhone(phone)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alert Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Critical Alerts Only</Label>
                <p className="text-sm text-muted-foreground">
                  Only receive notifications for critical stock alerts
                </p>
              </div>
              <Switch
                checked={formData.criticalAlertsOnly}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, criticalAlertsOnly: checked });
                  setHasChanges(true);
                }}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a daily summary of all alerts
                </p>
              </div>
              <Switch
                checked={formData.dailyDigest}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, dailyDigest: checked });
                  setHasChanges(true);
                }}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Report</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly inventory health report
                </p>
              </div>
              <Switch
                checked={formData.weeklyReport}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, weeklyReport: checked });
                  setHasChanges(true);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alert Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.alertFrequency}
            onValueChange={(value: any) => {
              setFormData({ ...formData, alertFrequency: value });
              setHasChanges(true);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="hourly">Hourly Batch</SelectItem>
              <SelectItem value="daily">Daily Summary</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Quiet Hours</Label>
            <Switch
              checked={formData.quietHours.enabled}
              onCheckedChange={(checked) => {
                setFormData({
                  ...formData,
                  quietHours: { ...formData.quietHours, enabled: checked }
                });
                setHasChanges(true);
              }}
            />
          </div>

          {formData.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.quietHours.start}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      quietHours: { ...formData.quietHours, start: e.target.value }
                    });
                    setHasChanges(true);
                  }}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.quietHours.end}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      quietHours: { ...formData.quietHours, end: e.target.value }
                    });
                    setHasChanges(true);
                  }}
                />
              </div>
              <div className="col-span-2">
                <Label>Timezone</Label>
                <Select
                  value={formData.quietHours.timezone}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      quietHours: { ...formData.quietHours, timezone: value }
                    });
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                    <SelectItem value="America/New_York">America/New York</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
};