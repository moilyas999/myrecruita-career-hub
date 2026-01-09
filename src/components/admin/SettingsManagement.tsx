import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Mail, Save } from 'lucide-react';

interface AppSetting {
  id: string;
  key: string;
  value: string[];
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export default function SettingsManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationEmails, setNotificationEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'notification_emails')
        .single();

      if (error) throw error;

      if (data) {
        // Parse the JSONB value which is stored as a JSON array
        const emails = Array.isArray(data.value) ? data.value : JSON.parse(data.value as string);
        setNotificationEmails(emails);
        setUpdatedAt(data.updated_at);
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (notificationEmails.includes(email)) {
      toast.error('This email is already in the list');
      return;
    }

    setNotificationEmails([...notificationEmails, email]);
    setNewEmail('');
  };

  const removeEmail = (emailToRemove: string) => {
    if (notificationEmails.length === 1) {
      toast.error('You must have at least one notification email');
      return;
    }
    setNotificationEmails(notificationEmails.filter(email => email !== emailToRemove));
  };

  const saveSettings = async () => {
    if (notificationEmails.length === 0) {
      toast.error('You must have at least one notification email');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('app_settings')
        .update({
          value: notificationEmails,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null
        })
        .eq('key', 'notification_emails');

      if (error) throw error;

      setUpdatedAt(new Date().toISOString());
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground">Manage application configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Notification Email Recipients
          </CardTitle>
          <CardDescription>
            These email addresses will receive admin notifications for new CV submissions, job applications, contact forms, and other submissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current emails list */}
          <div className="space-y-2">
            <Label>Current Recipients</Label>
            <div className="flex flex-wrap gap-2">
              {notificationEmails.map((email) => (
                <Badge
                  key={email}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1.5 text-sm"
                >
                  {email}
                  <button
                    onClick={() => removeEmail(email)}
                    className="ml-1 hover:text-destructive transition-colors"
                    title="Remove email"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Add new email */}
          <div className="space-y-2">
            <Label htmlFor="new-email">Add Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="new-email"
                type="email"
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={addEmail} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Save button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {updatedAt && (
                <span>
                  Last updated: {new Date(updatedAt).toLocaleString()}
                </span>
              )}
            </div>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
