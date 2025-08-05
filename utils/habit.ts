export const isHabitCompleted = (habitId: string, completedHabits: string[]) =>
  completedHabits.includes(habitId);
