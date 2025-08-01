import { type Models } from "react-native-appwrite";

export interface Habit extends Models.Document {
  user_id: string;
  title: string;
  description: string;
  frequency: string;
  streak_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface HabitCompletion extends Models.Document {
  user_id: string;
  habit_id: string;
  completed_at: Date;
}
