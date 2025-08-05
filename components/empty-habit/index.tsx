import { Text, View } from "react-native";

export const EmptyHabit = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 18,
          color: "#6c6c80",
        }}
      >
        No habits found
      </Text>
    </View>
  );
};
