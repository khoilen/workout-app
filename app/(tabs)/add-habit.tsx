import { createHabit } from "@/api/habit";
import { useAuth } from "@/libs/auth-content";
import { Frequency, FREQUENCY_OPTIONS } from "@/types/frequency";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function AddHabit() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const resetState = () => {
    setTitle("");
    setDescription("");
    setFrequency("daily");
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      if (!user) return;

      createHabit(user, {
        title,
        description,
        frequency,
      }).then(() => {
        resetState();
        router.back();
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }

      setError("An unexpected error occurred while adding the habit.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Title"
        style={styles.input}
        onChangeText={setTitle}
        value={title}
        mode="outlined"
      />
      <TextInput
        label="Description"
        style={styles.input}
        onChangeText={setDescription}
        value={description}
        mode="outlined"
      />
      <View style={styles.frequencyContainer}>
        <SegmentedButtons
          value={frequency}
          onValueChange={(value) => setFrequency(value as Frequency)}
          buttons={FREQUENCY_OPTIONS.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
        />
      </View>
      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={!title || !description}
      >
        Add Habit
      </Button>
      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
  },
  frequencyContainer: {
    marginBottom: 24,
  },
});
