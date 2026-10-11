// Card data for every visible post (PRD 8, decision 29). Used by the Search page
// and My Saved Posts in the browser.
import type { APIRoute } from 'astro';
import { getVisiblePosts, toCard, byNewest } from '../lib/content';

export const GET: APIRoute = async () => {
  const posts = (await getVisiblePosts()).sort(byNewest).map(toCard);
  return new Response(JSON.stringify({ generated: new Date().toISOString(), posts }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
