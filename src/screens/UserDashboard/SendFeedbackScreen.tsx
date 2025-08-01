import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SendFeedbackScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Ionicons name="chevron-back" size={28} />
      </TouchableOpacity>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Send Feedback</Text>
      <Text style={{ marginTop: 16 }}>Feedback form will appear here.</Text>
    </View>
  );
} 