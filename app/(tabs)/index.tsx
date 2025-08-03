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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

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

  const fetchTodayCompletions = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ]
      );
      const completions = response.documents as HabitCompletion[];
      setCompletedHabits(completions.map((c) => c.habit_id));
    } catch (error) {
      console.error("Error fetching habits:", error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitId
      );
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    if (!user || completedHabits.includes(habitId)) return;

    try {
      const currentDate = new Date().toISOString();

      await databases.createDocument(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user?.$id ?? "",
          habit_id: habitId,
          completed_at: currentDate,
        }
      );

      const habit = habits.find((h) => h.$id === habitId);
      if (!habit) return;

      await databases.updateDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitId,
        {
          streak_count: habit.streak_count + 1,
          last_completed: currentDate,
        }
      );
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const renderLeftActions = () => {
    return (
      <View style={styles.swipeActionLeft}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={32}
          color="#ffff"
        />
      </View>
    );
  };

  const renderRightActions = (habitId: string) => {
    return (
      <View style={styles.swipeActionRight}>
        {isHabitCompleted(habitId) ? (
          <Text style={{ color: "#ffff" }}>Completed!</Text>
        ) : (
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={32}
            color="#ffff"
          />
        )}
      </View>
    );
  };

  const isHabitCompleted = (habitId: string) =>
    completedHabits.includes(habitId);

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
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits found</Text>
          </View>
        ) : (
          <View>
            {habits.map((habit, key) => (
              <Swipeable
                ref={(ref) => {
                  swipeableRefs.current[habit.$id] = ref;
                }}
                key={key}
                overshootLeft={false}
                overshootRight={false}
                renderLeftActions={renderLeftActions}
                renderRightActions={() => renderRightActions(habit.$id)}
                onSwipeableOpen={(direction) => {
                  if (direction === "left") {
                    handleDeleteHabit(habit.$id);
                  } else if (direction === "right") {
                    handleCompleteHabit(habit.$id);
                  }

                  swipeableRefs.current[habit.$id]?.close();
                }}
              >
                <Surface
                  style={[
                    styles.card,
                    isHabitCompleted(habit.$id) && styles.cardCompleted,
                  ]}
                  key={habit.$id}
                  elevation={0}
                >
                  <View key={habit.$id} style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{habit.title}</Text>
                    <Text style={styles.cardDescription}>
                      {habit.description}
                    </Text>
                    <View style={styles.cardFooter}>
                      <View style={styles.streakBadge}>
                        <MaterialCommunityIcons
                          name="fire"
                          size={18}
                          color={"#ff9800"}
                        />
                        <Text style={styles.streakText}>
                          {habit.streak_count} day streak
                        </Text>
                      </View>
                      <View style={styles.frequencyBadge}>
                        <Text style={styles.frequencyText}>
                          {habit.frequency.charAt(0).toUpperCase() +
                            habit.frequency.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Surface>
              </Swipeable>
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
  card: {
    marginBottom: 18,
    padding: 18,
    backgroundColor: "#f7f7fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 8,
  },
  cardCompleted: {
    opacity: 0.5,
  },
  cardContent: {
    padding: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#6c6c80",
  },
  cardDescription: {
    fontSize: 15,
    color: "#6c6c80",
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    fontSize: 14,
    color: "#ff9800",
    fontWeight: "bold",
  },
  frequencyBadge: {
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  frequencyText: {
    fontSize: 14,
    color: "#7c4dff",
    fontWeight: "bold",
  },
  navButton: {
    width: 100,
    height: 20,
    backgroundColor: "coral",
    borderRadius: 8,
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#6c6c80",
  },
  swipeActionLeft: {
    backgroundColor: "#e53935",
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    borderRadius: 18,
    marginBottom: 18,
    paddingLeft: 16,
    marginTop: 2,
  },
  swipeActionRight: {
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    borderRadius: 18,
    marginBottom: 18,
    paddingRight: 16,
    marginTop: 2,
  },
});
