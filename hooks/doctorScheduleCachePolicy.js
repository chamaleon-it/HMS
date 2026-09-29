/**
 * Doctor Today's Schedule cache policy.
 *
 * SWR skips the mount fetch when cached data exists and `revalidateIfStale` is
 * false (`shouldDoInitialRevalidation` in use-swr). The appointment list used
 * that setting, so client navigations back to `/dashboard/doctor/` reused the
 * pre-consult payload. Stat cards do not override the provider
 * (`revalidateIfStale: true`) and already refresh on the same landing.
 *
 * This module is plain JavaScript so the Node test can import it with a `.js`
 * specifier. The app tsconfig does not allow `.ts` import extensions.
 */

/** @type {{ revalidateIfStale: boolean, revalidateOnMount: boolean, revalidateOnFocus: boolean }} */
export const doctorScheduleListSwrOptions = {
  revalidateIfStale: true,
  revalidateOnMount: true,
  revalidateOnFocus: true,
};

/**
 * Mirrors SWR mount revalidation. Cached data is refetched when
 * `revalidateOnMount` is true, or when `revalidateIfStale` is not false.
 *
 * @param {{
 *   hasCachedData: boolean,
 *   isInitialMount?: boolean,
 *   revalidateOnMount?: boolean,
 *   revalidateIfStale?: boolean,
 * }} input
 * @returns {boolean}
 */
export function shouldRefetchDoctorScheduleOnMount(input) {
  const isInitialMount = input.isInitialMount !== false;
  if (isInitialMount && input.revalidateOnMount !== undefined) {
    return input.revalidateOnMount;
  }
  if (!input.hasCachedData) return true;
  return input.revalidateIfStale !== false;
}
