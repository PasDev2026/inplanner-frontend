export interface BackendProject {
  id_project: number;
  name_project: string;
  description_project: string | null;
  manager_id: number;
  sede_id: number | null;
  start_date: string | null;
  due_date: string | null;
  status: number;
  priority: number;
  privacy_level?: number;
  position: number;
  created_at: string;
  updated_at: string;
  progress: number;
  responsibles?: { user_id: number; name?: string; apellido_paterno?: string }[];
}

export interface BackendNote {
  id_note: number;
  content: string;
  task_id: number;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  createdBy: {
    id_user: number;
    name: string;
    apellido_paterno: string | null;
    email: string;
  };
}

export interface BackendTask {
  id_task: number;
  task_name: string;
  task_description: string | null;
  project_id: number;
  parent_task_id: number | null;
  created_by_id: number;
  completed_by_id: number | null;
  start_date: string | null;
  due_date: string | null;
  status: number;
  priority: number | null;
  created_at: string;
  updated_at: string;
  assignments?: {
    user_id: number;
    user: { id_user: number; name: string; apellido_paterno: string | null; email: string };
  }[];
  notes?: BackendNote[];
  children?: BackendTask[];
  subtasks_count?: number;
  position: number;
}

export interface BackendPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
