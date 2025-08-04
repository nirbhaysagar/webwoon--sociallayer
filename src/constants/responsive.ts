import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints for responsive design
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1440,
};

// Screen size detection
export const isMobile = width < breakpoints.tablet;
export const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
export const isDesktop = width >= breakpoints.desktop;
export const isLargeDesktop = width >= breakpoints.largeDesktop;

// Responsive spacing
export const responsiveSpacing = {
  xs: isMobile ? 4 : 8,
  sm: isMobile ? 8 : 12,
  md: isMobile ? 16 : 24,
  lg: isMobile ? 24 : 32,
  xl: isMobile ? 32 : 48,
  xxl: isMobile ? 48 : 64,
};

// Responsive typography
export const responsiveTypography = {
  h1: {
    fontSize: isMobile ? 24 : 32,
    lineHeight: isMobile ? 32 : 40,
  },
  h2: {
    fontSize: isMobile ? 20 : 28,
    lineHeight: isMobile ? 28 : 36,
  },
  h3: {
    fontSize: isMobile ? 18 : 24,
    lineHeight: isMobile ? 24 : 32,
  },
  body: {
    fontSize: isMobile ? 16 : 18,
    lineHeight: isMobile ? 24 : 28,
  },
  caption: {
    fontSize: isMobile ? 14 : 16,
    lineHeight: isMobile ? 20 : 24,
  },
};

// Responsive layout
export const responsiveLayout = {
  container: {
    paddingHorizontal: isMobile ? 16 : 24,
    maxWidth: isDesktop ? 1200 : '100%',
    marginHorizontal: isDesktop ? 'auto' : 0,
  },
  card: {
    borderRadius: isMobile ? 8 : 12,
    padding: isMobile ? 16 : 24,
    margin: isMobile ? 8 : 12,
  },
  button: {
    height: isMobile ? 48 : 56,
    paddingHorizontal: isMobile ? 16 : 24,
    borderRadius: isMobile ? 8 : 12,
  },
};

// Grid system
export const grid = {
  columns: isMobile ? 1 : isTablet ? 2 : 3,
  gap: isMobile ? 16 : 24,
};

// Navigation responsive
export const responsiveNavigation = {
  drawerWidth: isMobile ? 280 : 320,
  headerHeight: isMobile ? 56 : 64,
  tabBarHeight: isMobile ? 60 : 80,
};

// Form responsive
export const responsiveForm = {
  inputHeight: isMobile ? 48 : 56,
  inputPadding: isMobile ? 12 : 16,
  labelFontSize: isMobile ? 14 : 16,
};

// Modal responsive
export const responsiveModal = {
  width: isMobile ? '90%' : '60%',
  maxWidth: isDesktop ? 600 : '90%',
  borderRadius: isMobile ? 12 : 16,
};

// List responsive
export const responsiveList = {
  itemHeight: isMobile ? 60 : 80,
  itemPadding: isMobile ? 12 : 16,
  separatorHeight: isMobile ? 1 : 2,
};

// Image responsive
export const responsiveImage = {
  productCard: {
    width: isMobile ? 120 : 160,
    height: isMobile ? 120 : 160,
    borderRadius: isMobile ? 8 : 12,
  },
  avatar: {
    width: isMobile ? 40 : 56,
    height: isMobile ? 40 : 56,
    borderRadius: isMobile ? 20 : 28,
  },
  thumbnail: {
    width: isMobile ? 60 : 80,
    height: isMobile ? 60 : 80,
    borderRadius: isMobile ? 8 : 12,
  },
};

// Utility functions
export const getResponsiveValue = (mobile: any, tablet: any, desktop: any) => {
  if (isMobile) return mobile;
  if (isTablet) return tablet;
  return desktop;
};

export const getResponsiveSpacing = (size: keyof typeof responsiveSpacing) => {
  return responsiveSpacing[size];
};

export const getResponsiveTypography = (type: keyof typeof responsiveTypography) => {
  return responsiveTypography[type];
}; 