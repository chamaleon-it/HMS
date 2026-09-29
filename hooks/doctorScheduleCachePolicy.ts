/**
 * Doctor Today's Schedule cache policy.
 *
 * SWR skips the mount fetch when cached data exists and `revalidateIfStale` is
 * false (`shouldDoInitialRevalidation` in use-swr). The appointment list used
 * that setting, so client navigations back to `/dashboard/doctor/` reused the
 * pre-consult payload. Stat cards do not override the provider
 * (`revalidateIfStale: true`) and already refresh on the same landing.
 */
export const doctorScheduleListSwrOptions: {
  revalidateIfStale: boolean;
  revalidateOnMount: boolean;
  revalidateOnFocus: boolean;
} = {
  revalidateIfStale: true,
  revalidateOnMount: true,
  revalidateOnFocus: true,
};

export function shouldRefetchDoctorScheduleOnMount(input: {
  hasCachedData: boolean;
  isInitialMount?: boolean;
  revalidateOnMount?: boolean;
  revalidateIfStale?: boolean;
}): boolean {
  const isInitialMount = input.isInitialMount !== false;
  if (isInitialMount && input.revalidateOnMount !== undefined) {
    return input.revalidateOnMount;
  }
  if (!input.hasCachedData) return true;
  return input.revalidateIfStale !== false;
}
