import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from '../../components/BackButton';
import { theme } from '../../constants/theme';

interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  icon: string;
  features: string[];
  metrics?: {
    usage: number;
    successRate: number;
    timeSaved: string;
  };
}

const AIIntegrationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [tools, setTools] = useState<AITool[]>([
    {
      id: '1',
      name: 'Abandoned Cart Recovery',
      description: 'AI-powered cart recovery with personalized incentives',
      category: 'Revenue',
      isActive: true,
      icon: 'cart-outline',
      features: ['Smart timing', 'Personalized offers', 'Multi-channel recovery'],
      metrics: { usage: 1247, successRate: 23.5, timeSaved: '8.2h' }
    },
    {
      id: '2',
      name: 'Product Description Generator',
      description: 'Generate compelling product descriptions using AI',
      category: 'Content',
      isActive: true,
      icon: 'document-text-outline',
      features: ['SEO optimized', 'Brand voice matching', 'Multi-language support'],
      metrics: { usage: 892, successRate: 94.2, timeSaved: '12.5h' }
    },
    {
      id: '3',
      name: 'Price Optimization',
      description: 'AI-powered pricing recommendations and dynamic pricing',
      category: 'Analytics',
      isActive: true,
      icon: 'trending-up-outline',
      features: ['Competitor analysis', 'Demand forecasting', 'Profit optimization'],
      metrics: { usage: 567, successRate: 87.3, timeSaved: '6.8h' }
    },
    {
      id: '4',
      name: 'Customer Support Bot',
      description: 'Intelligent customer support with natural language processing',
      category: 'Support',
      isActive: false,
      icon: 'chatbubble-outline',
      features: ['24/7 availability', 'Multi-language', 'Escalation handling'],
      metrics: { usage: 2341, successRate: 91.7, timeSaved: '15.3h' }
    },
    {
      id: '5',
      name: 'Inventory Forecasting',
      description: 'Predict inventory needs using machine learning',
      category: 'Analytics',
      isActive: true,
      icon: 'analytics-outline',
      features: ['Demand prediction', 'Stock optimization', 'Seasonal analysis'],
      metrics: { usage: 445, successRate: 89.1, timeSaved: '9.7h' }
    },
    {
      id: '6',
      name: 'Image Enhancement',
      description: 'Enhance product images automatically with AI',
      category: 'Media',
      isActive: false,
      icon: 'image-outline',
      features: ['Background removal', 'Quality enhancement', 'Batch processing'],
      metrics: { usage: 123, successRate: 96.8, timeSaved: '4.2h' }
    },
    {
      id: '7',
      name: 'Customer Segmentation',
      description: 'AI-powered customer segmentation and targeting',
      category: 'Marketing',
      isActive: true,
      icon: 'people-outline',
      features: ['Behavioral analysis', 'Predictive modeling', 'Personalization'],
      metrics: { usage: 334, successRate: 85.6, timeSaved: '7.1h' }
    },
    {
      id: '8',
      name: 'Review Sentiment Analysis',
      description: 'Analyze customer reviews and feedback sentiment',
      category: 'Analytics',
      isActive: true,
      icon: 'star-outline',
      features: ['Sentiment scoring', 'Trend analysis', 'Issue detection'],
      metrics: { usage: 678, successRate: 92.4, timeSaved: '5.9h' }
    },
    {
      id: '9',
      name: 'Predictive Analytics',
      description: 'Forecast sales, trends, and customer behavior',
      category: 'Analytics',
      isActive: false,
      icon: 'bar-chart-outline',
      features: ['Sales forecasting', 'Trend prediction', 'Risk assessment'],
      metrics: { usage: 289, successRate: 78.9, timeSaved: '11.2h' }
    },
    {
      id: '10',
      name: 'Automated Email Marketing',
      description: 'AI-driven email campaigns and personalization',
      category: 'Marketing',
      isActive: true,
      icon: 'mail-outline',
      features: ['Smart segmentation', 'A/B testing', 'Timing optimization'],
      metrics: { usage: 1567, successRate: 88.3, timeSaved: '13.8h' }
    }
  ]);

  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showCartRecoveryModal, setShowCartRecoveryModal] = useState(false);

  const handleToolPress = (tool: AITool) => {
    setSelectedTool(tool);
    if (tool.name === 'Abandoned Cart Recovery') {
      setShowCartRecoveryModal(true);
    } else {
      setShowConfigureModal(true);
    }
  };

  const handleAddTool = () => {
    setShowAddModal(true);
  };

  const handleAnalytics = () => {
    setShowAnalyticsModal(true);
  };

  const toggleToolStatus = (toolId: string) => {
    setTools(prev => prev.map(tool => 
      tool.id === toolId ? { ...tool, isActive: !tool.isActive } : tool
    ));
  };

  const renderToolItem = (tool: AITool) => (
    <TouchableOpacity
      key={tool.id}
      style={[styles.toolItem, !tool.isActive && styles.inactiveTool]}
      onPress={() => handleToolPress(tool)}
    >
      <View style={styles.toolHeader}>
        <View style={styles.toolInfo}>
          <Ionicons name={tool.icon as any} size={24} color={theme.colors.primary} />
          <View style={styles.toolText}>
            <Text style={[styles.toolName, !tool.isActive && styles.inactiveText]}>
              {tool.name}
            </Text>
            <Text style={[styles.toolDescription, !tool.isActive && styles.inactiveText]}>
              {tool.description}
            </Text>
          </View>
        </View>
        <View style={styles.toolControls}>
          <Switch
            value={tool.isActive}
            onValueChange={() => toggleToolStatus(tool.id)}
            trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
            thumbColor={theme.colors.white}
          />
        </View>
      </View>
      
      <View style={styles.toolFeatures}>
        {tool.features.map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {tool.metrics && (
        <View style={styles.toolMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Usage</Text>
            <Text style={styles.metricValue}>{tool.metrics.usage}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Success Rate</Text>
            <Text style={styles.metricValue}>{tool.metrics.successRate}%</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Time Saved</Text>
            <Text style={styles.metricValue}>{tool.metrics.timeSaved}</Text>
          </View>
        </View>
      )}

      <View style={styles.toolCategory}>
        <Text style={styles.categoryText}>{tool.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCartRecoveryModal = () => (
    <Modal
      visible={showCartRecoveryModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCartRecoveryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Abandoned Cart Recovery</Text>
          <Text style={styles.modalSubtitle}>
            AI-powered cart recovery system configuration
          </Text>
          
          <View style={styles.modalForm}>
            <Text style={styles.formLabel}>Recovery Strategy</Text>
            <View style={styles.strategyContainer}>
              <TouchableOpacity style={[styles.strategyOption, styles.strategyActive]}>
                <Text style={styles.strategyText}>Smart Timing</Text>
                <Text style={styles.strategyDescription}>AI determines optimal send times</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.strategyOption}>
                <Text style={styles.strategyText}>Personalized Offers</Text>
                <Text style={styles.strategyDescription}>Custom incentives per customer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.strategyOption}>
                <Text style={styles.strategyText}>Multi-Channel</Text>
                <Text style={styles.strategyDescription}>Email, SMS, Push notifications</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>Recovery Settings</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>First Reminder (hours)</Text>
              <TextInput style={styles.settingInput} placeholder="2" />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Second Reminder (hours)</Text>
              <TextInput style={styles.settingInput} placeholder="24" />
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Final Reminder (hours)</Text>
              <TextInput style={styles.settingInput} placeholder="72" />
            </View>

            <Text style={styles.formLabel}>Incentive Types</Text>
            <View style={styles.incentiveContainer}>
              <TouchableOpacity style={[styles.incentiveOption, styles.incentiveActive]}>
                <Text style={styles.incentiveText}>Discount Code</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.incentiveOption}>
                <Text style={styles.incentiveText}>Free Shipping</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.incentiveOption}>
                <Text style={styles.incentiveText}>Gift Card</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowCartRecoveryModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.addButton]}
              onPress={() => {
                Alert.alert('Success', 'Cart recovery settings updated!');
                setShowCartRecoveryModal(false);
              }}
            >
              <Text style={styles.addButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAddToolModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add AI Tool</Text>
          <Text style={styles.modalSubtitle}>
            Configure a new AI-powered tool for your store
          </Text>
          
          <View style={styles.modalForm}>
            <Text style={styles.formLabel}>Tool Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter tool name"
              placeholderTextColor={theme.colors.text.tertiary}
            />
            
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe what this tool does"
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.formLabel}>Category</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Analytics, Content, Support"
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.addButton]}
              onPress={() => {
                Alert.alert('Success', 'AI tool added successfully!');
                setShowAddModal(false);
              }}
            >
              <Text style={styles.addButtonText}>Add Tool</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderAnalyticsModal = () => (
    <Modal
      visible={showAnalyticsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAnalyticsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>AI Analytics Dashboard</Text>
          <Text style={styles.modalSubtitle}>
            Performance metrics for your AI tools
          </Text>
          
          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>Active Tools</Text>
              <Text style={styles.analyticsValue}>{tools.filter(t => t.isActive).length}</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>Total Usage</Text>
              <Text style={styles.analyticsValue}>
                {tools.reduce((sum, tool) => sum + (tool.metrics?.usage || 0), 0)}
              </Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>Avg Success Rate</Text>
              <Text style={styles.analyticsValue}>
                {(tools.reduce((sum, tool) => sum + (tool.metrics?.successRate || 0), 0) / tools.filter(t => t.metrics).length).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsLabel}>Total Time Saved</Text>
              <Text style={styles.analyticsValue}>
                {tools.reduce((sum, tool) => {
                  const time = tool.metrics?.timeSaved || '0h';
                  return sum + parseFloat(time.replace('h', ''));
                }, 0)}h
              </Text>
            </View>
          </View>

          <View style={styles.topToolsContainer}>
            <Text style={styles.sectionTitle}>Top Performing Tools</Text>
            {tools
              .filter(t => t.metrics)
              .sort((a, b) => (b.metrics?.successRate || 0) - (a.metrics?.successRate || 0))
              .slice(0, 3)
              .map(tool => (
                <View key={tool.id} style={styles.topToolItem}>
                  <Text style={styles.topToolName}>{tool.name}</Text>
                  <Text style={styles.topToolMetric}>{tool.metrics?.successRate}% success rate</Text>
                </View>
              ))
            }
          </View>
          
          <TouchableOpacity
            style={[styles.modalButton, styles.addButton]}
            onPress={() => setShowAnalyticsModal(false)}
          >
            <Text style={styles.addButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderConfigureModal = () => (
    <Modal
      visible={showConfigureModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowConfigureModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Configure {selectedTool?.name}</Text>
          <Text style={styles.modalSubtitle}>
            Customize settings for this AI tool
          </Text>
          
          <View style={styles.modalForm}>
            <Text style={styles.formLabel}>Enable Tool</Text>
            <View style={styles.switchContainer}>
              <Switch
                value={selectedTool?.isActive || false}
                onValueChange={() => selectedTool && toggleToolStatus(selectedTool.id)}
                trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
              <Text style={styles.switchLabel}>
                {selectedTool?.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
            
            <Text style={styles.formLabel}>API Key</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter API key"
              placeholderTextColor={theme.colors.text.tertiary}
              secureTextEntry
            />
            
            <Text style={styles.formLabel}>Settings</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Configure tool settings"
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowConfigureModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.addButton]}
              onPress={() => {
                Alert.alert('Success', 'Tool configuration updated!');
                setShowConfigureModal(false);
              }}
            >
              <Text style={styles.addButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <BackButton />
      
      <View style={styles.header}>
        <Text style={styles.title}>AI Integration</Text>
        <Text style={styles.subtitle}>
          Leverage AI tools to enhance your store performance and boost revenue
        </Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={handleAddTool}>
          <Ionicons name="add-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>Add Tool</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={handleAnalytics}>
          <Ionicons name="analytics-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.quickActionText}>Analytics</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.toolsContainer}>
          {tools.map(renderToolItem)}
        </View>
      </ScrollView>

      {renderAddToolModal()}
      {renderAnalyticsModal()}
      {renderConfigureModal()}
      {renderCartRecoveryModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  toolsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  toolItem: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inactiveTool: {
    opacity: 0.6,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  toolInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  toolText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  toolName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  inactiveText: {
    color: theme.colors.text.tertiary,
  },
  toolDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  toolControls: {
    marginLeft: theme.spacing.sm,
  },
  toolFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  featureTag: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  featureText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  toolMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  toolCategory: {
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  modalForm: {
    marginBottom: theme.spacing.lg,
  },
  formLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  switchLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  strategyContainer: {
    marginBottom: theme.spacing.md,
  },
  strategyOption: {
    backgroundColor: theme.colors.gray[100],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  strategyActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  strategyText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  strategyDescription: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  settingLabel: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    width: 80,
    textAlign: 'center',
  },
  incentiveContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  incentiveOption: {
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  incentiveActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  incentiveText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.gray[200],
  },
  cancelButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  addButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.white,
  },
  analyticsContainer: {
    marginBottom: theme.spacing.lg,
  },
  analyticsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  analyticsLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  analyticsValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  topToolsContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  topToolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  topToolName: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  topToolMetric: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
});

export default AIIntegrationScreen;
