// CSV取り込みまわりの純粋関数群。単一HTMLアプリからも Node のテストからも
// 同じ実装を import できるよう、ロジックをここに切り出している。
import { resolveMunicipality } from './municipalities.mjs'

// 単純な CSV パーサー（ダブルクォート囲み・クォート内カンマ/改行・""エスケープに対応）
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field); field = ''
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = ''
    } else {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }
  // 完全な空行（末尾の改行など）を除去
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

// UTF-8 として読めるかを見て、文字化けしていそうなら Shift_JIS で読み直す。
// 日本語の業務システムが出す CSV は Shift_JIS(CP932) のことが多いため。
export function decodeCsvBuffer(buffer) {
  const bytes = new Uint8Array(buffer)
  const hasBom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  if (hasBom || !utf8.includes('�')) return hasBom ? utf8.replace(/^﻿/, '') : utf8
  try {
    return new TextDecoder('shift_jis', { fatal: false }).decode(bytes)
  } catch {
    return utf8
  }
}

const HEADER_ALIASES = {
  facility: ['施設名', '施設', '事業所名', '事業所'],
  municipality: ['自治体', '市区町村', '市町村'],
  assignee: ['担当者', '担当', '営業担当', '営業担当者'],
  sales: ['売上', '売上高', '金額', '売上金額', '売上(円)', '売上（円）'],
}

const normHeader = (s) => String(s ?? '').normalize('NFKC').trim()

export function detectColumns(headerRow) {
  const cols = headerRow.map(normHeader)
  const find = (aliases) => {
    for (const alias of aliases) {
      const idx = cols.findIndex((c) => c === alias)
      if (idx >= 0) return idx
    }
    return -1
  }
  return {
    facility: find(HEADER_ALIASES.facility),
    municipality: find(HEADER_ALIASES.municipality),
    assignee: find(HEADER_ALIASES.assignee),
    sales: find(HEADER_ALIASES.sales),
  }
}

const FULLWIDTH_DIGITS = '０１２３４５６７８９'
export function parseAmount(input) {
  let s = String(input ?? '').normalize('NFKC').trim()
  s = s.replace(/[¥￥,\s]/g, '')
  if (s === '' || s === '-') return 0
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

// CSV全体を取り込み、施設×自治体単位で売上を集計する。
// 戻り値: { facilities, unresolvedMunicipalities, skippedRows, totalRows }
export function aggregateCsv(rows) {
  if (rows.length === 0) {
    return { facilities: [], unresolvedMunicipalities: [], skippedRows: 0, totalRows: 0, columns: null }
  }
  const [header, ...dataRows] = rows
  const columns = detectColumns(header)
  const missing = Object.entries(columns).filter(([, idx]) => idx < 0).map(([k]) => k)
  if (missing.length > 0) {
    return { facilities: [], unresolvedMunicipalities: [], skippedRows: 0, totalRows: dataRows.length, columns, missingColumns: missing }
  }

  const byKey = new Map()
  const unresolvedCounts = new Map()
  let skippedRows = 0

  for (const r of dataRows) {
    if (r.every((v) => normHeader(v) === '')) continue // 空行はスキップ（対象外カウントしない）
    const facility = normHeader(r[columns.facility])
    const municipalityRaw = normHeader(r[columns.municipality])
    const assignee = normHeader(r[columns.assignee])
    const sales = parseAmount(r[columns.sales])

    if (!facility || !municipalityRaw) { skippedRows++; continue }

    const muni = resolveMunicipality(municipalityRaw)
    if (!muni) {
      unresolvedCounts.set(municipalityRaw, (unresolvedCounts.get(municipalityRaw) || 0) + 1)
      skippedRows++
      continue
    }

    const key = `${facility}__${muni.name}`
    if (!byKey.has(key)) {
      byKey.set(key, { key, facility, municipality: muni.name, lat: muni.lat, lng: muni.lng, assignees: new Set(), sales: 0, count: 0 })
    }
    const entry = byKey.get(key)
    entry.sales += sales
    entry.count += 1
    if (assignee) entry.assignees.add(assignee)
  }

  const facilities = [...byKey.values()]
    .map((f) => ({ ...f, assignees: [...f.assignees] }))
    .sort((a, b) => a.municipality.localeCompare(b.municipality, 'ja') || b.sales - a.sales)

  const unresolvedMunicipalities = [...unresolvedCounts.entries()]
    .map(([municipality, count]) => ({ municipality, count }))
    .sort((a, b) => b.count - a.count)

  return { facilities, unresolvedMunicipalities, skippedRows, totalRows: dataRows.length, columns }
}

export const SAMPLE_CSV = [
  '施設名,自治体,担当者,売上',
  'さくら介護センター,福岡市博多区,山田太郎,1250000',
  'さくら介護センター,福岡市博多区,山田太郎,980000',
  'ひまわりケアホーム,北九州市小倉北区,佐藤花子,760000',
  'みどり園,久留米市,田中一郎,540000',
  'あさひホーム,飯塚市,鈴木次郎,320000',
].join('\n')
