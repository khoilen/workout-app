import { View } from "react-native";
import { Button, SegmentedButtons, TextInput } from "react-native-paper";

const FREQUENCY_OPTIONS = ["daily", "weekly", "monthly"];

export default function AddHabit() {
  return (
    <View>
      <TextInput label="Title" mode="outlined" />
      <TextInput label="Description" mode="outlined" />
      <View>
        <SegmentedButtons
          buttons={FREQUENCY_OPTIONS.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
        />
      </View>
      <Button mode="contained">Add Habit</Button>
    </View>
  );
}
