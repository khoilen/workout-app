import { EmptyHabit } from "@/components/empty-habit";
import { RankedHabit } from "@/components/ranked-habit";
import { TopHabit } from "@/components/top-habit";
import {
  client,
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
  RealtimeResponse,
} from "@/libs/appwrite";
import { useAuth } from "@/libs/auth-content";
import { Habit, HabitCompletion } from "@/types/database.type";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "react-native-paper";

interface StreaksData {
  streak: number;
  bestStreak: number;
  total: number;
}

export default function Streaks() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);

  useEffect(() => {
    if (user) {
      const habitsChannel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`;
      const habitsSubscription = client.subscribe(
        habitsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            fetchHabits();
          }
        }
      );

      const completionsChannel = `databases.${DATABASE_ID}.collections.${COMPLETIONS_COLLECTION_ID}.documents`;
      const completionsSubscription = client.subscribe(
        completionsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchCompletions();
          }
        }
      );

      fetchHabits();
      fetchCompletions();

      return () => {
        habitsSubscription();
        completionsSubscription();
      };
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
        currentStreak = 1;
      }

      if (currentStreak > bestStreak) bestStreak = currentStreak;

      streak = currentStreak;
      lastDate = date;
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
      <Text style={styles.title} variant="headlineSmall">
        Habit streaks
      </Text>

      {rankedHabits.length > 0 && <TopHabit rankedHabits={rankedHabits} />}

      {habitStreaks.length === 0 ? (
        <EmptyHabit />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
        >
          {rankedHabits.map(({ habit, streak, bestStreak, total }, key) => (
            <RankedHabit
              key={key}
              index={key}
              habit={habit}
              streak={streak}
              bestStreak={bestStreak}
              total={total}
            />
          ))}
        </ScrollView>
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
});
