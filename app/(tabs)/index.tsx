import {
  completeHabit,
  deleteHabit,
  loadHabitByUserId,
  loadTodayCompletions,
  updateHabit,
} from "@/api/habit";
import { EmptyHabit } from "@/components/empty-habit";
import { HabitItem } from "@/components/habit-item";
import {
  client,
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  HABITS_COLLECTION_ID,
  RealtimeResponse,
} from "@/libs/appwrite";
import { useAuth } from "@/libs/auth-content";
import { Habit, HabitCompletion } from "@/types/database.type";
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Text } from "react-native-paper";

export default function Index() {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

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
            fetchTodayCompletions();
          }
        }
      );

      fetchHabits();
      fetchTodayCompletions();

      return () => {
        habitsSubscription();
        completionsSubscription();
      };
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      const response = await loadHabitByUserId(user?.$id ?? "");

      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.error("Error fetching habits:", error);
    }
  };

  const fetchTodayCompletions = async () => {
    try {
      const response = await loadTodayCompletions(user?.$id ?? "");
      setCompletedHabits(
        (response.documents as HabitCompletion[]).map((c) => c.habit_id)
      );
    } catch (error) {
      console.error("Error fetching habits:", error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    if (!user || completedHabits.includes(habitId)) return;

    try {
      const currentDate = new Date().toISOString();

      await completeHabit(user?.$id ?? "", habitId, currentDate);

      const habit = habits.find((h) => h.$id === habitId);

      if (!habit) return;

      await updateHabit(habitId, habit.streak_count + 1, currentDate);

      Alert.alert("✅ Success", "Habit marked as completed!");
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const confirmDeleteHabit = (habitId: string) => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            swipeableRefs.current[habitId]?.close();
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            handleDeleteHabit(habitId);
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Today habits
        </Text>
        <Button mode="text" onPress={signOut} icon="logout">
          Signout
        </Button>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <EmptyHabit />
        ) : (
          <View>
            {habits.map((habit, key) => (
              <HabitItem
                key={String(key)}
                habit={habit}
                swipeableRefs={swipeableRefs}
                confirmDeleteHabit={confirmDeleteHabit}
                handleCompleteHabit={handleCompleteHabit}
                completedHabits={completedHabits}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
  },
  navButton: {
    width: 100,
    height: 20,
    backgroundColor: "coral",
    borderRadius: 8,
    textAlign: "center",
  },
});
