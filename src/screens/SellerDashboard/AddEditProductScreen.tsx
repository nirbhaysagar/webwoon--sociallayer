import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, Platform, KeyboardAvoidingView, ActivityIndicator, Modal, Switch } from 'react-native';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../context/AppContext';
import { categoryAPI, productAPI } from '../../services/api';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

// AI Service for product enhancement
const aiService = {
  generateDescription: async (productName: string, category: string) => {
    // Simulate AI API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `Discover the amazing ${productName}! This premium ${category} product offers exceptional quality and value. Perfect for discerning customers who appreciate superior craftsmanship and innovative design. Features include high-quality materials, durable construction, and stylish aesthetics that complement any setting. Don't miss out on this must-have item that combines functionality with elegance.`;
  },
  
  suggestPricing: async (productName: string, category: string, cost?: number) => {
    // Simulate AI pricing analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    const basePrice = cost ? cost * 2.5 : Math.random() * 100 + 20;
    const marketPrice = basePrice * (0.8 + Math.random() * 0.4);
    return {
      suggestedPrice: Math.round(marketPrice * 100) / 100,
      marketRange: {
        min: Math.round(basePrice * 0.7 * 100) / 100,
        max: Math.round(basePrice * 1.3 * 100) / 100,
      },
      confidence: Math.round((0.7 + Math.random() * 0.3) * 100),
    };
  },
  
  optimizeImage: async (imageUri: string) => {
    // Simulate image optimization
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      optimized: true,
      originalSize: '2.4 MB',
      optimizedSize: '0.8 MB',
      compression: '67%',
    };
  },
  
  suggestCategories: async (productName: string) => {
    // Simulate AI category suggestions
    await new Promise(resolve => setTimeout(resolve, 1000));
    const allCategories = ['Fashion', 'Electronics', 'Home & Garden', 'Sports', 'Beauty', 'Books', 'Toys', 'Automotive'];
    const suggestions = allCategories
      .filter(() => Math.random() > 0.5)
      .slice(0, 3);
    return suggestions;
  },
};

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
  const [aiMode, setAiMode] = useState('seller'); // 'seller' or 'user'
  
  // AI enhancement states
  const [aiFeatures, setAiFeatures] = useState({
    descriptionGenerating: false,
    pricingAnalyzing: false,
    imageOptimizing: false,
    categorySuggesting: false,
  });
  const [aiSuggestions, setAiSuggestions] = useState({
    description: '',
    pricing: null,
    imageOptimization: null,
    categorySuggestions: [],
  });
  const [showAiFeatures, setShowAiFeatures] = useState(false);

  // Fetch categories from DB
  useEffect(() => {
    (async () => {
      setCategoriesLoading(true);
      try {
        const cats = await categoryAPI.getCategories();
        setCategories(cats);
      } catch (e) {
        Alert.alert('Error', 'Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    })();
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
      Alert.alert('Error', 'Failed to add product.');
      console.error('Create product error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiDescriptionGeneration = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Product name required',
        text2: 'Please enter a product name first',
      });
      return;
    }

    setAiFeatures(prev => ({ ...prev, descriptionGenerating: true }));
    try {
      const categoryName = categories.find(c => c.id === categoryId)?.name || 'product';
      const aiDescription = await aiService.generateDescription(name, categoryName);
      setAiSuggestions(prev => ({ ...prev, description: aiDescription }));
      Toast.show({
        type: 'success',
        text1: 'AI Description Generated',
        text2: 'Review and customize the description',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Generation Failed',
        text2: 'Please try again',
      });
    } finally {
      setAiFeatures(prev => ({ ...prev, descriptionGenerating: false }));
    }
  };

  const handleAiPricingAnalysis = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Product name required',
        text2: 'Please enter a product name first',
      });
      return;
    }

    setAiFeatures(prev => ({ ...prev, pricingAnalyzing: true }));
    try {
      const categoryName = categories.find(c => c.id === categoryId)?.name || 'product';
      const pricingData = await aiService.suggestPricing(name, categoryName, parseFloat(cost) || undefined);
      setAiSuggestions(prev => ({ ...prev, pricing: pricingData }));
      Toast.show({
        type: 'success',
        text1: 'Pricing Analysis Complete',
        text2: `Suggested: $${pricingData.suggestedPrice}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Analysis Failed',
        text2: 'Please try again',
      });
    } finally {
      setAiFeatures(prev => ({ ...prev, pricingAnalyzing: false }));
    }
  };

  const handleImageOptimization = async () => {
    if (!image) {
      Toast.show({
        type: 'error',
        text1: 'Image required',
        text2: 'Please select an image first',
      });
      return;
    }

    setAiFeatures(prev => ({ ...prev, imageOptimizing: true }));
    try {
      const optimization = await aiService.optimizeImage(image);
      setAiSuggestions(prev => ({ ...prev, imageOptimization: optimization }));
      Toast.show({
        type: 'success',
        text1: 'Image Optimized',
        text2: `${optimization.compression} size reduction`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Optimization Failed',
        text2: 'Please try again',
      });
    } finally {
      setAiFeatures(prev => ({ ...prev, imageOptimizing: false }));
    }
  };

  const handleCategorySuggestions = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Product name required',
        text2: 'Please enter a product name first',
      });
      return;
    }

    setAiFeatures(prev => ({ ...prev, categorySuggesting: true }));
    try {
      const suggestions = await aiService.suggestCategories(name);
      setAiSuggestions(prev => ({ ...prev, categorySuggestions: suggestions }));
      Toast.show({
        type: 'success',
        text1: 'Category Suggestions',
        text2: `${suggestions.length} categories found`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Suggestions Failed',
        text2: 'Please try again',
      });
    } finally {
      setAiFeatures(prev => ({ ...prev, categorySuggesting: false }));
    }
  };

  const applyAiDescription = () => {
    setDescription(aiSuggestions.description);
    setAiSuggestions(prev => ({ ...prev, description: '' }));
  };

  const applyAiPricing = () => {
    if (aiSuggestions.pricing) {
      setPrice(aiSuggestions.pricing.suggestedPrice.toString());
      setAiSuggestions(prev => ({ ...prev, pricing: null }));
    }
  };

  const renderAiFeatures = () => (
    <View style={styles.aiSection}>
      <View style={styles.aiHeader}>
        <Ionicons name="sparkles" size={20} color={colors.primary} />
        <Text style={styles.aiTitle}>AI-Powered Features</Text>
        <TouchableOpacity onPress={() => setShowAiFeatures(!showAiFeatures)}>
          <Ionicons 
            name={showAiFeatures ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
      
      {showAiFeatures && (
        <View style={styles.aiFeatures}>
          {/* AI Description Generation */}
          <View style={styles.aiFeature}>
            <View style={styles.aiFeatureHeader}>
              <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.aiFeatureTitle}>Generate Description</Text>
            </View>
            <TouchableOpacity 
              style={[styles.aiButton, aiFeatures.descriptionGenerating && styles.aiButtonLoading]}
              onPress={handleAiDescriptionGeneration}
              disabled={aiFeatures.descriptionGenerating}
            >
              {aiFeatures.descriptionGenerating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="sparkles" size={16} color="white" />
              )}
              <Text style={styles.aiButtonText}>
                {aiFeatures.descriptionGenerating ? 'Generating...' : 'Generate'}
              </Text>
            </TouchableOpacity>
            {aiSuggestions.description && (
              <View style={styles.aiSuggestion}>
                <Text style={styles.aiSuggestionText}>{aiSuggestions.description}</Text>
                <TouchableOpacity style={styles.applyButton} onPress={applyAiDescription}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* AI Pricing Analysis */}
          <View style={styles.aiFeature}>
            <View style={styles.aiFeatureHeader}>
              <Ionicons name="trending-up-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.aiFeatureTitle}>Pricing Analysis</Text>
            </View>
            <TouchableOpacity 
              style={[styles.aiButton, aiFeatures.pricingAnalyzing && styles.aiButtonLoading]}
              onPress={handleAiPricingAnalysis}
              disabled={aiFeatures.pricingAnalyzing}
            >
              {aiFeatures.pricingAnalyzing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="analytics-outline" size={16} color="white" />
              )}
              <Text style={styles.aiButtonText}>
                {aiFeatures.pricingAnalyzing ? 'Analyzing...' : 'Analyze'}
              </Text>
            </TouchableOpacity>
            {aiSuggestions.pricing && (
              <View style={styles.aiSuggestion}>
                <Text style={styles.aiSuggestionText}>
                  Suggested: ${aiSuggestions.pricing.suggestedPrice}
                </Text>
                <Text style={styles.aiSuggestionSubtext}>
                  Market range: ${aiSuggestions.pricing.marketRange.min} - ${aiSuggestions.pricing.marketRange.max}
                </Text>
                <Text style={styles.aiSuggestionSubtext}>
                  Confidence: {aiSuggestions.pricing.confidence}%
                </Text>
                <TouchableOpacity style={styles.applyButton} onPress={applyAiPricing}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* AI Image Optimization */}
          <View style={styles.aiFeature}>
            <View style={styles.aiFeatureHeader}>
              <Ionicons name="image-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.aiFeatureTitle}>Optimize Image</Text>
            </View>
            <TouchableOpacity 
              style={[styles.aiButton, aiFeatures.imageOptimizing && styles.aiButtonLoading]}
              onPress={handleImageOptimization}
              disabled={aiFeatures.imageOptimizing}
            >
              {aiFeatures.imageOptimizing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="compress-outline" size={16} color="white" />
              )}
              <Text style={styles.aiButtonText}>
                {aiFeatures.imageOptimizing ? 'Optimizing...' : 'Optimize'}
              </Text>
            </TouchableOpacity>
            {aiSuggestions.imageOptimization && (
              <View style={styles.aiSuggestion}>
                <Text style={styles.aiSuggestionText}>
                  Size reduced by {aiSuggestions.imageOptimization.compression}
                </Text>
                <Text style={styles.aiSuggestionSubtext}>
                  {aiSuggestions.imageOptimization.originalSize} → {aiSuggestions.imageOptimization.optimizedSize}
                </Text>
              </View>
            )}
          </View>

          {/* AI Category Suggestions */}
          <View style={styles.aiFeature}>
            <View style={styles.aiFeatureHeader}>
              <Ionicons name="grid-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.aiFeatureTitle}>Category Suggestions</Text>
            </View>
            <TouchableOpacity 
              style={[styles.aiButton, aiFeatures.categorySuggesting && styles.aiButtonLoading]}
              onPress={handleCategorySuggestions}
              disabled={aiFeatures.categorySuggesting}
            >
              {aiFeatures.categorySuggesting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="bulb-outline" size={16} color="white" />
              )}
              <Text style={styles.aiButtonText}>
                {aiFeatures.categorySuggesting ? 'Analyzing...' : 'Suggest'}
              </Text>
            </TouchableOpacity>
            {aiSuggestions.categorySuggestions.length > 0 && (
              <View style={styles.aiSuggestion}>
                <Text style={styles.aiSuggestionText}>Suggested categories:</Text>
                {aiSuggestions.categorySuggestions.map((suggestion, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.categorySuggestion}
                    onPress={() => {
                      const category = categories.find(c => c.name === suggestion);
                      if (category) {
                        setCategoryId(category.id);
                        setAiSuggestions(prev => ({ ...prev, categorySuggestions: [] }));
                      }
                    }}
                  >
                    <Text style={styles.categorySuggestionText}>{suggestion}</Text>
                    <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#fafbfc' }}
        contentContainerStyle={{ padding: 16, flexGrow: 1, paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 8 }}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Product</Text>
        </View>

          {/* AI Mode Toggle */}
          <View style={styles.aiModeContainer}>
            <View style={styles.aiModeHeader}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
              <Text style={styles.aiModeTitle}>AI-Powered Features</Text>
            </View>
            <View style={styles.aiModeToggle}>
              <TouchableOpacity 
                style={[styles.aiModeButton, aiMode === 'seller' && styles.aiModeButtonActive]}
                onPress={() => setAiMode('seller')}
              >
                <Text style={[styles.aiModeButtonText, aiMode === 'seller' && styles.aiModeButtonTextActive]}>
                  Seller
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.aiModeButton, aiMode === 'user' && styles.aiModeButtonActive]}
                onPress={() => setAiMode('user')}
              >
                <Text style={[styles.aiModeButtonText, aiMode === 'user' && styles.aiModeButtonTextActive]}>
                  User
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderAiFeatures()}

          {/* Image Picker */}
          <Text style={styles.label}>Image *</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePickerText}>Pick Image</Text>
            )}
          </TouchableOpacity>
          {errors.image && <Text style={styles.error}>{errors.image}</Text>}

          {/* Product Name */}
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter product name"
            maxLength={100}
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}

          {/* Description */}
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
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
              disabled={categoriesLoading}
            >
              <Text style={{ color: categoryId ? '#111' : '#888' }}>
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
          </View>
          {errors.category && <Text style={styles.error}>{errors.category}</Text>}

          {/* Price */}
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

          {/* Cost */}
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

          {/* Stock Quantity */}
          <Text style={styles.label}>Stock Quantity *</Text>
          <TextInput
            style={styles.input}
            value={stockQuantity}
            onChangeText={setStockQuantity}
            placeholder="1"
            keyboardType="numeric"
            maxLength={6}
          />
          {errors.stockQuantity && <Text style={styles.error}>{errors.stockQuantity}</Text>}

          {/* SKU */}
          <Text style={styles.label}>SKU</Text>
          <TextInput
            style={styles.input}
            value={sku}
            onChangeText={setSku}
            placeholder="Enter SKU"
            maxLength={50}
          />

          {/* Tags */}
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="Enter tags separated by commas"
            maxLength={200}
          />

          {/* Weight */}
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

          {/* Dimensions */}
          <Text style={styles.label}>Dimensions (inches)</Text>
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

          {/* Active Status */}
          <View style={styles.switchRow}>
            <Text style={styles.label}>Active Status</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isActive ? '#fff' : '#f4f3f4'}
            />
          </View>

          {/* Save/Cancel Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={submitting}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={submitting || loading}>
              {submitting || loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>
          </View>
          {/* Extra space to ensure buttons are above the bottom nav bar */}
          <View style={{ height: 40 }} />
        </ScrollView>
        
        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={() => Alert.alert('Settings', 'Additional product settings')}>
          <Ionicons name="settings" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Toast />
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
    paddingBottom: 32,
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
  // New AI feature styles
  aiSection: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiTitle: {
    flex: 1,
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.s,
  },
  aiFeatures: {
    marginTop: spacing.m,
  },
  aiFeature: {
    marginBottom: spacing.m,
    padding: spacing.m,
    backgroundColor: colors.background,
    borderRadius: radii.medium,
  },
  aiFeatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  aiFeatureTitle: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.s,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radii.medium,
    gap: spacing.s,
  },
  aiButtonLoading: {
    opacity: 0.7,
  },
  aiButtonText: {
    color: 'white',
    fontSize: scale(14),
    fontWeight: '600',
  },
  aiSuggestion: {
    marginTop: spacing.s,
    padding: spacing.s,
    backgroundColor: colors.primary + '10',
    borderRadius: radii.small,
  },
  aiSuggestionText: {
    fontSize: scale(14),
    color: colors.text,
    marginBottom: spacing.xs,
  },
  aiSuggestionSubtext: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  applyButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radii.small,
    marginTop: spacing.xs,
  },
  applyButtonText: {
    color: 'white',
    fontSize: scale(12),
    fontWeight: '600',
  },
  categorySuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    backgroundColor: colors.background,
    borderRadius: radii.small,
    marginTop: spacing.xs,
  },
  categorySuggestionText: {
    fontSize: scale(14),
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    padding: spacing.m,
    fontSize: scale(16),
    color: colors.text,
    minHeight: scale(100),
    textAlignVertical: 'top',
  },
  // AI Mode Toggle Styles
  aiModeContainer: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  aiModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  aiModeTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.s,
  },
  aiModeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    padding: spacing.xs,
  },
  aiModeButton: {
    flex: 1,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  aiModeButtonActive: {
    backgroundColor: colors.primary,
  },
  aiModeButtonText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  aiModeButtonTextActive: {
    color: '#fff',
  },
  // Additional Form Field Styles
  dimensionsRow: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  dimensionInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    right: spacing.l,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
}); 