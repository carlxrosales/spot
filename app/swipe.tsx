import { AbsoluteView } from "@/components/common/AbsoluteView";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { Logo } from "@/components/common/Logo";
import { SafeView } from "@/components/common/SafeView";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Swipe() {
  const router = useRouter();

  return (
    <SafeView style={styles.container}>
      <AnimatedBackground />
      <AbsoluteView top={Spacing.lg} style={styles.logoContainer}>
        <Logo />
      </AbsoluteView>
      <AbsoluteView top={Spacing.lg * 2 + 40} left={Spacing.lg}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </AbsoluteView>
      <View style={styles.content}>
        <Text style={styles.title}>Swipe Page</Text>
        <Text style={styles.subtitle}>Your spots will appear here</Text>
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neonGreen,
  },
  logoContainer: {
    left: 0,
    right: 0,
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  title: {
    fontSize: Fonts.size.lg,
    color: Colors.black,
    fontFamily: Fonts.family.groen,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Fonts.size.sm,
    color: Colors.black,
    fontFamily: Fonts.family.groen,
    opacity: 0.7,
  },
  backText: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.bold,
    color: Colors.black,
  },
});
