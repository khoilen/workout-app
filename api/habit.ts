import {
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
} from "@/libs/appwrite";
import { Frequency } from "@/types/frequency";
import { ID, Models, Query } from "react-native-appwrite";

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

export const loadHabitByUserId = async (userId: string) => {
  return databases.listDocuments(DATABASE_ID, HABITS_COLLECTION_ID, [
    Query.equal("user_id", userId),
  ]);
};

export const loadTodayCompletions = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return databases.listDocuments(DATABASE_ID, COMPLETIONS_COLLECTION_ID, [
    Query.equal("user_id", userId),
    Query.greaterThanEqual("completed_at", today.toISOString()),
  ]);
};

export const deleteHabit = async (habitId: string) =>
  databases.deleteDocument(DATABASE_ID, HABITS_COLLECTION_ID, habitId);

export const completeHabit = async (
  userId: string,
  habitId: string,
  currentDate: string
) =>
  databases.createDocument(
    DATABASE_ID,
    COMPLETIONS_COLLECTION_ID,
    ID.unique(),
    {
      user_id: userId,
      habit_id: habitId,
      completed_at: currentDate,
    }
  );

export const updateHabit = async (
  habitId: string,
  streak_count: number,
  currentDate: string
) =>
  databases.updateDocument(DATABASE_ID, HABITS_COLLECTION_ID, habitId, {
    streak_count: streak_count,
    last_completed: currentDate,
  });
