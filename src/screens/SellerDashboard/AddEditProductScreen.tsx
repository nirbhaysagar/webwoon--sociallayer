import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, Platform, KeyboardAvoidingView, ActivityIndicator, Modal, Switch } from 'react-native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../context/AppContext';
import { categoryAPI, productAPI } from '../../services/api';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

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
              key={option.id}
              style={modalStyles.categoryItem}
              onPress={() => { onSelect(option.id); onClose(); }}
            >
              <Text style={modalStyles.categoryText}>{option.name}</Text>
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

export default function AddEditProductScreen({ navigation }) {
  const { createProduct, state } = useApp();
  const loading = state.loadingStates.products;
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stockQuantity, setStockQuantity] = useState('1');
  const [sku, setSku] = useState('');
  const [tags, setTags] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);


  // Fetch categories from DB
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        
        // Try to fetch from API first
        try {
          const cats = await categoryAPI.getCategories();
          setCategories(cats);
        } catch (error) {
          console.log('Using mock categories due to API error:', error);
          // Fallback to mock categories
          setCategories([
            { id: '1', name: 'Fashion & Apparel', slug: 'fashion-apparel' },
            { id: '2', name: 'Electronics', slug: 'electronics' },
            { id: '3', name: 'Home & Garden', slug: 'home-garden' },
            { id: '4', name: 'Sports & Outdoors', slug: 'sports-outdoors' },
            { id: '5', name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
            { id: '6', name: 'Books & Media', slug: 'books-media' },
            { id: '7', name: 'Toys & Games', slug: 'toys-games' },
            { id: '8', name: 'Automotive', slug: 'automotive' },
            { id: '9', name: 'Health & Wellness', slug: 'health-wellness' },
            { id: '10', name: 'Food & Beverages', slug: 'food-beverages' },
          ]);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        Alert.alert('Error', 'Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const validate = () => {
    const errs = {};
    if (!image) errs.image = 'Image is required.';
    if (!name.trim()) errs.name = 'Product name is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    if (!categoryId) errs.category = 'Category is required.';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = 'Valid price is required.';
    if (!stockQuantity || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0) errs.stockQuantity = 'Valid stock quantity is required.';
    if (cost && (isNaN(Number(cost)) || Number(cost) < 0)) errs.cost = 'Valid cost is required.';
    if (weight && (isNaN(Number(weight)) || Number(weight) < 0)) errs.weight = 'Valid weight is required.';
    setErrors(errs);
    console.log('Validation errors:', errs);
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

  const handleSave = async () => {
    console.log('handleSave called');
    console.log('Form values:', { image, name, description, categoryId, price, stockQuantity, sku, tags, cost, weight, dimensions, isActive });
    if (!validate()) {
      Toast.show({ type: 'error', text1: 'Please fix the errors in the form.' });
      Alert.alert('Validation Error', 'Please fix the errors in the form.');
      return;
    }
    setSubmitting(true);
    try {
      console.log('Starting product creation with image upload...');
      
      // Use the new createProductWithImage function
      await productAPI.createProductWithImage({
        name,
        description,
        price: Number(price),
        cost_price: cost ? Number(cost) : null,
        stock_quantity: Number(stockQuantity),
        sku: sku.trim() || null,
        tags: tags.trim() ? tags.split(',').map(tag => tag.trim()) : [],
        weight: weight ? Number(weight) : null,
        dimensions: dimensions.length || dimensions.width || dimensions.height ? dimensions : null,
        is_active: isActive,
        store_id: 'c13f0048-0126-4421-8e81-d0dd50fcf1d0', // Hardcoded for testing
        category_id: categoryId,
      }, image); // Pass the image URI for upload
      
      Toast.show({ type: 'success', text1: 'Product added successfully!' });
      navigation.goBack();
    } catch (e) {
      console.error('Create product error:', e);
      
      // Handle specific image upload errors
      if (e.message && e.message.includes('Storage bucket not found')) {
        Alert.alert(
          'Storage Setup Required', 
          'Please create the "product-images" bucket in your Supabase Storage. Check SUPABASE_STORAGE_SETUP.md for instructions.'
        );
      } else if (e.message && e.message.includes('Upload permission denied')) {
        Alert.alert(
          'Permission Error', 
          'Please check your Supabase Storage policies. Make sure the bucket is public and upload policies are set correctly.'
        );
      } else if (e.message && e.message.includes('File too large')) {
        Alert.alert(
          'File Too Large', 
          'The image file is too large. Please select a smaller image (max 10MB).'
        );
      } else if (e.message && e.message.includes('Invalid file type')) {
        Alert.alert(
          'Invalid File Type', 
          'Please select a valid image file (JPEG, PNG, or WebP).'
        );
      } else {
        Alert.alert('Error', `Failed to add product: ${e.message || 'Unknown error'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };











  return (
    <View style={{ flex: 1, backgroundColor: '#fafbfc' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Product</Text>
        </View>



        {/* Product Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.imagePickerText}>Add Product Image</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.image && <Text style={styles.error}>{errors.image}</Text>}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter product name"
            maxLength={100}
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, { height: 35 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
            multiline
            maxLength={500}
          />
          {errors.description && <Text style={styles.error}>{errors.description}</Text>}

          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={[styles.input, { justifyContent: 'center' }]}
            onPress={() => setCategoryModalVisible(true)}
            disabled={categoriesLoading}
          >
            <Text style={{ color: categoryId ? colors.text : colors.textSecondary }}>
              {categoriesLoading ? 'Loading...' : (categories.find(c => c.id === categoryId)?.name || 'Select category')}
            </Text>
          </TouchableOpacity>
          <CategoryModalPicker
            visible={categoryModalVisible}
            categories={categories}
            value={categoryId}
            onSelect={setCategoryId}
            onClose={() => setCategoryModalVisible(false)}
          />
          {errors.category && <Text style={styles.error}>{errors.category}</Text>}
        </View>

        {/* Pricing & Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Inventory</Text>
          
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Price *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="$0.00"
                keyboardType="decimal-pad"
                maxLength={12}
              />
              {errors.price && <Text style={styles.error}>{errors.price}</Text>}
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Cost</Text>
              <TextInput
                style={styles.input}
                value={cost}
                onChangeText={setCost}
                placeholder="$0.00"
                keyboardType="decimal-pad"
                maxLength={12}
              />
              {errors.cost && <Text style={styles.error}>{errors.cost}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Stock *</Text>
              <TextInput
                style={styles.input}
                value={stockQuantity}
                onChangeText={setStockQuantity}
                placeholder="1"
                keyboardType="numeric"
                maxLength={6}
              />
              {errors.stockQuantity && <Text style={styles.error}>{errors.stockQuantity}</Text>}
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>SKU</Text>
              <TextInput
                style={styles.input}
                value={sku}
                onChangeText={setSku}
                placeholder="Enter SKU"
                maxLength={50}
              />
            </View>
          </View>
        </View>

        {/* Additional Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="Enter tags separated by commas"
            maxLength={200}
          />

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="0.0"
                keyboardType="decimal-pad"
                maxLength={8}
              />
              {errors.weight && <Text style={styles.error}>{errors.weight}</Text>}
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Dimensions</Text>
              <View style={styles.dimensionsRow}>
                <TextInput
                  style={[styles.input, styles.dimensionInput]}
                  value={dimensions.length}
                  onChangeText={(text) => setDimensions(prev => ({ ...prev, length: text }))}
                  placeholder="L"
                  keyboardType="decimal-pad"
                  maxLength={6}
                />
                <TextInput
                  style={[styles.input, styles.dimensionInput]}
                  value={dimensions.width}
                  onChangeText={(text) => setDimensions(prev => ({ ...prev, width: text }))}
                  placeholder="W"
                  keyboardType="decimal-pad"
                  maxLength={6}
                />
                <TextInput
                  style={[styles.input, styles.dimensionInput]}
                  value={dimensions.height}
                  onChangeText={(text) => setDimensions(prev => ({ ...prev, height: text }))}
                  placeholder="H"
                  keyboardType="decimal-pad"
                  maxLength={6}
                />
              </View>
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Active Status</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isActive ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.publishButton} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={12} color={colors.white} />
            <Text style={styles.publishButtonText}>Publish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <Toast />
    </View>
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: 10,
    marginBottom: 8,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    color: colors.text,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 3,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radii.small,
    padding: 6,
    fontSize: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: {
    color: colors.discount,
    fontSize: 10,
    marginBottom: 4,
    marginTop: -1,
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
    marginBottom: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: radii.small,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  imagePickerText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  column: {
    flex: 1,
  },
  dimensionsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dimensionInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.secondary,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flex: 1,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  publishButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  publishButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 3,
  },
}); 