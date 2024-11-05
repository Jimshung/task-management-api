export interface TodoItem {
  id: number;
  content: string;
  todoId: number;
  is_completed: boolean;
  completed_at: string | null;
}
