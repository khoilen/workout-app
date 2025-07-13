import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link
        href="/login"
        style={{
          width: 100,
          height: 20,
          backgroundColor: "coral",
          borderRadius: 8,
          textAlign: "center",
        }}
      >
        Login Page
      </Link>
    </View>
  );
}
