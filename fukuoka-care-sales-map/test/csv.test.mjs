import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCsv, aggregateCsv, parseAmount, SAMPLE_CSV } from '../src/lib/csv.mjs'
import { resolveMunicipality } from '../src/lib/municipalities.mjs'

test('parseCsv はクォート内のカンマと改行を1フィールドとして扱う', () => {
  const rows = parseCsv('a,"b,c",d\n"e\nf",g,h')
  assert.deepEqual(rows, [['a', 'b,c', 'd'], ['e\nf', 'g', 'h']])
})

test('parseAmount は円記号・カンマ・全角数字を吸収する', () => {
  assert.equal(parseAmount('¥1,250,000'), 1250000)
  assert.equal(parseAmount('１２,０００'), 12000)
  assert.equal(parseAmount(''), 0)
  assert.equal(parseAmount('-'), 0)
  assert.equal(parseAmount('abc'), 0)
})

test('resolveMunicipality は区・市・町村の表記ゆれを吸収する', () => {
  assert.equal(resolveMunicipality('福岡市博多区').name, '福岡市博多区')
  assert.equal(resolveMunicipality(' 北九州市小倉北区 ').name, '北九州市小倉北区')
  assert.equal(resolveMunicipality('福岡県久留米市').name, '久留米市')
  assert.equal(resolveMunicipality('存在しない市'), null)
})

test('aggregateCsv は同一施設・同一自治体の売上を合算する', () => {
  const rows = parseCsv(SAMPLE_CSV)
  const result = aggregateCsv(rows)
  assert.equal(result.missingColumns, undefined)
  const sakura = result.facilities.find((f) => f.facility === 'さくら介護センター')
  assert.equal(sakura.sales, 1250000 + 980000)
  assert.equal(sakura.count, 2)
  assert.deepEqual(sakura.assignees, ['山田太郎'])
  assert.equal(result.facilities.length, 4)
  assert.equal(result.unresolvedMunicipalities.length, 0)
})

test('aggregateCsv は福岡県外・不明な自治体を未解決として報告する', () => {
  const csv = '施設名,自治体,担当者,売上\nテスト施設,東京都新宿区,山田,1000'
  const result = aggregateCsv(parseCsv(csv))
  assert.equal(result.facilities.length, 0)
  assert.equal(result.unresolvedMunicipalities[0].municipality, '東京都新宿区')
  assert.equal(result.skippedRows, 1)
})

test('aggregateCsv は必須列が見つからない場合に missingColumns を返す', () => {
  const csv = '名前,場所\nA,B'
  const result = aggregateCsv(parseCsv(csv))
  assert.ok(result.missingColumns.length > 0)
  assert.equal(result.facilities.length, 0)
})

test('aggregateCsv は完全な空行を無視する', () => {
  const csv = SAMPLE_CSV + '\n\n,,,\n'
  const result = aggregateCsv(parseCsv(csv))
  assert.equal(result.facilities.length, 4)
})
