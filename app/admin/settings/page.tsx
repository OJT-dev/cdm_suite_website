
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Loader2, Save, RotateCcw, Mail, Phone, FileText } from 'lucide-react';
import Link from 'next/link';

interface SettingConfig {
  key: string;
  label: string;
  description: string;
  defaultValue: string;
  icon: any;
  multiline?: boolean;
}

const SETTING_CONFIGS: SettingConfig[] = [
  {
    key: 'default_contact_email',
    label: 'Default Contact Email',
    description: 'Email address used in all bid proposals and contracts',
    defaultValue: 'contracts@cdmsuite.com',
    icon: Mail,
  },
  {
    key: 'default_contact_phone',
    label: 'Default Contact Phone',
    description: 'Phone number used in all bid proposals and contracts',
    defaultValue: '(862) 272-7623',
    icon: Phone,
  },
  {
    key: 'default_signees',
    label: 'Authorized Signees',
    description: 'Comma-separated list of authorized signees for contracts (e.g., "Fray, Everoy")',
    defaultValue: 'Fray, Everoy',
    icon: FileText,
    multiline: false,
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      
      if (res.ok) {
        // Extract just the values from the settings map
        const settingsValues: Record<string, string> = {};
        Object.keys(data.settings).forEach((key) => {
          settingsValues[key] = data.settings[key].value;
        });
        setSettings(settingsValues);
      } else {
        toast.error(data.error || 'Failed to fetch settings');
      }
    } catch (error) {
      console.error('[Admin Settings] Fetch error:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare bulk update payload
      const settingsArray = SETTING_CONFIGS.map((config) => ({
        settingKey: config.key,
        settingValue: settings[config.key] || config.defaultValue,
        description: config.description,
      }));

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsArray }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Settings saved successfully!');
        setHasChanges(false);
        fetchSettings(); // Refresh to get latest values
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('[Admin Settings] Save error:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    const defaultSettings: Record<string, string> = {};
    SETTING_CONFIGS.forEach((config) => {
      defaultSettings[config.key] = config.defaultValue;
    });
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">
              Admin
            </Link>
            <span className="text-muted-foreground">/</span>
            <span>Settings</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">System Settings</h1>
          <p className="text-muted-foreground">
            Manage default contact information and global configuration used across all bid proposals
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> Changes to these settings will apply to all <strong>new</strong> bid proposals generated after saving. 
              Existing proposals will retain their original values.
            </p>
          </CardContent>
        </Card>

        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>Default Contact Information</CardTitle>
            <CardDescription>
              This information will be automatically included in all generated bid proposals and contracts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {SETTING_CONFIGS.map((config) => {
              const Icon = config.icon;
              return (
                <div key={config.key} className="space-y-2">
                  <Label htmlFor={config.key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {config.label}
                  </Label>
                  {config.multiline ? (
                    <Textarea
                      id={config.key}
                      value={settings[config.key] || config.defaultValue}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                      placeholder={config.description}
                      rows={2}
                    />
                  ) : (
                    <Input
                      id={config.key}
                      value={settings[config.key] || config.defaultValue}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                      placeholder={config.description}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
              );
            })}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>1. Update Default Values:</strong> Change the contact email, phone, and signees above.
            </p>
            <p>
              <strong>2. Save Changes:</strong> Click "Save Changes" to store the new defaults.
            </p>
            <p>
              <strong>3. Automatic Integration:</strong> All new bid proposals will automatically use these values in generated PDFs and slide decks.
            </p>
            <p>
              <strong>4. Manual Override:</strong> You can still manually edit individual proposals if needed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
