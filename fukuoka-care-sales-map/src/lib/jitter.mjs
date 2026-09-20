// 自治体の代表座標だけでは同じ市区町村内の施設が重なってしまうため、
// 施設名から決定的に求めた小さなオフセットを加えて見分けられるようにする。
function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// 半径 ~900m 程度の円内に散らす（緯度1度≒111km換算）
export function jitterLatLng(seedKey, lat, lng, radiusDeg = 0.008) {
  const h = hashStr(seedKey)
  const angle = (h % 3600) / 3600 * Math.PI * 2
  const r = ((h >>> 12) % 1000) / 1000 * radiusDeg
  return { lat: lat + Math.sin(angle) * r, lng: lng + Math.cos(angle) * r / Math.cos(lat * Math.PI / 180) }
}
