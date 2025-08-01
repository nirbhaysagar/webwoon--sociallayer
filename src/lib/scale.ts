import { Dimensions, PixelRatio } from 'react-native';

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 375; // iPhone 11 Pro
const guidelineBaseHeight = 812;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Usage:
// import { scale, verticalScale, moderateScale } from '../lib/scale';
// fontSize: scale(16),
// padding: verticalScale(12),
// width: scale(200) 