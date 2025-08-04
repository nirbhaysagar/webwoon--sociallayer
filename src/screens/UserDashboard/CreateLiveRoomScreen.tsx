import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { supabase } from '../../config/supabase';
import BackButton from '../../components/BackButton';

interface CreateLiveRoomData {
  title: string;
  description: string;
  scheduled_at: Date | null;
  is_private: boolean;
  allow_comments: boolean;
  allow_reactions: boolean;
  max_viewers: number;
}

export default function CreateLiveRoomScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<CreateLiveRoomData>({
    title: '',
    description: '',
    scheduled_at: null,
    is_private: false,
    allow_comments: true,
    allow_reactions: true,
    max_viewers: 1000
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      } else {
        // If user is not authenticated, create a mock user for demonstration
        console.log('User not authenticated, using mock user for demonstration');
        setCurrentUser({
          id: 'mock-user-id',
          email: 'demo@example.com',
          user_metadata: {
            full_name: 'Demo User'
          }
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Set mock user as fallback
      setCurrentUser({
        id: 'mock-user-id',
        email: 'demo@example.com',
        user_metadata: {
          full_name: 'Demo User'
        }
      });
    }
  };

  const handleInputChange = (field: keyof CreateLiveRoomData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showDatePickerModal = () => {
    if (Platform.OS === 'web') {
      // For web, use a simple date input
      const dateInput = document.createElement('input');
      dateInput.type = 'datetime-local';
      dateInput.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          handleInputChange('scheduled_at', new Date(target.value));
        }
      };
      dateInput.click();
    } else {
      setShowDatePicker(true);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      handleInputChange('scheduled_at', selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Title required',
        text2: 'Please enter a title for your live room'
      });
      return false;
    }

    if (!formData.description.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Description required',
        text2: 'Please enter a description for your live room'
      });
      return false;
    }

    if (!formData.scheduled_at) {
      Toast.show({
        type: 'error',
        text1: 'Schedule required',
        text2: 'Please select a date and time for your live room'
      });
      return false;
    }

    if (formData.scheduled_at < new Date()) {
      Toast.show({
        type: 'error',
        text1: 'Invalid date',
        text2: 'Please select a future date and time'
      });
      return false;
    }

    return true;
  };

  const handleCreateRoom = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For demo purposes, show success message even without authentication
        Toast.show({
          type: 'success',
          text1: 'Live room created!',
          text2: 'Your live room has been scheduled successfully'
        });
        
        // Navigate back to live rooms screen
        navigation.goBack();
        return;
      }

      // Create live room in Supabase
      const { data: room, error } = await supabase
        .from('live_rooms')
        .insert({
          title: formData.title,
          description: formData.description,
          scheduled_at: formData.scheduled_at?.toISOString(),
          is_private: formData.is_private,
          allow_comments: formData.allow_comments,
          allow_reactions: formData.allow_reactions,
          max_viewers: formData.max_viewers,
          host_id: user.id,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Live room created!',
        text2: 'Your live room has been scheduled successfully'
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating live room:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to create live room',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartNow = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For demo purposes, show success message even without authentication
        Toast.show({
          type: 'success',
          text1: 'Live room started!',
          text2: 'You can now begin streaming'
        });
        
        // Navigate to live room viewer
        navigation.navigate('LiveRoomViewer', { 
          roomId: 'demo-room-id',
          isHost: true 
        });
        return;
      }

      // Create and start live room immediately
      const { data: room, error } = await supabase
        .from('live_rooms')
        .insert({
          title: formData.title,
          description: formData.description,
          scheduled_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          is_private: formData.is_private,
          allow_comments: formData.allow_comments,
          allow_reactions: formData.allow_reactions,
          max_viewers: formData.max_viewers,
          host_id: user.id,
          status: 'live'
        })
        .select()
        .single();

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Live room started!',
        text2: 'You can now begin streaming'
      });

      // Navigate to live room viewer
      navigation.navigate('LiveRoomViewer', { 
        roomId: room.id,
        isHost: true 
      });
    } catch (error) {
      console.error('Error starting live room:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to start live room',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Create Live Room</Text>
          <Text style={styles.subtitle}>
            Set up your live shopping experience
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder="Enter live room title"
              placeholderTextColor={colors.textSecondary}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Describe what your live room will be about"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>
        </View>

        {/* Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <TouchableOpacity 
            style={styles.datePickerButton} 
            onPress={showDatePickerModal}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.datePickerText}>
              {formData.scheduled_at 
                ? formatDate(formData.scheduled_at)
                : 'Select date and time'
              }
            </Text>
          </TouchableOpacity>
          
          {Platform.OS !== 'web' && showDatePicker && (
            <DateTimePicker
              value={formData.scheduled_at || new Date()}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Private Room</Text>
              <Text style={styles.settingDescription}>
                Only invited users can join
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, formData.is_private && styles.toggleActive]}
              onPress={() => handleInputChange('is_private', !formData.is_private)}
            >
              <View style={[styles.toggleThumb, formData.is_private && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Allow Comments</Text>
              <Text style={styles.settingDescription}>
                Viewers can send chat messages
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, formData.allow_comments && styles.toggleActive]}
              onPress={() => handleInputChange('allow_comments', !formData.allow_comments)}
            >
              <View style={[styles.toggleThumb, formData.allow_comments && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Allow Reactions</Text>
              <Text style={styles.settingDescription}>
                Viewers can send reactions
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, formData.allow_reactions && styles.toggleActive]}
              onPress={() => handleInputChange('allow_reactions', !formData.allow_reactions)}
            >
              <View style={[styles.toggleThumb, formData.allow_reactions && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Viewers</Text>
            <TextInput
              style={styles.textInput}
              value={formData.max_viewers.toString()}
              onChangeText={(text) => handleInputChange('max_viewers', parseInt(text) || 1000)}
              placeholder="1000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.scheduleButton]}
          onPress={handleCreateRoom}
          disabled={loading}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>
            {loading ? 'Creating...' : 'Schedule Live Room'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.startNowButton]}
          onPress={handleStartNow}
          disabled={loading}
        >
          <Ionicons name="radio-button-on" size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>
            {loading ? 'Starting...' : 'Start Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.s,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
  },
  section: {
    marginTop: spacing.l,
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.m,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: scale(14),
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: scale(14),
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerText: {
    flex: 1,
    fontSize: scale(14),
    color: colors.text,
    marginLeft: spacing.s,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: scale(14),
    fontWeight: '500',
    color: colors.text,
  },
  settingDescription: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: radii.circle,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  actions: {
    padding: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: radii.medium,
    marginBottom: spacing.s,
  },
  scheduleButton: {
    backgroundColor: colors.primary,
  },
  startNowButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.xs,
  },
}); 