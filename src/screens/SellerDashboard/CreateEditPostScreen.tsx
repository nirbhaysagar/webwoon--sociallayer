import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from 'react-native';

const CATEGORY_OPTIONS = [
  'Fashion', 'Lifestyle', 'Beauty', 'Fitness', 'Food', 'Travel', 'Tech', 'Other'
];

const CategoryModalPicker = ({ visible, categories, value, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onClose}>
      <View style={modalStyles.modalCard}>
        <ScrollView>
          <TouchableOpacity style={modalStyles.categoryItem} onPress={() => { onSelect(''); onClose(); }}>
            <Text style={[modalStyles.categoryText, { color: '#888' }]}>Select category</Text>
          </TouchableOpacity>
          {categories.map(option => (
            <TouchableOpacity
              key={option}
              style={modalStyles.categoryItem}
              onPress={() => { onSelect(option); onClose(); }}
            >
              <Text style={modalStyles.categoryText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0008',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '80%',
    maxHeight: '60%',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  categoryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryText: {
    fontSize: 16,
    color: '#222',
  },
});

export default function CreateEditPostScreen({ navigation }) {
  const { createPost } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    if (!category) errs.category = 'Category is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createPost({
        title,
        description,
        category,
        tags,
        image_url: image, // For now, just store the URI
        store_id: 'c13f0048-0126-4421-8e81-d0dd50fcf1d0', // Hardcoded for testing
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 200 }]} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 8 }}>
              <Ionicons name="chevron-back" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Create Post</Text>
          </View>

          {/* Title */}
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter post title..."
            maxLength={100}
          />
          {errors.title && <Text style={styles.error}>{errors.title}</Text>}

          {/* Description */}
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Write your post description..."
            multiline
            maxLength={500}
          />
          {errors.description && <Text style={styles.error}>{errors.description}</Text>}

          {/* Category */}
          <Text style={styles.label}>Category *</Text>
          <View>
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center' }]}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text style={{ color: category ? '#111' : '#888' }}>
                {category || 'Select category'}
              </Text>
            </TouchableOpacity>
            <CategoryModalPicker
              visible={categoryModalVisible}
              categories={CATEGORY_OPTIONS}
              value={category}
              onSelect={setCategory}
              onClose={() => setCategoryModalVisible(false)}
            />
          </View>
          {errors.category && <Text style={styles.error}>{errors.category}</Text>}

          {/* Media */}
          <Text style={styles.label}>Media</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePickerText}>Add Media</Text>
            )}
          </TouchableOpacity>

          {/* Product Tagging (placeholder) */}
          <Text style={styles.label}>Product Tagging</Text>
          <View style={styles.taggingBox}>
            <Text style={styles.taggingText}>Tag Products (0)</Text>
          </View>

          {/* Tags */}
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagsBox}>
            <View style={styles.tagsRow}>
              {tags.map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <Text style={styles.removeTag}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TextInput
                style={styles.tagInput}
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add tag"
                onSubmitEditing={handleAddTag}
                onKeyPress={handleTagInputKeyPress}
                maxLength={20}
              />
              <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
                <Text style={styles.addTagBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save/Cancel Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={submitting}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>
          </View>

          {/* Extra space at the bottom */}
          <View style={{ height: 200 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: colors.text,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: colors.text,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  imagePicker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  imagePickerText: {
    color: colors.primary,
    fontSize: 16,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    fontSize: 13,
  },
  taggingBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  taggingText: {
    color: colors.primary,
    fontSize: 16,
  },
  tagsBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '22',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    color: colors.primary,
    fontSize: 14,
    marginRight: 4,
  },
  removeTag: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  tagInput: {
    minWidth: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  addTagBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addTagBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 