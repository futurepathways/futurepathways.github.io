// "Add to calendar" file for an opportunity's deadline (PRD 9): an all-day event in IST.
import type { APIRoute } from 'astro';
import { getVisiblePosts } from '../../../lib/content';

export async function getStaticPaths() {
  const posts = await getVisiblePosts();
  return posts
    .filter((p) => p.opportunity?.deadline && !p.opportunity.rolling)
    .map((p) => ({ params: { slug: p.slug }, props: { post: p } }));
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function fold(line: string): string {
  // iCalendar lines are folded at 75 octets.
  const out: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    out.push(rest.slice(0, 73));
    rest = ' ' + rest.slice(73);
  }
  out.push(rest);
  return out.join('\r\n');
}

export const GET: APIRoute = async ({ props, site }) => {
  const post = props.post;
  const date = post.opportunity.deadline.replace(/-/g, '');
  const next = new Date(Date.UTC(+date.slice(0, 4), +date.slice(4, 6) - 1, +date.slice(6, 8) + 1));
  const nextStr = next.toISOString().slice(0, 10).replace(/-/g, '');
  const url = new URL(post.path, site).toString();
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const description = `${post.summary}\n\nDeadline: 11:59 PM IST${post.opportunity.deadlineNote ? ` (${post.opportunity.deadlineNote})` : ''}.\nDetails: ${url}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Future Pathways//TIPS FP team//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${post.slug}-${date}@futurepathways.github.io`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${nextStr}`,
    fold(`SUMMARY:${icsEscape(`Deadline: ${post.title}`)}`),
    fold(`DESCRIPTION:${icsEscape(description)}`),
    fold(`URL:${url}`),
    'BEGIN:VALARM',
    'TRIGGER:-P3D',
    'ACTION:DISPLAY',
    fold(`DESCRIPTION:${icsEscape(`3 days left: ${post.title}`)}`),
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${post.slug}-deadline.ics"`,
    },
  });
};
