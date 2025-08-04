import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Ionicons name="chevron-back" size={28} />
      </TouchableOpacity>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Terms of Service</Text>
      <Text style={{ marginTop: 16 }}>Terms and conditions will appear here.</Text>
    </ScrollView>
  );
} 