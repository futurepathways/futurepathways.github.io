// Deadline rules (PRD 9). Shared by build-time rendering and the browser script.
// A deadline is a calendar date meaning 11:59 PM IST on that day.

export type DeadlineStatus = 'open' | 'soon' | 'lastday' | 'closed' | 'rolling';

export const statusLabel: Record<DeadlineStatus, string> = {
  open: 'Open',
  soon: 'Closing soon',
  lastday: 'Last day',
  closed: 'Closed',
  rolling: 'Rolling',
};

/** Today's date in IST as "YYYY-MM-DD". Works in Node and in the browser. */
export function istTodayString(now = new Date()): string {
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

/** Whole days from today (IST) to the deadline date. 0 = today, negative = past. */
export function daysLeft(deadline: string, today = istTodayString()): number {
  const a = Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10));
  const b = Date.UTC(+deadline.slice(0, 4), +deadline.slice(5, 7) - 1, +deadline.slice(8, 10));
  return Math.round((b - a) / 86400000);
}

export function deadlineStatus(
  deadline: string | null,
  rolling: boolean,
  today = istTodayString(),
): DeadlineStatus | null {
  if (rolling) return 'rolling';
  if (!deadline) return null;
  const d = daysLeft(deadline, today);
  if (d < 0) return 'closed';
  if (d === 0) return 'lastday';
  if (d <= 14) return 'soon';
  return 'open';
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateString(date: string): string {
  return `${+date.slice(8, 10)} ${months[+date.slice(5, 7) - 1]} ${date.slice(0, 4)}`;
}

/** "31 Dec 2026 (12 days left)" */
export function formatDeadline(deadline: string, today = istTodayString()): string {
  const d = daysLeft(deadline, today);
  const date = formatDateString(deadline);
  if (d < 0) return `${date} (closed)`;
  if (d === 0) return `${date} (today!)`;
  if (d === 1) return `${date} (1 day left)`;
  return `${date} (${d} days left)`;
}
