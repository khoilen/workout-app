import { Habit } from "@/types/database.type";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { styles } from "./styles";

type Props = {
  rankedHabits: {
    habit: Habit;
    streak: number;
    bestStreak: number;
    total: number;
  }[];
};

export const TopHabit = ({ rankedHabits }: Props) => {
  const badgeStyles = [styles.badge1, styles.badge2, styles.badge3];

  return (
    <View style={styles.rankingContainer}>
      <Text style={styles.rankingTitle}>🥇 Top Streaks</Text>
      {rankedHabits.slice(0, 3).map((item, key) => (
        <View key={key} style={styles.rankingRow}>
          <View style={[styles.rankingBadge, badgeStyles[key]]}>
            <Text style={styles.rankingBadgeText}> {key + 1} </Text>
          </View>
          <Text style={styles.rankingHabit}> {item.habit.title}</Text>
          <Text style={styles.rankingStreak}> {item.bestStreak}</Text>
        </View>
      ))}
    </View>
  );
};
