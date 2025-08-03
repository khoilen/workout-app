import {
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
} from "@/libs/appwrite";
import { useAuth } from "@/libs/auth-content";
import { Habit, HabitCompletion } from "@/types/database.type";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Card, Text } from "react-native-paper";

interface StreaksData {
  streak: number;
  bestStreak: number;
  total: number;
}

export default function Streaks() {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchCompletions();
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );

      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.error("Error fetching habits:", error);
    }
  };

  const fetchCompletions = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      const completions = response.documents as HabitCompletion[];
      setCompletedHabits(completions);
    } catch (error) {
      console.error("Error fetching habits:", error);
    }
  };

  const getStreakCount = (habitId: string): StreaksData => {
    const habitCompletions = completedHabits
      .filter((completion) => completion.habit_id === habitId)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    if (habitCompletions.length === 0)
      return {
        streak: 0,
        bestStreak: 0,
        total: 0,
      };

    let streak = 0;
    let bestStreak = 0;
    let total = habitCompletions.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    habitCompletions.forEach((completion) => {
      const date = new Date(completion.completed_at);
      if (lastDate) {
        const diffDays =
          (date.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        if (currentStreak > bestStreak) bestStreak = currentStreak;

        streak = currentStreak;
        lastDate = date;
      }
    });

    return {
      streak,
      bestStreak,
      total,
    };
  };

  const habitStreaks = habits.map((habit) => {
    const streakData = getStreakCount(habit.$id);
    return {
      habit,
      streak: streakData.streak,
      bestStreak: streakData.bestStreak,
      total: streakData.total,
    };
  });

  const rankedHabits = habitStreaks.sort((a, b) => b.bestStreak - a.bestStreak);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habit streaks</Text>
      {habitStreaks.length === 0 ? (
        <View>
          <Text>No habits found</Text>
        </View>
      ) : (
        rankedHabits.map(({ habit, streak, bestStreak, total }, key) => (
          <Card
            key={habit.$id}
            style={[styles.card, key === 0 && styles.firstCard]}
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
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    marginBottom: 18,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  firstCard: {
    borderWidth: 2,
    borderColor: "#7c4dff",
  },
  habitTitle: {
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 18,
  },
  habitDescription: {
    marginBottom: 8,
    color: "#6c6c80",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  statBadge: {
    backgroundColor: "#fff3e0",
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  statBadgeGold: {
    backgroundColor: "#fffde7",
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  statBadgeGreen: {
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  statBadgeText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#22223b",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    fontWeight: "500",
  },
});
