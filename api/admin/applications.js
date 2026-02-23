import { createClient } from '@supabase/supabase-js';
import { verifySession } from './_auth.js';
import { calculateScore } from '../../src/admin/scoring.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifySession(req)) {
    return res.status(401).json({ error: '未授權' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Parse query params
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  const sort = ['created_at', 'name', 'age'].includes(req.query.sort)
    ? req.query.sort
    : 'created_at';
  const order = req.query.order === 'asc' ? true : false;
  const catFilter = req.query.cat || null;
  const search = req.query.search || null;

  // Build query
  let query = supabase.from('applications').select('*', { count: 'exact' });

  if (catFilter) {
    query = query.contains('selected_cats', [catFilter]);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  query = query.order(sort, { ascending: order });
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Calculate scores for each application
  const applications = (data || []).map((app) => ({
    ...app,
    score: calculateScore(app),
  }));

  // If sorting by score, sort in-memory (can't sort computed field in DB)
  if (req.query.sort === 'score') {
    applications.sort((a, b) =>
      order ? a.score.total - b.score.total : b.score.total - a.score.total
    );
  }

  // Generate photo signed URLs in batch
  const photoUrls = {};
  await Promise.all(
    applications.map(async (app) => {
      if (app.photo_paths && app.photo_paths.length > 0) {
        const urls = await Promise.all(
          app.photo_paths.map(async (path) => {
            const { data: signedData } = await supabase.storage
              .from('application-photos')
              .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
            return signedData?.signedUrl || null;
          })
        );
        photoUrls[app.id] = urls.filter(Boolean);
      }
    })
  );

  // Remove photo_paths from response (don't expose internal paths)
  applications.forEach((app) => {
    delete app.photo_paths;
  });

  return res.status(200).json({
    applications,
    pagination: { page, limit, total: count || 0 },
    photoUrls,
  });
}
