import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View, type TextInputProps, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "@/lib/theme";

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.screen}>{children}</View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: ViewProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor="#64748b" style={styles.field} {...props} />;
}

export function Button({ title, onPress, loading, secondary }: { title: string; onPress?: () => void; loading?: boolean; secondary?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={loading} style={({ pressed }) => [styles.button, secondary && styles.secondaryButton, pressed && { transform: [{ scale: 0.98 }] }]}>
      {loading ? <ActivityIndicator color={secondary ? colors.text : colors.ink} /> : <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text>}
    </Pressable>
  );
}

export function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
    padding: 18,
    gap: 14,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  keyboard: {
    flex: 1,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  label: {
    color: colors.neon,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    backgroundColor: "#080d1d",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  button: {
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: colors.neon,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
  },
  buttonText: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 15,
  },
  secondaryButtonText: {
    color: colors.text,
  },
  error: {
    color: colors.danger,
    fontWeight: "700",
  },
});
