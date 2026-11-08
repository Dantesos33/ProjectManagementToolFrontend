import { useMemo, useState } from "react";
import { DragDropContext, Droppable, type DragStart, type DropResult } from "@hello-pangea/dnd";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useCan } from "../../hooks/useCan";
import { parseApiError } from "../../lib/errors";
import {
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
} from "../../store/tasks/tasksApi";
import type { Task, TaskStatus } from "../../types";
import { COLUMNS } from "../../constants/index";
import { computePosition } from "../../constants/positions";
import TaskCard from "./TaskCard";
import TaskFormModal from "./TaskFormModal";
import { getEcho } from "../../lib/echo";
import { useAppSelector } from "../../hooks";

const EMPTY: Task[] = [];
type FormTarget = { task: Task | null; status: TaskStatus } | null;
type ApiError = Parameters<typeof parseApiError>[0];

export default function KanbanBoard({ projectId }: { projectId: number }) {
  const can = useCan();
  const { data, isLoading, isError, refetch } = useGetTasksQuery(projectId);
  const [updateStatus] = useUpdateTaskStatusMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();

  const [form, setForm] = useState<FormTarget>(null);
  const [toDelete, setToDelete] = useState<Task | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const userName = useAppSelector((s) => s.auth.user?.name);
  const tenantId = useAppSelector((s) => s.auth.user?.tenant_id);

  const tasks = data ?? EMPTY;

  // Group by status and sort each column by position
  const columns = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      completed: [],
    };
    for (const task of tasks) grouped[task.status].push(task);
    for (const col of COLUMNS)
      grouped[col.status].sort(
        (a, b) => a.position - b.position || a.id - b.id,
      );
    return grouped;
  }, [tasks]);

  const whisper = (event: string, data: object) =>
  getEcho()?.private(`tenant.${tenantId}`).whisper(event, data);

const onDragStart = ({ draggableId }: DragStart) => {
  whisper("task.dragging", { taskId: Number(draggableId), name: userName });
};

const onDragEnd = ({ source, destination, draggableId }: DropResult) => {
  whisper("task.dropped", { taskId: Number(draggableId) });   // moved here

  if (!destination || !can.moveTask) return;
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  )
    return;

  const id = Number(draggableId);
  const status = destination.droppableId as TaskStatus;
  const column = columns[status].filter((t) => t.id !== id);
  const position = computePosition(column, destination.index);

  setMoveError(null);
  updateStatus({ id, projectId, status, position })
    .unwrap()
    .catch((err) => setMoveError(parseApiError(err as ApiError).message));
};

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleteError(null);

    try {
      await deleteTask({ id: toDelete.id, projectId }).unwrap();
      setToDelete(null);
    } catch (err) {
      setDeleteError(parseApiError(err as ApiError).message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden" aria-busy="true">
        {COLUMNS.map((c) => (
          <div
            key={c.status}
            className="h-72 w-72 shrink-0 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 xl:w-auto xl:flex-1"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10"
      >
        <p className="text-sm text-red-700 dark:text-red-300">
          Could not load tasks.
        </p>
        <button
          type="button"
          onClick={refetch}
          className="mt-3 rounded-xl border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!can.moveTask && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You have view-only access to this board.
        </p>
      )}

      {moveError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          <span>Could not move the task: {moveError}</span>
          <button
            type="button"
            onClick={() => setMoveError(null)}
            className="font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(({ status, label, dot }) => (
            <section
              key={status}
              aria-label={label}
              className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/50 xl:w-auto xl:min-w-0 xl:flex-1"
            >
              <header className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${dot}`}
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {label}
                  </h2>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {columns[status].length}
                  </span>
                </div>
                {can.createTask && (
                  <button
                    type="button"
                    onClick={() => setForm({ task: null, status })}
                    aria-label={`Add task to ${label}`}
                    className="grid h-7 w-7 place-items-center rounded-lg text-lg leading-none text-slate-500 transition hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    +
                  </button>
                )}
              </header>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-24 space-y-3 rounded-b-2xl px-3 pb-3 transition-colors ${
                      snapshot.isDraggingOver
                        ? "bg-indigo-50 dark:bg-indigo-500/10"
                        : ""
                    }`}
                  >
                    {columns[status].map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        canMove={can.moveTask}
                        canEdit={can.editTask}
                        canDelete={can.deleteTask}
                        onEdit={(t) => setForm({ task: t, status: t.status })}
                        onDelete={(t) => {
                          setDeleteError(null);
                          setToDelete(t);
                        }}
                      />
                    ))}
                    {provided.placeholder}

                    {columns[status].length === 0 &&
                      !snapshot.isDraggingOver && (
                        <li className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                          No tasks
                        </li>
                      )}
                  </ul>
                )}
              </Droppable>
            </section>
          ))}
        </div>
      </DragDropContext>

      <TaskFormModal
        open={form !== null}
        projectId={projectId}
        task={form?.task}
        defaultStatus={form?.status}
        onClose={() => setForm(null)}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete task?"
        message={`"${toDelete?.title ?? ""}" will be permanently deleted.`}
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
