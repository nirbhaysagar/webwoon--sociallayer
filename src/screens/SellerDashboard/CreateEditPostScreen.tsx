import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, Platform, KeyboardAvoidingView, ActivityIndicator, Modal, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Modal as RNModal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

const CATEGORY_OPTIONS = [
  'Fashion', 'Lifestyle', 'Beauty', 'Fitness', 'Food', 'Travel', 'Tech', 'Other'
];

const CategoryModalPicker = ({ visible, categories, value, onSelect, onClose }) => (
  <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
  </RNModal>
);

const ProductSelectorModal = ({ visible, products, selectedProducts, onSelect, onClose }) => (
  <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onClose}>
      <View style={modalStyles.modalCard}>
        <Text style={modalStyles.modalTitle}>Select Products to Tag</Text>
        <ScrollView style={{ maxHeight: 400 }}>
          {products.map(product => (
            <TouchableOpacity
              key={product.id}
              style={[
                modalStyles.productItem,
                selectedProducts.includes(product.id) && modalStyles.productItemSelected
              ]}
              onPress={() => onSelect(product.id)}
            >
              <Image 
                source={{ uri: product.image_url || 'https://via.placeholder.com/50' }} 
                style={modalStyles.productImage} 
              />
              <View style={modalStyles.productInfo}>
                <Text style={modalStyles.productName}>{product.name}</Text>
                <Text style={modalStyles.productPrice}>${product.price}</Text>
              </View>
              {selectedProducts.includes(product.id) && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={modalStyles.doneButton} onPress={onClose}>
          <Text style={modalStyles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </RNModal>
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
    width: '90%',
    maxHeight: '80%',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: colors.text,
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
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  productPrice: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  doneButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default function CreateEditPostScreen({ navigation, route }) {
  const { createPost, state } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [postType, setPostType] = useState('regular');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Get products for tagging
  const products = state.products || [];

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    if (!category) errs.category = 'Category is required.';
    if (images.length === 0) errs.images = 'At least one image is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      
      // Create the post with draft status
      const postData = {
        title,
        content: description,
        media_urls: images,
        product_ids: selectedProducts,
        tags,
        post_type: postType,
        status: 'draft',
        scheduled_at: isScheduled ? scheduledDate : null,
        featured_product_id: selectedProducts.length > 0 ? selectedProducts[0] : null
      };

      await createPost(postData);
      
      Toast.show({
        type: 'success',
        text1: 'Post saved as draft!',
        text2: 'You can publish it later from the Posts screen.'
      });
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving post:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to save post',
        text2: error.message || 'Please try again'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareNow = async () => {
    try {
      setSubmitting(true);
      
      // Create the post with published status
      const postData = {
        title,
        content: description,
        media_urls: images,
        product_ids: selectedProducts,
        tags,
        post_type: postType,
        status: 'published',
        scheduled_at: isScheduled ? scheduledDate : null,
        featured_product_id: selectedProducts.length > 0 ? selectedProducts[0] : null
      };

      await createPost(postData);
      
      Toast.show({
        type: 'success',
        text1: 'Post published successfully!',
        text2: 'Your post is now live and visible to your audience.'
      });
      
      navigation.goBack();
    } catch (error) {
      console.error('Error sharing post:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to publish post',
        text2: error.message || 'Please try again'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: 12 }]} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={true}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 8 }}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
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
          style={[styles.input, { height: 40 }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Write your post description..."
          multiline
          maxLength={500}
        />
        {errors.description && <Text style={styles.error}>{errors.description}</Text>}

        {/* Category */}
        <Text style={styles.label}>Category *</Text>
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
        {errors.category && <Text style={styles.error}>{errors.category}</Text>}

        {/* Media */}
        <Text style={styles.label}>Media</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
          {images.length === 0 ? (
            <Text style={styles.imagePickerText}>Add Media</Text>
          ) : (
            <View style={styles.imagePreviewContainer}>
              {images.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.imagePreview} />
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* Product Tagging */}
        <Text style={styles.label}>Product Tagging</Text>
        <TouchableOpacity style={styles.taggingBox} onPress={() => setProductModalVisible(true)}>
          <Text style={styles.taggingText}>Tag Products ({selectedProducts.length})</Text>
        </TouchableOpacity>
        <ProductSelectorModal
          visible={productModalVisible}
          products={products}
          selectedProducts={selectedProducts}
          onSelect={handleProductSelect}
          onClose={() => setProductModalVisible(false)}
        />

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
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
              <Text style={styles.addTagBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Type */}
        <Text style={styles.label}>Post Type</Text>
        <View style={styles.postTypeRow}>
          <TouchableOpacity
            style={[styles.postTypeButton, postType === 'regular' && styles.postTypeButtonActive]}
            onPress={() => setPostType('regular')}
          >
            <Text style={[styles.postTypeText, postType === 'regular' && styles.postTypeTextActive]}>Regular</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.postTypeButton, postType === 'product' && styles.postTypeButtonActive]}
            onPress={() => setPostType('product')}
          >
            <Text style={[styles.postTypeText, postType === 'product' && styles.postTypeTextActive]}>Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.postTypeButton, postType === 'story' && styles.postTypeButtonActive]}
            onPress={() => setPostType('story')}
          >
            <Text style={[styles.postTypeText, postType === 'story' && styles.postTypeTextActive]}>Story</Text>
          </TouchableOpacity>
        </View>

        {/* Schedule Post */}
        <View style={styles.scheduleRow}>
          <Switch value={isScheduled} onValueChange={() => setIsScheduled(!isScheduled)} />
          <Text style={styles.scheduleText}>Schedule Post</Text>
        </View>
        {isScheduled && (
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerLabel}>Scheduled Date</Text>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.datePickerText}>
                {scheduledDate ? scheduledDate.toLocaleDateString() : 'Select date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
        )}

        {/* Share Options */}
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share Options</Text>
          <View style={styles.shareOptions}>
            <TouchableOpacity style={styles.shareOption}>
              <Ionicons name="logo-instagram" size={16} color="#E4405F" />
              <Text style={styles.shareOptionText}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOption}>
              <Ionicons name="logo-facebook" size={16} color="#1877F2" />
              <Text style={styles.shareOptionText}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOption}>
              <Ionicons name="logo-twitter" size={16} color="#1DA1F2" />
              <Text style={styles.shareOptionText}>Twitter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOption}>
              <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
              <Text style={styles.shareOptionText}>More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.publishButton} onPress={handleShareNow}>
            <Ionicons name="checkmark-circle" size={14} color={colors.white} />
            <Text style={styles.publishButtonText}>Publish</Text>
          </TouchableOpacity>
        </View>

        {/* Extra space for bottom navigation */}
        <View style={{ height: 10 }} />
      </ScrollView>
      
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  scrollContent: {
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radii.small,
    padding: 8,
    fontSize: 13,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: {
    color: colors.discount,
    fontSize: 11,
    marginBottom: 6,
    marginTop: -2,
  },
  imagePicker: {
    backgroundColor: colors.white,
    borderRadius: radii.small,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: 6,
  },
  imagePickerText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  imagePreview: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  taggingBox: {
    backgroundColor: colors.white,
    borderRadius: radii.small,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
  },
  taggingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  tagsBox: {
    backgroundColor: colors.white,
    borderRadius: radii.small,
    padding: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  tagChip: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: colors.white,
    fontSize: 11,
    marginRight: 3,
  },
  removeTag: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tagInput: {
    flex: 1,
    fontSize: 13,
    minWidth: 60,
  },
  addTagBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addTagBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  postTypeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  postTypeButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  postTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  postTypeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  postTypeTextActive: {
    color: colors.white,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scheduleText: {
    marginLeft: 6,
    fontSize: 13,
    color: colors.text,
  },
  datePickerContainer: {
    marginBottom: 6,
  },
  datePickerLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    color: colors.text,
  },
  datePickerButton: {
    backgroundColor: colors.white,
    borderRadius: radii.small,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerText: {
    fontSize: 13,
    color: colors.text,
  },
  shareSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    color: colors.text,
  },
  shareOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  shareOption: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.small,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareOptionText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.secondary,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  publishButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  publishButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
}); 