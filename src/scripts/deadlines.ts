// Recomputes every deadline badge on the page using today's IST date (PRD 9),
// so badges stay right between the daily rebuilds.
import { deadlineStatus, statusLabel, formatDeadline, istTodayString } from '../lib/deadlines';

export function refreshDeadlines(root: ParentNode = document) {
  const today = istTodayString();
  root.querySelectorAll<HTMLElement>('[data-deadline]').forEach((el) => {
    const deadline = el.dataset.deadline || null;
    const rolling = el.dataset.rolling === 'true';
    const status = deadlineStatus(deadline, rolling, today);
    const badge = el.querySelector<HTMLElement>('[data-deadline-badge]');
    if (badge && status) {
      badge.className = `badge badge--${status}`;
      badge.textContent = statusLabel[status];
    }
    const text = el.querySelector<HTMLElement>('[data-deadline-text]');
    if (text && deadline) text.textContent = formatDeadline(deadline, today);
    // Let listing filters know the current status.
    const card = el.closest<HTMLElement>('[data-card]');
    if (card && status) card.dataset.status = status;
  });
}

refreshDeadlines();
