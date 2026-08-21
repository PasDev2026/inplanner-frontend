import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TASK_KEY, DASHBOARD_TASKS_ALL, TASK_CHILDREN_ALL } from "@/features/tasks/lib/task-keys"
import { PROJECTS_KEY, PROJECT_TASKS_ALL } from "@/features/projects/lib/project-keys"
import { createNote, updateNote, deleteNote } from "@/features/notes/actions/note.api"
import { toast } from "sonner"

export function useNotes(taskId: number) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: TASK_KEY(String(taskId)) })
    queryClient.invalidateQueries({ queryKey: PROJECT_TASKS_ALL })
    queryClient.invalidateQueries({ queryKey: PROJECTS_KEY })
    queryClient.invalidateQueries({ queryKey: DASHBOARD_TASKS_ALL })
    queryClient.invalidateQueries({ queryKey: TASK_CHILDREN_ALL })
  }

  const createNoteMutation = useMutation({
    mutationFn: (content: string) => createNote({ content, task_id: taskId }),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error((error as Error).message)
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, content }: { noteId: number; content: string }) =>
      updateNote(noteId, content),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error((error as Error).message)
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => deleteNote(noteId),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error((error as Error).message)
    },
  })

  return { createNoteMutation, updateNoteMutation, deleteNoteMutation }
}
