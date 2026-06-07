import { StyleSheet, Text } from 'react-native'

interface BadgeProps {
  label: string
  variant?: 'blue' | 'green' | 'gray'
}

export function Badge({ label, variant = 'gray' }: BadgeProps) {
  return <Text style={[styles.base, styles[variant]]}>{label}</Text>
}

const styles = StyleSheet.create({
  base: { fontSize: 11, fontWeight: '500', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  blue: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  green: { backgroundColor: '#dcfce7', color: '#15803d' },
  gray: { backgroundColor: '#f3f4f6', color: '#4b5563' },
})
