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

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const applications = data || [];
  const total = applications.length;

  if (total === 0) {
    return res.status(200).json({
      total: 0,
      byCat: {},
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      byDate: [],
    });
  }

  // Count by cat
  const byCat = {};
  applications.forEach((app) => {
    (app.selected_cats || []).forEach((cat) => {
      byCat[cat] = (byCat[cat] || 0) + 1;
    });
  });

  // Score stats
  const scores = applications.map((app) => calculateScore(app).total);
  const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / total) * 10) / 10;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  // Count by date (Taiwan timezone)
  const dateCounts = {};
  applications.forEach((app) => {
    const date = new Date(app.created_at)
      .toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' })
      .replace(/\//g, '-');
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });
  const byDate = Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return res.status(200).json({
    total,
    byCat,
    avgScore,
    maxScore,
    minScore,
    byDate,
  });
}
