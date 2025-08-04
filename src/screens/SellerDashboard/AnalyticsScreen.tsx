import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows, icon } from '../../constants/theme';
import HeaderWithMenu from './components/HeaderWithMenu';
import { useApp } from '../../context/AppContext';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

const TABS = ['Sales', 'Content', 'Traffic', 'Products'];
const FILTERS = ['7d', '30d', '90d', 'All'];

// Comprehensive analytics data for different time periods and categories
const analyticsData = {
  '7d': {
    Sales: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'This post brought 60% of sales' },
        { id: '2', icon: 'time-outline', text: 'Your best conversion time is 7-9 PM' },
      ],
      charts: [
        { id: '1', title: 'Revenue Over Time', icon: 'trending-up-outline', value: '$1,240', trend: '+8%', trendDir: 'up', vs: '+8% vs last 7d', chart: true },
        { id: '2', title: 'Best-Performing Post', icon: 'star-outline', value: 'Summer Collection Reel', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Product Conversion Rate', icon: 'bar-chart-outline', value: '8%', trend: '+2%', trendDir: 'up', vs: '+2% vs last 7d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Sneakers', stat: '$320' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Handbag', stat: '$280' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Reel', stat: '450 views' },
      ]
    },
    Content: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Video posts get 3x more engagement' },
        { id: '2', icon: 'time-outline', text: 'Best posting time is 2-4 PM' },
      ],
      charts: [
        { id: '1', title: 'Engagement Rate', icon: 'trending-up-outline', value: '4.2%', trend: '+15%', trendDir: 'up', vs: '+15% vs last 7d', chart: true },
        { id: '2', title: 'Top Content', icon: 'star-outline', value: 'Summer Collection Reel', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Reach Growth', icon: 'bar-chart-outline', value: '2,450', trend: '+320', trendDir: 'up', vs: '+320 vs last 7d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Reel', stat: '1,200 views' },
        { id: '2', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Sneakers Post', stat: '850 likes' },
        { id: '3', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Handbag Story', stat: '320 shares' },
      ]
    },
    Traffic: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Mobile traffic increased by 40%' },
        { id: '2', icon: 'time-outline', text: 'Peak traffic hours: 6-8 PM' },
      ],
      charts: [
        { id: '1', title: 'Page Views', icon: 'trending-up-outline', value: '8,450', trend: '+12%', trendDir: 'up', vs: '+12% vs last 7d', chart: true },
        { id: '2', title: 'Top Source', icon: 'star-outline', value: 'Instagram', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Bounce Rate', icon: 'bar-chart-outline', value: '32%', trend: '-5%', trendDir: 'down', vs: '-5% vs last 7d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Home Page', stat: '2,100 views' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Products Page', stat: '1,850 views' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'About Page', stat: '450 views' },
      ]
    },
    Products: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Sneakers are your best seller' },
        { id: '2', icon: 'time-outline', text: 'Handbags have highest margin' },
      ],
      charts: [
        { id: '1', title: 'Units Sold', icon: 'trending-up-outline', value: '45', trend: '+8', trendDir: 'up', vs: '+8 vs last 7d', chart: true },
        { id: '2', title: 'Top Product', icon: 'star-outline', value: 'Classic Sneakers', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Average Order Value', icon: 'bar-chart-outline', value: '$89', trend: '+$12', trendDir: 'up', vs: '+$12 vs last 7d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Classic Sneakers', stat: '12 sold' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Leather Handbag', stat: '8 sold' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Dress', stat: '6 sold' },
      ]
    }
  },
  '30d': {
    Sales: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'This post brought 60% of sales' },
        { id: '2', icon: 'time-outline', text: 'Your best conversion time is 7-9 PM' },
      ],
      charts: [
        { id: '1', title: 'Revenue Over Time', icon: 'trending-up-outline', value: '$4,320', trend: '+12%', trendDir: 'up', vs: '+12% vs last 30d', chart: true },
        { id: '2', title: 'Best-Performing Post', icon: 'star-outline', value: 'Summer Collection Reel', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Product Conversion Rate', icon: 'bar-chart-outline', value: '12%', trend: '-2%', trendDir: 'down', vs: '-2% vs last 30d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Sneakers', stat: '$1,200' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Handbag', stat: '$900' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Reel', stat: '1,200 views' },
      ]
    },
    Content: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Video posts get 3x more engagement' },
        { id: '2', icon: 'time-outline', text: 'Best posting time is 2-4 PM' },
      ],
      charts: [
        { id: '1', title: 'Engagement Rate', icon: 'trending-up-outline', value: '5.8%', trend: '+22%', trendDir: 'up', vs: '+22% vs last 30d', chart: true },
        { id: '2', title: 'Top Content', icon: 'star-outline', value: 'Summer Collection Reel', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Reach Growth', icon: 'bar-chart-outline', value: '12,450', trend: '+2,320', trendDir: 'up', vs: '+2,320 vs last 30d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Reel', stat: '8,200 views' },
        { id: '2', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Sneakers Post', stat: '5,850 likes' },
        { id: '3', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Handbag Story', stat: '2,320 shares' },
      ]
    },
    Traffic: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Mobile traffic increased by 40%' },
        { id: '2', icon: 'time-outline', text: 'Peak traffic hours: 6-8 PM' },
      ],
      charts: [
        { id: '1', title: 'Page Views', icon: 'trending-up-outline', value: '28,450', trend: '+18%', trendDir: 'up', vs: '+18% vs last 30d', chart: true },
        { id: '2', title: 'Top Source', icon: 'star-outline', value: 'Instagram', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Bounce Rate', icon: 'bar-chart-outline', value: '28%', trend: '-8%', trendDir: 'down', vs: '-8% vs last 30d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Home Page', stat: '8,100 views' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Products Page', stat: '6,850 views' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'About Page', stat: '2,450 views' },
      ]
    },
    Products: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Sneakers are your best seller' },
        { id: '2', icon: 'time-outline', text: 'Handbags have highest margin' },
      ],
      charts: [
        { id: '1', title: 'Units Sold', icon: 'trending-up-outline', value: '156', trend: '+24', trendDir: 'up', vs: '+24 vs last 30d', chart: true },
        { id: '2', title: 'Top Product', icon: 'star-outline', value: 'Classic Sneakers', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Average Order Value', icon: 'bar-chart-outline', value: '$89', trend: '+$8', trendDir: 'up', vs: '+$8 vs last 30d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Classic Sneakers', stat: '45 sold' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Leather Handbag', stat: '32 sold' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Dress', stat: '28 sold' },
      ]
    }
  },
  '90d': {
    Sales: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'This post brought 60% of sales' },
        { id: '2', icon: 'time-outline', text: 'Your best conversion time is 7-9 PM' },
      ],
      charts: [
        { id: '1', title: 'Revenue Over Time', icon: 'trending-up-outline', value: '$12,450', trend: '+25%', trendDir: 'up', vs: '+25% vs last 90d', chart: true },
        { id: '2', title: 'Best-Performing Post', icon: 'star-outline', value: 'Summer Collection Reel', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Product Conversion Rate', icon: 'bar-chart-outline', value: '15%', trend: '+3%', trendDir: 'up', vs: '+3% vs last 90d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Sneakers', stat: '$3,200' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Handbag', stat: '$2,400' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Reel', stat: '3,200 views' },
      ]
    },
    Content: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Video posts get 3x more engagement' },
        { id: '2', icon: 'time-outline', text: 'Best posting time is 2-4 PM' },
      ],
      charts: [
        { id: '1', title: 'Engagement Rate', icon: 'trending-up-outline', value: '7.2%', trend: '+35%', trendDir: 'up', vs: '+35% vs last 90d', chart: true },
        { id: '2', title: 'Top Content', icon: 'star-outline', value: 'Summer Collection Reel', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Reach Growth', icon: 'bar-chart-outline', value: '28,450', trend: '+8,320', trendDir: 'up', vs: '+8,320 vs last 90d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Reel', stat: '18,200 views' },
        { id: '2', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Sneakers Post', stat: '12,850 likes' },
        { id: '3', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Handbag Story', stat: '6,320 shares' },
      ]
    },
    Traffic: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Mobile traffic increased by 40%' },
        { id: '2', icon: 'time-outline', text: 'Peak traffic hours: 6-8 PM' },
      ],
      charts: [
        { id: '1', title: 'Page Views', icon: 'trending-up-outline', value: '78,450', trend: '+28%', trendDir: 'up', vs: '+28% vs last 90d', chart: true },
        { id: '2', title: 'Top Source', icon: 'star-outline', value: 'Instagram', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Bounce Rate', icon: 'bar-chart-outline', value: '22%', trend: '-12%', trendDir: 'down', vs: '-12% vs last 90d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Home Page', stat: '22,100 views' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Products Page', stat: '18,850 views' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'About Page', stat: '8,450 views' },
      ]
    },
    Products: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Sneakers are your best seller' },
        { id: '2', icon: 'time-outline', text: 'Handbags have highest margin' },
      ],
      charts: [
        { id: '1', title: 'Units Sold', icon: 'trending-up-outline', value: '456', trend: '+89', trendDir: 'up', vs: '+89 vs last 90d', chart: true },
        { id: '2', title: 'Top Product', icon: 'star-outline', value: 'Classic Sneakers', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Average Order Value', icon: 'bar-chart-outline', value: '$92', trend: '+$15', trendDir: 'up', vs: '+$15 vs last 90d', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Classic Sneakers', stat: '128 sold' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Leather Handbag', stat: '95 sold' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Dress', stat: '78 sold' },
      ]
    }
  },
  'All': {
    Sales: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'This post brought 60% of sales' },
        { id: '2', icon: 'time-outline', text: 'Your best conversion time is 7-9 PM' },
      ],
      charts: [
        { id: '1', title: 'Revenue Over Time', icon: 'trending-up-outline', value: '$28,450', trend: '+42%', trendDir: 'up', vs: '+42% vs last year', chart: true },
        { id: '2', title: 'Best-Performing Post', icon: 'star-outline', value: 'Summer Collection Reel', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Product Conversion Rate', icon: 'bar-chart-outline', value: '18%', trend: '+6%', trendDir: 'up', vs: '+6% vs last year', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Sneakers', stat: '$8,200' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Handbag', stat: '$6,400' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Reel', stat: '8,200 views' },
      ]
    },
    Content: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Video posts get 3x more engagement' },
        { id: '2', icon: 'time-outline', text: 'Best posting time is 2-4 PM' },
      ],
      charts: [
        { id: '1', title: 'Engagement Rate', icon: 'trending-up-outline', value: '9.8%', trend: '+58%', trendDir: 'up', vs: '+58% vs last year', chart: true },
        { id: '2', title: 'Top Content', icon: 'star-outline', value: 'Summer Collection Reel', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Reach Growth', icon: 'bar-chart-outline', value: '68,450', trend: '+18,320', trendDir: 'up', vs: '+18,320 vs last year', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Reel', stat: '38,200 views' },
        { id: '2', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Sneakers Post', stat: '25,850 likes' },
        { id: '3', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Handbag Story', stat: '12,320 shares' },
      ]
    },
    Traffic: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Mobile traffic increased by 40%' },
        { id: '2', icon: 'time-outline', text: 'Peak traffic hours: 6-8 PM' },
      ],
      charts: [
        { id: '1', title: 'Page Views', icon: 'trending-up-outline', value: '178,450', trend: '+48%', trendDir: 'up', vs: '+48% vs last year', chart: true },
        { id: '2', title: 'Top Source', icon: 'star-outline', value: 'Instagram', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Bounce Rate', icon: 'bar-chart-outline', value: '18%', trend: '-15%', trendDir: 'down', vs: '-15% vs last year', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Home Page', stat: '52,100 views' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Products Page', stat: '48,850 views' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'About Page', stat: '28,450 views' },
      ]
    },
    Products: {
      insights: [
        { id: '1', icon: 'bulb-outline', text: 'Sneakers are your best seller' },
        { id: '2', icon: 'time-outline', text: 'Handbags have highest margin' },
      ],
      charts: [
        { id: '1', title: 'Units Sold', icon: 'trending-up-outline', value: '1,256', trend: '+289', trendDir: 'up', vs: '+289 vs last year', chart: true },
        { id: '2', title: 'Top Product', icon: 'star-outline', value: 'Classic Sneakers', trend: '', trendDir: '', vs: '', chart: false },
        { id: '3', title: 'Average Order Value', icon: 'bar-chart-outline', value: '$98', trend: '+$22', trendDir: 'up', vs: '+$22 vs last year', chart: true },
      ],
      topPerformers: [
        { id: '1', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', label: 'Classic Sneakers', stat: '328 sold' },
        { id: '2', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', label: 'Leather Handbag', stat: '245 sold' },
        { id: '3', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', label: 'Summer Dress', stat: '198 sold' },
      ]
    }
  }
};

export default function AnalyticsScreen() {
  const [selectedTab, setSelectedTab] = useState('Sales');
  const [selectedFilter, setSelectedFilter] = useState('30d');
  const { createAnalyticsNotification } = useApp();

  // Get current analytics data based on selected filters
  const currentData = analyticsData[selectedFilter as keyof typeof analyticsData]?.[selectedTab as keyof typeof analyticsData['30d']] || analyticsData['30d'].Sales;

  const handleMilestoneNotification = async () => {
    try {
      await createAnalyticsNotification('Sales', 10000, 'month');
      console.log('Analytics milestone notification created!');
    } catch (error) {
      console.error('Error creating analytics notification:', error);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      {/* Time Range Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, selectedFilter === f && styles.filterChipActive]}
            onPress={() => setSelectedFilter(f)}
          >
            <Text style={[styles.filterChipText, selectedFilter === f && styles.filterChipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Tabs/Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Test Notification Button */}
      <View style={styles.testButtonContainer}>
        <TouchableOpacity style={styles.testButton} onPress={handleMilestoneNotification}>
          <Ionicons name="notifications-outline" size={16} color={colors.white} />
          <Text style={styles.testButtonText}>Test Sales Milestone Notification</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <View style={styles.insightsRow}>
          {currentData.insights.map(insight => (
            <View key={insight.id} style={styles.insightCard}>
              <View style={styles.insightIconRow}>
                <Ionicons name={insight.icon} size={icon.size} color={colors.primary} style={styles.insightIcon} />
                <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.insightText}>{insight.text}</Text>
              <TouchableOpacity><Text style={styles.learnMore}>Learn more</Text></TouchableOpacity>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Charts</Text>
        <View style={styles.chartsRow}>
          {currentData.charts.map(chart => (
            <View key={chart.id} style={styles.chartCard}>
              <View style={styles.chartIconRow}>
                <Ionicons name={chart.icon} size={icon.size} color={colors.secondary} style={styles.chartIcon} />
                <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.chartTitle}>{chart.title}</Text>
              {chart.chart && (
                <View style={styles.miniChartPlaceholder}>
                  <Ionicons name="stats-chart-outline" size={24} color={colors.secondary} />
                </View>
              )}
              <View style={styles.chartValueRow}>
                <Text style={styles.chartValue}>{chart.value}</Text>
                {chart.trend && (
                  <View style={styles.trendRow}>
                    <Ionicons name={chart.trendDir === 'up' ? 'arrow-up' : 'arrow-down'} size={14} color={chart.trendDir === 'up' ? 'green' : 'red'} style={{ marginLeft: 4 }} />
                    <Text style={[styles.trendText, { color: chart.trendDir === 'up' ? 'green' : 'red' }]}>{chart.trend}</Text>
                  </View>
                )}
              </View>
              {chart.vs && <Text style={styles.vsText}>{chart.vs}</Text>}
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Top Performers</Text>
        <View style={styles.topRow}>
          {currentData.topPerformers.map(item => (
            <View key={item.id} style={styles.topCard}>
              <Image source={{ uri: item.img }} style={styles.topImg} />
              <Text style={styles.topLabel}>{item.label}</Text>
              <Text style={styles.topStat}>{item.stat}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterScroll: {
    marginTop: spacing.m,
    marginBottom: spacing.s,
    paddingHorizontal: spacing.m,
  },
  filterChip: {
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingHorizontal: verticalScale(12),
    paddingVertical: verticalScale(4),
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.card,
  },
  filterChipActive: {
    backgroundColor: colors.primary + '33',
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: scale(13),
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
  },
  tab: {
    paddingVertical: verticalScale(6),
    paddingHorizontal: moderateScale(18),
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: colors.primary + '33',
  },
  tabText: {
    fontSize: scale(15),
    fontWeight: '500',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.s,
  },
  insightsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  insightCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginRight: spacing.s,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.floating,
  },
  insightIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  insightIcon: {
    marginBottom: 4,
  },
  insightText: {
    fontSize: scale(14),
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  learnMore: {
    color: colors.secondary,
    fontSize: scale(12),
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  chartsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  chartCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginRight: spacing.s,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.floating,
  },
  chartIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartIcon: {
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: scale(14),
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  chartValue: {
    fontSize: scale(16),
    color: colors.primary,
    fontWeight: 'bold',
  },
  miniChartPlaceholder: {
    width: '100%',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  chartValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  trendText: {
    fontSize: scale(13),
    fontWeight: 'bold',
  },
  vsText: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginTop: 2,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  topCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginRight: spacing.s,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.floating,
  },
  topImg: {
    width: 48,
    height: 48,
    borderRadius: radii.medium,
    marginBottom: 4,
  },
  topLabel: {
    fontSize: scale(14),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 2,
  },
  topStat: {
    fontSize: scale(15),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.secondary,
  },
  testButtonContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.m,
    right: spacing.m,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...shadows.floating,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: colors.white,
    fontSize: scale(14),
    fontWeight: '500',
    marginLeft: spacing.s,
  },
}); 