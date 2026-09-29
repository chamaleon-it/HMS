import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  doctorScheduleListSwrOptions,
  shouldRefetchDoctorScheduleOnMount,
} from "./doctorScheduleCachePolicy.ts";

const staleListOptions = {
  revalidateIfStale: false,
} as const;

test("cached schedule refetches when the doctor dashboard mounts again", () => {
  assert.equal(
    shouldRefetchDoctorScheduleOnMount({
      hasCachedData: true,
      ...doctorScheduleListSwrOptions,
    }),
    true
  );
});

test("the previous list policy kept a completed consult on Upcoming", () => {
  assert.equal(
    shouldRefetchDoctorScheduleOnMount({
      hasCachedData: true,
      ...staleListOptions,
    }),
    false
  );
});

test("a full reload still fetches when there is no cache", () => {
  assert.equal(
    shouldRefetchDoctorScheduleOnMount({
      hasCachedData: false,
      ...staleListOptions,
    }),
    true
  );
});

test("tab focus revalidation stays enabled for the schedule list", () => {
  assert.equal(doctorScheduleListSwrOptions.revalidateOnFocus, true);
});

test("useAppointmentList uses the refetch policy", () => {
  const source = readFileSync(
    new URL("./useAppointmentList.tsx", import.meta.url),
    "utf8"
  );
  assert.match(source, /doctorScheduleListSwrOptions/);
  assert.doesNotMatch(source, /revalidateIfStale:\s*false/);
});

test("week and month views use the same schedule refetch policy", () => {
  for (const file of [
    "../components/doctor/dashboard/home/WeeklyCalender.tsx",
    "../components/doctor/dashboard/home/MonthlyCalender.tsx",
  ]) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.match(source, /doctorScheduleListSwrOptions/);
    assert.doesNotMatch(source, /revalidateIfStale:\s*false/);
  }
});
