import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radii } from '../../constants/theme';
import BackButton from '../../components/BackButton';

export default function SendFeedbackScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [includeScreenshot, setIncludeScreenshot] = useState(false);

  const feedbackCategories = [
    { id: 'bug', title: 'Bug Report', icon: 'bug-outline', color: colors.error },
    { id: 'feature', title: 'Feature Request', icon: 'bulb-outline', color: colors.primary },
    { id: 'improvement', title: 'Improvement', icon: 'trending-up-outline', color: colors.success },
    { id: 'general', title: 'General Feedback', icon: 'chatbubble-outline', color: colors.warning },
    { id: 'complaint', title: 'Complaint', icon: 'alert-circle-outline', color: colors.error },
    { id: 'praise', title: 'Praise', icon: 'heart-outline', color: colors.success }
  ];

  const handleSubmitFeedback = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a feedback category');
      return;
    }

    if (!feedback.trim()) {
      Alert.alert('Error', 'Please provide your feedback');
      return;
    }

    if (rating === 0) {
      Alert.alert('Error', 'Please provide a rating');
      return;
    }

    Alert.alert(
      'Feedback Submitted',
      'Thank you for your feedback! We appreciate your input and will review it carefully.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSelectedCategory('');
            setRating(0);
            setFeedback('');
            setEmail('');
            setIncludeScreenshot(false);
          }
        }
      ]
    );
  };

  const handleTakeScreenshot = () => {
    Alert.alert('Screenshot', 'Screenshot feature is coming soon!');
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={{ marginRight: spacing.s }}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={32}
            color={i <= rating ? colors.warning : colors.border}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getCategoryDescription = (categoryId: string) => {
    switch (categoryId) {
      case 'bug':
        return 'Report a problem or issue you encountered';
      case 'feature':
        return 'Suggest a new feature or functionality';
      case 'improvement':
        return 'Suggest improvements to existing features';
      case 'general':
        return 'Share general thoughts or comments';
      case 'complaint':
        return 'Report a complaint or concern';
      case 'praise':
        return 'Share positive feedback or appreciation';
      default:
        return '';
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <BackButton />
      
      <View style={{ padding: spacing.l }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.s }}>
          Send Feedback
        </Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.l }}>
          Help us improve by sharing your thoughts, suggestions, or reporting issues.
        </Text>

        {/* Feedback Category */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Feedback Category *
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {feedbackCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={{
                  width: '48%',
                  backgroundColor: selectedCategory === category.id ? colors.primary : colors.white,
                  padding: spacing.m,
                  borderRadius: radii.m,
                  marginBottom: spacing.m,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={24} 
                  color={selectedCategory === category.id ? colors.white : category.color} 
                />
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600', 
                  color: selectedCategory === category.id ? colors.white : colors.text,
                  marginTop: spacing.s,
                  textAlign: 'center'
                }}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedCategory && (
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: spacing.s }}>
              {getCategoryDescription(selectedCategory)}
            </Text>
          )}
        </View>

        {/* Rating */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Overall Rating
          </Text>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: radii.m,
            padding: spacing.m,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{ fontSize: 16, color: colors.text, marginBottom: spacing.m }}>
              How would you rate your experience?
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: spacing.m }}>
              {renderStars()}
            </View>
            {rating > 0 && (
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                {rating === 1 ? 'Poor' : 
                 rating === 2 ? 'Fair' : 
                 rating === 3 ? 'Good' : 
                 rating === 4 ? 'Very Good' : 'Excellent'}
              </Text>
            )}
          </View>
        </View>

        {/* Feedback Form */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Your Feedback *
          </Text>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: radii.m,
            padding: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.s,
                padding: spacing.m,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.white,
                height: 120,
                textAlignVertical: 'top',
              }}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Please describe your feedback in detail..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Contact Information (Optional)
          </Text>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: radii.m,
            padding: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.s,
                padding: spacing.m,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.white,
              }}
              value={email}
              onChangeText={setEmail}
              placeholder="Your email address (for follow-up)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Screenshot Option */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Additional Information
          </Text>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: radii.m,
            padding: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingVertical: spacing.s
              }}
              onPress={handleTakeScreenshot}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="camera-outline" size={20} color={colors.primary} />
                <Text style={{ fontSize: 16, color: colors.text, marginLeft: spacing.s }}>
                  Include Screenshot
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            padding: spacing.m,
            borderRadius: radii.m,
            alignItems: 'center',
            marginBottom: spacing.l,
          }}
          onPress={handleSubmitFeedback}
        >
          <Text style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}>
            Submit Feedback
          </Text>
        </TouchableOpacity>

        {/* Feedback Guidelines */}
        <View style={{ marginBottom: spacing.l }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.m }}>
            Feedback Guidelines
          </Text>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: radii.m,
            padding: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <View style={{ marginBottom: spacing.s }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                • Be specific and detailed in your feedback
              </Text>
            </View>
            <View style={{ marginBottom: spacing.s }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                • Include steps to reproduce bugs
              </Text>
            </View>
            <View style={{ marginBottom: spacing.s }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                • Provide constructive suggestions
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                • We review all feedback and respond within 48 hours
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 