import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { StudySession } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetAllSessions() {
  const { actor, isFetching } = useActor();

  return useQuery<StudySession[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, session }: { user: Principal; session: StudySession }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.recordSession(
        user,
        session.startTime,
        session.endTime || null,
        session.focusedDuration,
        session.pausedDuration,
        session.distractions,
        session.distractionCount,
        session.distractionTime,
        session.isPomodoro,
        session.pomodoroCyclesCompleted
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
