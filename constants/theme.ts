export const Colors = {
  primary: '#111111',
  primaryLight: '#333333',
  secondary: '#FFFFFF',
  accent: '#E31837',
  accentLight: '#FF4D64',
  background: '#F7F7F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFAFA',
  border: '#E8E8E8',
  borderLight: '#F0F0F0',
  textPrimary: '#111111',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  success: '#00A36C',
  successLight: '#E8F7F2',
  warning: '#FF9500',
  warningLight: '#FFF4E6',
  error: '#E31837',
  errorLight: '#FFE8EC',
  overlay: 'rgba(0,0,0,0.5)',
  shimmer: '#E8E8E8',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  displayLarge: { fontSize: 32, fontWeight: '800' as const, lineHeight: 38 },
  displayMedium: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  headingLarge: { fontSize: 24, fontWeight: '700' as const, lineHeight: 29 },
  headingMedium: { fontSize: 20, fontWeight: '700' as const, lineHeight: 24 },
  headingSmall: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  labelLarge: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  labelMedium: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
  labelSmall: { fontSize: 10, fontWeight: '600' as const, lineHeight: 14 },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
};
