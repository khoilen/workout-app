import { DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/libs/appwrite";
import { Frequency } from "@/types/frequency";
import { ID, Models } from "react-native-appwrite";

export const createHabit = (
  user: Models.User<Models.Preferences>,
  payload: {
    title: string;
    description: string;
    frequency: Frequency;
  }
) => {
  return databases.createDocument(
    DATABASE_ID,
    HABITS_COLLECTION_ID,
    ID.unique(),
    {
      user_id: user.$id,
      ...payload,
      streak_count: 0,
      last_completed: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
  );
};
