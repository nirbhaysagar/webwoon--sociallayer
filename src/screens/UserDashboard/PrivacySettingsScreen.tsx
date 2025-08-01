import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radii } from '../../constants/theme';

export default function PrivacySettingsScreen() {
  const navigation = useNavigation();
  const [publicProfile, setPublicProfile] = useState(true);
  const [searchEngine, setSearchEngine] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <Ionicons name="chevron-back" size={28} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Privacy Settings</Text>

      <Text style={styles.sectionHeader}>Profile Visibility</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Show my profile publicly</Text>
        <Switch
          value={publicProfile}
          onValueChange={setPublicProfile}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={publicProfile ? colors.primary : colors.textSecondary}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Allow search engines to index my profile</Text>
        <Switch
          value={searchEngine}
          onValueChange={setSearchEngine}
          trackColor={{ false: colors.border, true: colors.primary + '40' }}
          thumbColor={searchEngine ? colors.primary : colors.textSecondary}
        />
      </View>

      <Text style={styles.sectionHeader}>Data Control</Text>
      <TouchableOpacity style={styles.button}>
        <Ionicons name="download-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Download my data</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteModal(true)}>
        <Ionicons name="trash-outline" size={20} color={colors.error} style={{ marginRight: 8 }} />
        <Text style={styles.deleteButtonText}>Delete my account</Text>
      </TouchableOpacity>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={40} color={colors.error} style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Delete Account?</Text>
            <Text style={styles.modalText}>This action is permanent and cannot be undone. Are you sure you want to delete your account?</Text>
            <View style={{ flexDirection: 'row', marginTop: 24 }}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowDeleteModal(false)}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={() => { setShowDeleteModal(false); /* TODO: handle delete */ }}>
                <Text style={{ color: '#fff' }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 24,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: 14,
    borderRadius: radii.medium,
    marginTop: 12,
    marginBottom: 8,
  },
  buttonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    padding: 14,
    borderRadius: radii.medium,
    marginTop: 8,
  },
  deleteButtonText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: radii.large,
    padding: 28,
    alignItems: 'center',
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: radii.medium,
    backgroundColor: colors.background,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmBtn: {
    flex: 1,
    padding: 12,
    borderRadius: radii.medium,
    backgroundColor: colors.error,
    alignItems: 'center',
    marginLeft: 8,
  },
}); 