import {z} from 'zod';
import { userPerfilSchema } from '@/features/auth/schemas/auth.schema';

/* Shared user info (for populated fields) */
export const userInfoSchema = z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string().optional(),
})
export type UserInfo = z.infer<typeof userInfoSchema>

export const sedeUserInfoSchema = z.object({
    _id: z.string(),
    name: z.string(),
    apellido_paterno: z.string(),
    area: z.object({ _id: z.string(), name: z.string() }).nullish(),
})
export type SedeUserInfo = z.infer<typeof sedeUserInfoSchema>

/* Notes */
export const noteSchema = z.object({
    _id: z.string(),
    content: z.string(),
    createdBy: userPerfilSchema,
    task: z.string(),
    createdAt: z.string()
})
export type Note = z.infer<typeof noteSchema>
export type NoteFormData = Pick<Note, 'content'>


/* Task */

export const taskStatusSchema = z.enum(["pending" , "onHold" , "inProgress" , "underReview" , "completed"])
export type TaskStatus = z.infer<typeof taskStatusSchema>

export const taskPrioritySchema = z.enum(["low", "medium", "high"]).nullable()
export type TaskPriority = z.infer<typeof taskPrioritySchema>

export const projectStatusSchema = z.enum(["planning", "active", "onHold", "completed", "cancelled"])
export type ProjectStatus = z.infer<typeof projectStatusSchema>

export const taskSchema = z.object({
    _id: z.string(),
    name: z.string(),
    description: z.string().default(''),
    project: z.string(),
    status: taskStatusSchema,
    priority: taskPrioritySchema.default("medium"),
    startDate: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    completedBy: z.array(z.object({
        status: taskStatusSchema,
        user: userPerfilSchema,
        _id: z.string(),
    })),
    notes: z.array(noteSchema.extend({createdBy: userPerfilSchema})),
    assignedTo: z.array(userInfoSchema).default([]),
    parentTask: z.string().nullable(),
    ancestors: z.array(z.string()),
    order: z.number(),
    subtaskCount: z.number().default(0),
    createdAt: z.string(),
    updatedAt: z.string()
})
export const taskProjectSchema = taskSchema.pick({
    _id: true,
    name: true,
    description: true,
    status: true,
    priority: true,
    startDate: true,
    dueDate: true,
    parentTask: true,
    order: true,
    subtaskCount: true,
}).extend({
    assignedTo: z.array(userInfoSchema).default([]),
})

export const progressSchema = z.object({
    percentage: z.number().min(0).max(100),
    completedTasks: z.number(),
    totalTasks: z.number(),
})

export const taskPreviewResponseSchema = z.object({
    tasks: z.array(taskProjectSchema),
    total: z.number(),
    progress: progressSchema.optional(),
})
export type TaskPreviewResponse = z.infer<typeof taskPreviewResponseSchema>

export type Task = z.infer<typeof taskSchema>
export type TaskFormData = Pick<Task, 'name'> & Partial<Pick<Task, 'description' | 'priority' | 'startDate' | 'dueDate'>>
export type TaskProject = z.infer<typeof taskProjectSchema>


/* Projects */
export const projectSchema = z.object({
    _id: z.string(),
    projectName: z.string(),
    description: z.string().default(''),
    manager: z.string(),
    empresa: z.string(),
    status: projectStatusSchema.default("planning"),
    priority: taskPrioritySchema.default("medium"),
    tasks: z.array(taskProjectSchema),
    team: z.array(z.string()),
    responsible: z.array(userInfoSchema).default([]),
    startDate: z.string().nullable().optional(),
})

export const empresaInfoSchema = z.object({
    _id: z.string(),
    nombre: z.string(),
})
export type EmpresaInfo = z.infer<typeof empresaInfoSchema>

export const dashboardProjectsSchema = z.object({
    projects: z.array(
        z.object({
            _id: z.string(),
            projectName: z.string(),
            description: z.string().default(''),
            manager: z.string(),
            empresa: empresaInfoSchema,
            status: projectStatusSchema.default("planning"),
            priority: taskPrioritySchema.default("medium"),
            startDate: z.string().nullable().optional(),
            dueDate: z.string().nullable().optional(),
            isOverdue: z.boolean().optional(),
            responsible: z.array(userInfoSchema).default([]),
            progress: progressSchema.optional(),
            createdAt: z.string().optional(),
            updatedAt: z.string().optional(),
        })
    ),
    total: z.number()
})
export type DashboardProject = z.infer<typeof dashboardProjectsSchema>['projects'][number]
export type ProjectsResponse = z.infer<typeof dashboardProjectsSchema>

export const editProjectSchema = projectSchema.pick({
    projectName: true,
    description: true,
}).extend({
    empresa: z.string(),
    status: projectStatusSchema.default("planning"),
    priority: taskPrioritySchema.default("medium"),
    startDate: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
})
export type Project = z.infer<typeof projectSchema>;

export const fullProjectDetailsSchema = projectSchema.extend({
    startDate: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    isOverdue: z.boolean().optional(),
    createdAt: z.string().optional(),
    progress: z.object({
        percentage: z.number(),
        completedTasks: z.number(),
        totalTasks: z.number(),
    }).optional()
})
export type FullProjectDetails = z.infer<typeof fullProjectDetailsSchema>

export type ProjectFormData = Pick<Project, 'projectName' | 'description'> & { empresa: string, startDate?: string | null, dueDate?: string | null }

/* TEAM */
export const teamMemberSchema = userPerfilSchema.pick({
    name:true,
    email: true,
    _id: true
})


export const teamMembersSchema = z.array(teamMemberSchema)
export type TeamMember = z.infer<typeof teamMemberSchema>
export type TeamMemberFormulario = Pick<TeamMember, 'email'>

export const projectMembersResponseSchema = z.object({
    manager: userInfoSchema,
    team: z.array(userInfoSchema),
})
export type ProjectMembersResponse = z.infer<typeof projectMembersResponseSchema>

export const statusChangeResponseSchema = z.object({
    message: z.string(),
    progress: progressSchema,
})
export type StatusChangeResponse = z.infer<typeof statusChangeResponseSchema>

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
  created_at: string;
  updated_at: string;
  responsibles?: { user_id: number }[];
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