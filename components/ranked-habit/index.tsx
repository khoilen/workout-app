import { Habit } from "@/types/database.type";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";
import { styles } from "./styles";

type Props = {
  habit: Habit;
  index: number;
  streak: number;
  bestStreak: number;
  total: number;
};

export const RankedHabit = ({
  habit,
  streak,
  bestStreak,
  index,
  total,
}: Props) => {
  return (
    <Card
      key={habit.$id}
      style={[styles.card, index === 0 && styles.firstCard]}
    >
      <Card.Content style={styles.habitTitle}>
        <Text variant="titleMedium" style={styles.habitTitle}>
          {habit.title}
        </Text>
        <Text style={styles.habitDescription}>{habit.description}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statBadgeText}>🔥 {streak}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={styles.statBadgeGold}>
            <Text style={styles.statBadgeText}>🏆 {bestStreak}</Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
          <View style={styles.statBadgeGreen}>
            <Text style={styles.statBadgeText}>✅ {total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};
