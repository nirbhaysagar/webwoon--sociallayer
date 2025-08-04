import { supabase } from '../config/supabase';

export interface NotificationTemplate {
  id: string;
  name: string;
  title_template: string;
  body_template: string;
  category: 'order' | 'live_stream' | 'message' | 'store' | 'social' | 'system' | 'promotion';
  notification_type: 'push' | 'email' | 'in_app' | 'all';
  is_active: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sound_enabled: boolean;
  vibration_enabled: boolean;
  badge_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  template_id?: string;
  title: string;
  body: string;
  category: 'order' | 'live_stream' | 'message' | 'store' | 'social' | 'system' | 'promotion';
  data: any;
  is_read: boolean;
  is_delivered: boolean;
  delivery_method: 'push' | 'email' | 'in_app' | 'all';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_at?: string;
  sent_at?: string;
  read_at?: string;
  created_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  category: 'order' | 'live_stream' | 'message' | 'store' | 'social' | 'system' | 'promotion';
  push_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_name?: string;
  device_model?: string;
  app_version?: string;
  os_version?: string;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationAnalytics {
  id: string;
  notification_id: string;
  user_id: string;
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'dismissed' | 'failed';
  platform: 'ios' | 'android' | 'web' | 'email';
  device_info: any;
  location_info: any;
  created_at: string;
}

class NotificationService {
  // =============================================
  // TEMPLATE MANAGEMENT
  // =============================================

  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      return [];
    }
  }

  async getTemplateById(id: string): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  }

  // =============================================
  // USER NOTIFICATIONS
  // =============================================

  async getUserNotifications(userId: string, limit = 50, offset = 0): Promise<UserNotification[]> {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  async getUnreadNotifications(userId: string): Promise<UserNotification[]> {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('mark_notifications_as_read', {
        user_uuid: userId
      });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  }

  async createNotification(notification: Omit<UserNotification, 'id' | 'created_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .insert(notification)
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // =============================================
  // NOTIFICATION PREFERENCES
  // =============================================

  async getUserPreferences(userId: string): Promise<NotificationPreference[]> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('category');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return [];
    }
  }

  async updatePreference(
    userId: string, 
    category: string, 
    updates: Partial<NotificationPreference>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          category,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating preference:', error);
      return false;
    }
  }

  async createDefaultPreferences(userId: string): Promise<boolean> {
    try {
      const categories = ['order', 'live_stream', 'message', 'store', 'social', 'system', 'promotion'];
      const defaultPreferences = categories.map(category => ({
        user_id: userId,
        category,
        push_enabled: true,
        email_enabled: true,
        in_app_enabled: true,
        sound_enabled: true,
        vibration_enabled: true,
        quiet_hours_enabled: false,
        quiet_hours_start: '22:00:00',
        quiet_hours_end: '08:00:00',
        timezone: 'UTC'
      }));

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(defaultPreferences, { onConflict: 'user_id,category' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating default preferences:', error);
      return false;
    }
  }

  // =============================================
  // DEVICE TOKENS
  // =============================================

  async registerDeviceToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceInfo?: Partial<DeviceToken>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: userId,
          token,
          platform,
          is_active: true,
          last_used_at: new Date().toISOString(),
          ...deviceInfo
        }, { onConflict: 'token' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error registering device token:', error);
      return false;
    }
  }

  async unregisterDeviceToken(token: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('device_tokens')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('token', token);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unregistering device token:', error);
      return false;
    }
  }

  async getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
    try {
      const { data, error } = await supabase
        .from('device_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching device tokens:', error);
      return [];
    }
  }

  // =============================================
  // ANALYTICS
  // =============================================

  async logAnalytics(
    notificationId: string,
    userId: string,
    eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'dismissed' | 'failed',
    platform: 'ios' | 'android' | 'web' | 'email',
    deviceInfo?: any,
    locationInfo?: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('log_notification_analytics', {
        notification_uuid: notificationId,
        user_uuid: userId,
        event_type: eventType,
        platform
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging analytics:', error);
      return false;
    }
  }

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  async sendNotification(
    userId: string,
    templateName: string,
    data: any = {},
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<string | null> {
    try {
      // Get template
      const templates = await this.getNotificationTemplates();
      const template = templates.find(t => t.name === templateName);
      
      if (!template) {
        console.error(`Template not found: ${templateName}`);
        return null;
      }

      // Replace placeholders in template
      let title = template.title_template;
      let body = template.body_template;

      Object.keys(data).forEach(key => {
        const placeholder = `{${key}}`;
        title = title.replace(placeholder, data[key]);
        body = body.replace(placeholder, data[key]);
      });

      // Create notification
      const notificationId = await this.createNotification({
        user_id: userId,
        template_id: template.id,
        title,
        body,
        category: template.category,
        data,
        is_read: false,
        is_delivered: false,
        delivery_method: template.notification_type,
        priority
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  async checkQuietHours(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      const quietHoursPref = preferences.find(p => p.category === 'system');
      
      if (!quietHoursPref?.quiet_hours_enabled) return false;

      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 8);
      
      const start = quietHoursPref.quiet_hours_start;
      const end = quietHoursPref.quiet_hours_end;

      if (start <= end) {
        return currentTime >= start && currentTime <= end;
      } else {
        // Crosses midnight
        return currentTime >= start || currentTime <= end;
      }
    } catch (error) {
      console.error('Error checking quiet hours:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService; 
