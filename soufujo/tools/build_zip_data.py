#!/usr/bin/env python3
"""日本郵便の郵便番号データから、書類送付状作成アプリ用の検索データを作る。

使い方（リポジトリの直下で実行）:
    python3 soufujo/tools/build_zip_data.py <utf_ken_all.zip または ken_all.zip / .csv> [出力フォルダ]
    出力フォルダを省略すると soufujo/zip/ に書き出す。

入力データの入手先（日本郵便「郵便番号データダウンロード」）:
    https://www.post.japanpost.jp/zipcode/download.html
    おすすめ: 「住所の郵便番号（1レコード1行、UTF-8形式）」の全国一括 utf_ken_all.zip
    従来形式（Shift_JIS、長い町域が複数行に分かれる ken_all.zip）にも対応する。

出力（soufujo/zip/ に作る。アプリが必要な都道府県のファイルだけを読み込む）:
    index.json  … 都道府県名の一覧、郵便番号の上3桁→都道府県コード、データの日付
    01.json〜47.json … 都道府県ごとの [郵便番号, 市区町村の番号, 町域, 補足] の一覧

町域の整え方:
    「以下に掲載がない場合」「〇〇の次に番地がくる場合」「〇〇一円」は町域なし（市区町村だけ）にする。
    （ ）内の番地の範囲などは「補足」に分け、町域からは外す（候補を選ぶときの表示に使う）。
"""
import csv
import io
import json
import os
import re
import sys
import zipfile
from datetime import datetime

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'zip')

PREFS = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県',
    '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
    '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県',
    '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]


def read_source(path):
    """CSV の行（列のリスト）と、データの日付（ファイルの日付）を返す。"""
    if path.lower().endswith('.zip'):
        with zipfile.ZipFile(path) as zf:
            names = [n for n in zf.namelist() if n.lower().endswith('.csv')]
            if not names:
                raise SystemExit('zip の中に CSV がありません: ' + path)
            info = zf.getinfo(names[0])
            raw = zf.read(info)
            stamp = datetime(*info.date_time).strftime('%Y-%m-%d')
    else:
        with open(path, 'rb') as f:
            raw = f.read()
        stamp = datetime.fromtimestamp(os.path.getmtime(path)).strftime('%Y-%m-%d')
    try:
        text = raw.decode('utf-8-sig')
        multiline = False          # UTF-8 版は 1レコード1行
    except UnicodeDecodeError:
        text = raw.decode('cp932')
        multiline = True           # 従来版は長い町域が複数行に分かれることがある
    rows = list(csv.reader(io.StringIO(text)))
    return rows, stamp, multiline


def merge_multiline(rows):
    """従来形式で、町域の（ ）が次の行に続いているレコードを1行にまとめる。"""
    merged = []
    buf = None
    for r in rows:
        if buf is not None:
            buf[8] += r[8]
            buf[5] += r[5]
            if buf[8].count('（') <= buf[8].count('）'):
                merged.append(buf)
                buf = None
            continue
        if r[8].count('（') > r[8].count('）'):
            buf = list(r)
            continue
        merged.append(r)
    if buf is not None:
        merged.append(buf)
    return merged


def clean_town(town):
    """町域名から、表示用の町域と補足（括弧の中）を取り出す。"""
    # 「以下に掲載がない場合」「〇〇の次に番地がくる場合」「〇〇一円」は、市区町村全体を表す
    if town == '以下に掲載がない場合' or town.endswith('の次に番地がくる場合') or town.endswith('一円'):
        return '', ''
    note = ''
    m = re.search(r'（(.*)）', town)
    if m:
        note = m.group(1)
        town = (town[:m.start()] + town[m.end():]).strip()
    if note in ('次のビルを除く', '地階・階層不明'):
        note = ''
    return town, note


def main():
    if len(sys.argv) not in (2, 3):
        raise SystemExit(__doc__)
    out_dir = sys.argv[2] if len(sys.argv) == 3 else OUT_DIR
    rows, stamp, multiline = read_source(sys.argv[1])
    rows = [r for r in rows if len(r) >= 9]
    if multiline:
        rows = merge_multiline(rows)

    by_pref = {}
    prefix = {}
    for r in rows:
        zip7 = r[2].strip()
        pref = r[6].strip()
        city = r[7].strip()
        if not re.fullmatch(r'\d{7}', zip7) or pref not in PREFS:
            continue
        code = PREFS.index(pref) + 1
        town, note = clean_town(r[8].strip())
        data = by_pref.setdefault(code, {'cities': [], 'cityIndex': {}, 'rows': [], 'seen': set()})
        if city not in data['cityIndex']:
            data['cityIndex'][city] = len(data['cities'])
            data['cities'].append(city)
        key = (zip7, city, town, note)
        if key in data['seen']:
            continue
        data['seen'].add(key)
        row = [zip7, data['cityIndex'][city], town]
        if note:
            row.append(note)
        data['rows'].append(row)
        codes = prefix.setdefault(zip7[:3], [])
        if code not in codes:
            codes.append(code)

    os.makedirs(out_dir, exist_ok=True)
    total = 0
    for code, data in sorted(by_pref.items()):
        out = {'pref': PREFS[code - 1], 'cities': data['cities'], 'rows': data['rows']}
        with open(os.path.join(out_dir, '%02d.json' % code), 'w', encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
        total += len(data['rows'])
    index = {
        'updated': stamp,
        'prefs': PREFS,
        'prefix': {k: (v[0] if len(v) == 1 else v) for k, v in sorted(prefix.items())},
    }
    with open(os.path.join(out_dir, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, separators=(',', ':'))
    print('都道府県 %d ファイル、%d 件（データの日付 %s）を %s に書き出しました。'
          % (len(by_pref), total, stamp, os.path.normpath(out_dir)))


if __name__ == '__main__':
    main()
