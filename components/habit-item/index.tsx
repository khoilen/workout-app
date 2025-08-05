import { Habit as HabitModel } from "@/types/database.type";
import { isHabitCompleted } from "@/utils/habit";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Surface, Text } from "react-native-paper";
import { styles } from "./styles";

type Props = {
  habit: HabitModel;
  swipeableRefs: React.MutableRefObject<{ [key: string]: Swipeable | null }>;
  confirmDeleteHabit: (habitId: string) => void;
  handleCompleteHabit: (habitId: string) => void;
  key: string;
  completedHabits: string[];
};

export const HabitItem = ({
  habit,
  swipeableRefs,
  confirmDeleteHabit,
  handleCompleteHabit,
  completedHabits,
}: Props) => {
  return (
    <Swipeable
      ref={(ref) => {
        swipeableRefs.current[habit.$id] = ref;
      }}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={() => (
        <View style={styles.swipeActionLeft}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={32}
            color="#ffff"
          />
        </View>
      )}
      renderRightActions={() => (
        <View style={styles.swipeActionRight}>
          {isHabitCompleted(habit.$id, completedHabits) ? (
            <Text style={{ color: "#ffff" }}>Completed!</Text>
          ) : (
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={32}
              color="#ffff"
            />
          )}
        </View>
      )}
      onSwipeableOpen={(direction) => {
        if (direction === "left") {
          confirmDeleteHabit(habit.$id);
        } else if (direction === "right") {
          handleCompleteHabit(habit.$id);
        }

        swipeableRefs.current[habit.$id]?.close();
      }}
    >
      <Surface
        style={[
          styles.card,
          isHabitCompleted(habit.$id, completedHabits) && styles.cardCompleted,
        ]}
        key={habit.$id}
        elevation={0}
      >
        <View key={habit.$id} style={styles.cardContent}>
          <Text style={styles.cardTitle}>{habit.title}</Text>
          <Text style={styles.cardDescription}>{habit.description}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons name="fire" size={18} color={"#ff9800"} />
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
  );
};
