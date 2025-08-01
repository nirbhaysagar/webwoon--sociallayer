// iOS-style design system for SocialSpark with typewriter fonts

// iOS-style color palette
export const colors = {
  // Primary iOS colors
  primary: '#007AFF', // iOS system blue
  secondary: '#5856D6', // iOS system purple
  success: '#34C759', // iOS system green
  warning: '#FF9500', // iOS system orange
  error: '#FF3B30', // iOS system red
  info: '#5AC8FA', // iOS system teal
  
  // Additional iOS colors
  purple: '#AF52DE',
  orange: '#FF9500',
  pink: '#FF2D92',
  teal: '#5AC8FA',
  indigo: '#5856D6',
  
  // Background colors
  background: '#F9F9F9', // iOS gray 50
  card: '#FFFFFF',
  white: '#FFFFFF', // Added missing white color
  
  // Text colors
  text: '#1C1C1E', // iOS gray 900
  textSecondary: '#8E8E93', // iOS gray 600
  textTertiary: '#AEAEB2', // iOS gray 500
  
  // Border and disabled
  border: '#E5E5EA', // iOS gray 200
  disabled: '#C7C7CC', // iOS gray 400
  
  // Special colors
  discount: '#FF3B30', // Using error red for discounts
  favorite: '#FF2D92', // Using pink for favorites
  rating: '#FF9500', // Using orange for ratings
  
  // Additional colors for consistency
  primaryDark: '#0056CC', // Darker primary for buttons
  primaryLight: '#E3F2FD', // Lighter primary for backgrounds
  
  // Gray scale for consistent usage
  gray: {
    50: '#F9F9F9',
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#C7C7CC',
    500: '#AEAEB2',
    600: '#8E8E93',
    700: '#636366',
    800: '#48484A',
    900: '#1C1C1E',
  },
  
  shadow: 'rgba(0,0,0,0.08)',
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 24,
  pill: 999,
  circle: 999, // Added missing circle radius
  m: 12, // Added missing m property (alias for medium)
};

// Typewriter-style typography system
export const typography = {
  fontFamily: 'monospace',
  
  // iOS-style typography with typewriter fonts
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: 0.37,
    fontFamily: 'monospace',
  },
  title1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: 0.36,
    fontFamily: 'monospace',
  },
  title2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.35,
    fontFamily: 'monospace',
  },
  title3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.38,
    fontFamily: 'monospace',
  },
  headline: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.41,
    fontFamily: 'monospace',
  },
  body: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: -0.41,
    fontFamily: 'monospace',
  },
  callout: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.32,
    fontFamily: 'monospace',
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.24,
    fontFamily: 'monospace',
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.08,
    fontFamily: 'monospace',
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0,
    fontFamily: 'monospace',
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 13,
    letterSpacing: 0.07,
    fontFamily: 'monospace',
  },
  
  // Special typewriter styles for data
  dataValue: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  largeDataValue: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: 0.6,
    fontFamily: 'monospace',
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: 0.2,
    fontFamily: 'monospace',
  },
  
  // Legacy support
  title: 24,
  subtitle: 18,
  bodySize: 16,
  caption: 13,
  weightRegular: '400',
  weightMedium: '500',
  weightBold: '700',
  
  // Additional typography for consistency
  h2: 20, // Added missing h2
  
  // Individual properties for direct use
  bodyFontSize: 17,
  bodyFontWeight: '400',
  bodyLineHeight: 22,
  bodyLetterSpacing: -0.41,
  
  subheadlineFontSize: 15,
  subheadlineFontWeight: '400',
  subheadlineLineHeight: 20,
  subheadlineLetterSpacing: -0.24,
  
  caption1FontSize: 12,
  caption1FontWeight: '400',
  caption1LineHeight: 16,
  caption1LetterSpacing: 0,
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  subtle: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  button: { // Added missing button shadow
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const button = {
  height: 48,
  borderRadius: radii.medium,
  fontSize: 16,
  fontWeight: '600',
  paddingHorizontal: spacing.l,
  fontFamily: 'monospace',
};

export const chip = {
  height: 32,
  borderRadius: radii.pill,
  fontSize: 15,
  fontWeight: '500',
  paddingHorizontal: spacing.m,
  fontFamily: 'monospace',
};

export const icon = {
  size: 24,
  large: 32,
  small: 18,
}; 