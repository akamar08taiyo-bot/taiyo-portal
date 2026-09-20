// 福岡県 市区町村（60自治体・福岡市/北九州市は区単位で72地点）の代表座標。
// 出典は明記できる住所APIを使わず、地図上のおおよその位置決め用に用意した概算値。
// 営業活動の目安表示が目的であり、番地レベルの正確な位置ではない点に注意。
export const FUKUOKA_MUNICIPALITIES = [
  // 福岡市（区）
  { name: '福岡市東区', lat: 33.6203, lng: 130.4211, parent: '福岡市' },
  { name: '福岡市博多区', lat: 33.5902, lng: 130.4207, parent: '福岡市' },
  { name: '福岡市中央区', lat: 33.5885, lng: 130.3963, parent: '福岡市' },
  { name: '福岡市南区', lat: 33.5620, lng: 130.4197, parent: '福岡市' },
  { name: '福岡市城南区', lat: 33.5652, lng: 130.3811, parent: '福岡市' },
  { name: '福岡市早良区', lat: 33.5735, lng: 130.3486, parent: '福岡市' },
  { name: '福岡市西区', lat: 33.5766, lng: 130.3306, parent: '福岡市' },
  { name: '福岡市', lat: 33.5885, lng: 130.3963, parent: '福岡市' },
  // 北九州市（区）
  { name: '北九州市門司区', lat: 33.9455, lng: 130.9628, parent: '北九州市' },
  { name: '北九州市小倉北区', lat: 33.8834, lng: 130.8752, parent: '北九州市' },
  { name: '北九州市小倉南区', lat: 33.8299, lng: 130.9282, parent: '北九州市' },
  { name: '北九州市若松区', lat: 33.9024, lng: 130.8168, parent: '北九州市' },
  { name: '北九州市八幡東区', lat: 33.8631, lng: 130.8106, parent: '北九州市' },
  { name: '北九州市八幡西区', lat: 33.8546, lng: 130.7614, parent: '北九州市' },
  { name: '北九州市戸畑区', lat: 33.9026, lng: 130.8412, parent: '北九州市' },
  { name: '北九州市', lat: 33.8834, lng: 130.8752, parent: '北九州市' },
  // その他の市（27）
  { name: '大牟田市', lat: 33.0287, lng: 130.4453 },
  { name: '久留米市', lat: 33.3196, lng: 130.5083 },
  { name: '直方市', lat: 33.7433, lng: 130.7286 },
  { name: '飯塚市', lat: 33.6459, lng: 130.6912 },
  { name: '田川市', lat: 33.6333, lng: 130.8022 },
  { name: '柳川市', lat: 33.1636, lng: 130.4092 },
  { name: '八女市', lat: 33.2116, lng: 130.5563 },
  { name: '筑後市', lat: 33.2131, lng: 130.5075 },
  { name: '大川市', lat: 33.1908, lng: 130.3628 },
  { name: '行橋市', lat: 33.7267, lng: 130.9769 },
  { name: '豊前市', lat: 33.6062, lng: 131.0009 },
  { name: '中間市', lat: 33.8167, lng: 130.7075 },
  { name: '小郡市', lat: 33.4183, lng: 130.5548 },
  { name: '筑紫野市', lat: 33.5039, lng: 130.5150 },
  { name: '春日市', lat: 33.5222, lng: 130.4767 },
  { name: '大野城市', lat: 33.5325, lng: 130.4708 },
  { name: '宗像市', lat: 33.8058, lng: 130.5389 },
  { name: '太宰府市', lat: 33.5189, lng: 130.5231 },
  { name: '古賀市', lat: 33.7328, lng: 130.4694 },
  { name: '福津市', lat: 33.7714, lng: 130.4756 },
  { name: 'うきは市', lat: 33.3167, lng: 130.7333 },
  { name: '宮若市', lat: 33.7392, lng: 130.6822 },
  { name: '嘉麻市', lat: 33.5636, lng: 130.6989 },
  { name: '朝倉市', lat: 33.4106, lng: 130.6572 },
  { name: 'みやま市', lat: 33.1394, lng: 130.4275 },
  { name: '糸島市', lat: 33.5497, lng: 130.2019 },
  { name: '那珂川市', lat: 33.5075, lng: 130.4128 },
  // 町村（31）
  { name: '芦屋町', lat: 33.8908, lng: 130.6592 },
  { name: '水巻町', lat: 33.8467, lng: 130.6989 },
  { name: '岡垣町', lat: 33.8656, lng: 130.5622 },
  { name: '遠賀町', lat: 33.8397, lng: 130.6811 },
  { name: '小竹町', lat: 33.7275, lng: 130.7228 },
  { name: '鞍手町', lat: 33.7439, lng: 130.6942 },
  { name: '桂川町', lat: 33.6167, lng: 130.6667 },
  { name: '筑前町', lat: 33.4192, lng: 130.6006 },
  { name: '東峰村', lat: 33.4358, lng: 130.8106 },
  { name: '大刀洗町', lat: 33.3672, lng: 130.6069 },
  { name: '大木町', lat: 33.1892, lng: 130.5183 },
  { name: '広川町', lat: 33.2489, lng: 130.5722 },
  { name: '香春町', lat: 33.6425, lng: 130.8286 },
  { name: '添田町', lat: 33.5867, lng: 130.8494 },
  { name: '糸田町', lat: 33.6236, lng: 130.7736 },
  { name: '川崎町', lat: 33.6169, lng: 130.8592 },
  { name: '大任町', lat: 33.6053, lng: 130.8194 },
  { name: '赤村', lat: 33.6486, lng: 130.8794 },
  { name: '福智町', lat: 33.6489, lng: 130.7481 },
  { name: '苅田町', lat: 33.7789, lng: 130.9631 },
  { name: 'みやこ町', lat: 33.6772, lng: 130.9436 },
  { name: '吉富町', lat: 33.5975, lng: 131.0511 },
  { name: '上毛町', lat: 33.5622, lng: 131.0433 },
  { name: '築上町', lat: 33.5867, lng: 131.0106 },
  { name: '宇美町', lat: 33.5464, lng: 130.5361 },
  { name: '篠栗町', lat: 33.6008, lng: 130.5286 },
  { name: '志免町', lat: 33.5744, lng: 130.4708 },
  { name: '須恵町', lat: 33.5825, lng: 130.5083 },
  { name: '新宮町', lat: 33.7133, lng: 130.4494 },
  { name: '久山町', lat: 33.6167, lng: 130.4972 },
  { name: '粕屋町', lat: 33.6003, lng: 130.4622 },
]

const norm = (s) => String(s ?? '').normalize('NFKC').trim().replace(/\s+/g, '')

const BY_NAME = new Map(FUKUOKA_MUNICIPALITIES.map((m) => [norm(m.name), m]))

// 表記ゆれ（「北九州市 小倉北区」のような区切りスペースや「福岡県」プレフィックス等）を
// 吸収してから完全一致で引き、当たらなければ最も長く前方一致する自治体名にフォールバックする。
export function resolveMunicipality(input) {
  let key = norm(input).replace(/^福岡県/, '')
  if (!key) return null
  if (BY_NAME.has(key)) return BY_NAME.get(key)
  let best = null
  for (const m of FUKUOKA_MUNICIPALITIES) {
    const n = norm(m.name)
    if (key.startsWith(n) && (!best || n.length > norm(best.name).length)) best = m
  }
  return best
}

export function isKnownMunicipality(input) {
  return !!resolveMunicipality(input)
}
