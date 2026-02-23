import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== process.env.EXPORT_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
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

  for (const row of data) {
    if (row.photo_paths && row.photo_paths.length > 0) {
      const urls = [];
      for (const path of row.photo_paths) {
        const { data: signedData } = await supabase.storage
          .from('application-photos')
          .createSignedUrl(path, 60 * 60 * 24 * 7);
        if (signedData?.signedUrl) urls.push(signedData.signedUrl);
      }
      row.photo_urls = urls.join('\n');
    } else {
      row.photo_urls = '';
    }
  }

  const rows = data.map((r) => ({
    '送出時間': new Date(r.created_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    '想領養': (r.selected_cats || []).join('、'),
    '姓名': r.name,
    '性別': r.gender,
    '年齡': r.age,
    '手機/LINE': r.phone,
    '經濟狀況': r.financial,
    '住家': r.ownership,
    '房東同意': r.landlord_ok || '',
    '紗窗/防墜網': r.screen_installed,
    '家人同意': r.family_agree,
    '養過貓': r.has_cat_before,
    '養貓經歷': r.cat_detail || '',
    '有狗': r.has_dog ? '是' : '否',
    '狗幾隻': r.dog_count || '',
    '有貓': r.has_cat ? '是' : '否',
    '貓幾隻': r.cat_count || '',
    '有其他': r.has_other ? '是' : '否',
    '其他動物': r.other_detail || '',
    '外出方式': r.outdoor,
    '照片連結': r.photo_urls,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '領養申請');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=applications-${new Date().toISOString().slice(0, 10)}.xlsx`);
  res.status(200).send(buf);
}
