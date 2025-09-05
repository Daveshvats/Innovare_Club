import { useQueryClient } from "@tanstack/react-query";

/**
 * Cache invalidation utility functions
 * This helps ensure data consistency across the application
 */

export const useCacheInvalidation = () => {
  const queryClient = useQueryClient();

  // Invalidate specific queries
  const invalidateTeamMembers = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/team"] });
  };

  const invalidateEvents = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
  };

  const invalidateGallery = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
  };

  const invalidateAbout = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/about"] });
  };

  const invalidatePolls = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
  };

  const invalidateAnnouncements = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
  };

  const invalidateCourses = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/course-library"] });
  };

  const invalidateRegistrations = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/admin/registrations"] });
  };

  const invalidateTechnofest = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/technofest"] });
  };

  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
  };

  // Invalidate all critical data
  const invalidateAll = async () => {
    await Promise.all([
      invalidateTeamMembers(),
      invalidateEvents(),
      invalidateGallery(),
      invalidateAbout(),
      invalidatePolls(),
      invalidateAnnouncements(),
      invalidateCourses(),
      invalidateRegistrations(),
      invalidateTechnofest(),
      invalidateUsers(),
    ]);
  };

  // Invalidate related data when team members change
  const invalidateTeamRelated = async () => {
    await Promise.all([
      invalidateTeamMembers(),
      invalidateAbout(), // About page shows team members
    ]);
  };

  // Invalidate related data when events change
  const invalidateEventRelated = async () => {
    await Promise.all([
      invalidateEvents(),
      invalidateRegistrations(), // Registrations are tied to events
    ]);
  };

  // Force refetch all data
  const refetchAll = async () => {
    await queryClient.refetchQueries();
  };

  // Clear all cache
  const clearAllCache = async () => {
    await queryClient.clear();
  };

  return {
    invalidateTeamMembers,
    invalidateEvents,
    invalidateGallery,
    invalidateAbout,
    invalidatePolls,
    invalidateAnnouncements,
    invalidateCourses,
    invalidateRegistrations,
    invalidateTechnofest,
    invalidateUsers,
    invalidateAll,
    invalidateTeamRelated,
    invalidateEventRelated,
    refetchAll,
    clearAllCache,
  };
};

/**
 * Default query options for better cache management
 */
export const defaultQueryOptions = {
  staleTime: 0, // Always consider data stale
  refetchOnWindowFocus: true, // Refetch when window gains focus
  refetchOnMount: true, // Refetch when component mounts
  refetchOnReconnect: true, // Refetch when network reconnects
  retry: 1, // Retry failed requests once
  retryDelay: 1000, // Wait 1 second before retry
};

/**
 * Query options for critical data that needs frequent updates
 */
export const criticalQueryOptions = {
  ...defaultQueryOptions,
  refetchInterval: 30000, // Refetch every 30 seconds
  refetchIntervalInBackground: true, // Continue refetching even when tab is not active
};

/**
 * Query options for admin data that needs immediate updates
 */
export const adminQueryOptions = {
  ...defaultQueryOptions,
  refetchInterval: 10000, // Refetch every 10 seconds for admin data
  refetchIntervalInBackground: true,
};

/**
 * Optimistic update helper for mutations
 */
export const createOptimisticUpdate = <T>(
  queryKey: string[],
  updateFn: (oldData: T | undefined, newData: any) => T
) => {
  return (queryClient: any, newData: any) => {
    // Optimistically update the cache
    queryClient.setQueryData(queryKey, (oldData: T | undefined) => 
      updateFn(oldData, newData)
    );
  };
};

/**
 * Revert optimistic update on error
 */
export const revertOptimisticUpdate = (queryKey: string[]) => {
  return (queryClient: any) => {
    // Invalidate to get fresh data and revert optimistic update
    queryClient.invalidateQueries({ queryKey });
  };
};
