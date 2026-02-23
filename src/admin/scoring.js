/**
 * 領養申請評分系統
 * 用常數映射而非字串比對，避免全形/半形差異
 * 滿分 15 分
 */

const RULES = [
  {
    field: 'has_cat_before',
    label: '養貓經驗',
    scores: { '有': 3, '沒有但有做功課': 1 },
    default: 0,
  },
  {
    field: 'ownership',
    label: '住家',
    handler: (app) => {
      if (app.ownership === '自有') return 2;
      if (app.ownership === '租屋' && app.landlord_ok === '同意') return 1;
      return 0;
    },
  },
  {
    field: 'screen_installed',
    label: '紗窗/防墜網',
    scores: { '已安裝': 2, '願意安裝': 1, '無法安裝': -1 },
    default: 0,
  },
  {
    field: 'family_agree',
    label: '家人同意',
    scores: { '全部同意': 2 },
    default: 0,
  },
  {
    field: 'outdoor',
    label: '外出方式',
    // 全形括號，與 src/App.jsx:457 一致
    scores: { '完全室內': 2, '偶爾外出（有牽繩）': 1, '自由進出': -2 },
    default: 0,
  },
  {
    field: 'financial',
    label: '經濟狀況',
    scores: { '有穩定收入': 2, '有家人支援': 1, '目前沒有': -1 },
    default: 0,
  },
  {
    field: 'selected_cats',
    label: '領養組合',
    handler: (app) => {
      const cats = app.selected_cats || [];
      if (cats.includes('trio')) return 2;
      if (cats.includes('duo')) return 1;
      return 0;
    },
  },
];

const MAX_SCORE = 15;

export function calculateScore(application) {
  const breakdown = RULES.map((rule) => {
    let points;
    if (rule.handler) {
      points = rule.handler(application);
    } else {
      const value = application[rule.field];
      points = (value != null && rule.scores[value] != null)
        ? rule.scores[value]
        : rule.default;
    }

    return {
      field: rule.field,
      label: rule.label,
      value: rule.handler ? String(application[rule.field] ?? '') : (application[rule.field] ?? ''),
      points,
    };
  });

  const total = breakdown.reduce((sum, item) => sum + item.points, 0);

  return { total, max: MAX_SCORE, breakdown };
}
