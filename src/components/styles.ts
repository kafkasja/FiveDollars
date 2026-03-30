import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    color: COLORS.text,
  },
  textSecondary: {
    color: COLORS.textSecondary,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
  textDim: {
    color: COLORS.textDim,
  },
  primary: {
    color: COLORS.primary,
  },
});

export const headerStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  name: {
    fontSize: FONT_SIZES.title,
    fontWeight: '700',
    color: COLORS.text,
  },
  switchButton: {
    padding: SPACING.sm,
  },
  switchText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
});

export const balanceCardStyles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.lg,
  },
  settledContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  settledEmoji: {
    fontSize: 40,
  },
  settledTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  settledSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDim,
    marginTop: SPACING.xs,
  },
  balanceContainer: {
    alignItems: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  profileEmoji: {
    fontSize: 30,
  },
  profileName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  owesText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
  },
  amount: {
    fontSize: FONT_SIZES.huge,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.sm,
    letterSpacing: -1,
  },
});

export const paymentSectionStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    marginTop: 32,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.lg,
  },
  row: {
    marginBottom: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: FONT_SIZES.lg,
  },
  buttonSubtext: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.sm,
    marginTop: 3,
  },
});

export const transactionsStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    marginTop: 32,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  emoji: {
    fontSize: 20,
  },
  arrow: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  itemDetails: {},
  itemNames: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  itemTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  itemAmount: {
    fontWeight: '700',
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
  },
});

export const profilePickerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xxl,
    paddingTop: 80,
  },
  title: {
    fontSize: FONT_SIZES.large,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xxxl,
  },
  cube: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cubeEmoji: {
    fontSize: 36,
  },
  cubeName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    marginTop: 10,
    letterSpacing: 0.3,
  },
});
