import { User } from '../types';

export const isContentLocked = (user: User, weekId: number, lessonDay: number): boolean => {
  if (user.role === 'admin' || user.role === 'premium') return false;
  if (weekId === 1 && lessonDay <= 3) return false;
  return true;
};
