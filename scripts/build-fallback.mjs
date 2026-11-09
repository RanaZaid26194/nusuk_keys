// edit this array at the top if you wanna add or swap ayahs
const REFERENCES = [
  // Existing 31 references
  '2:152', '2:153', '2:127', '2:158', '2:201', '3:96', '3:97', '3:139',
  '5:2', '13:28', '14:7', '14:40', '16:128', '20:25', '22:27', '25:74',
  '39:53', '40:60', '49:10', '55:13', '65:3', '93:3', '93:5', '94:5',
  '94:6', '106:3', '106:4', '108:2', '2:186', '2:286', '9:51',

  // User-requested ranges and singles (themes: mercy, hope, patience, gratitude, trust, brotherhood, Hajj/Kaaba)
  '93:1-11', '94:1-8', '103:1-3', '106:1-4', '108:1-3', '110:1-3',
  '112:1-4', '113:1-5', '114:1-6', '1:2-7', '55:13', '55:60', '99:7',
  '91:9', '87:14', '73:8', '33:41', '49:10-13', '25:63-77', '21:83',
  '21:87', '18:10', '17:24', '2:127-129', '2:199', '22:30', '22:32',
  '2:201', '14:35-37', '3:8', '2:200',

  // Curated thematic additions (mercy, hope, patience, gratitude, trust in Allah, brotherhood, Hajj/Kaaba, prayer)
  '7:156', '15:49', '12:87', '12:92', '21:107', '27:73', '4:110', '3:133',
  '3:134', '3:135', '3:159', '16:18', '27:19', '46:15', '31:12', '33:42',
  '62:10', '3:173', '3:174', '3:160', '8:2', '9:129', '11:123', '25:58',
  '26:217', '67:29', '2:45', '2:155', '2:156', '2:157', '3:200', '11:115',
  '12:86', '16:96', '16:97', '39:10', '70:5', '2:195', '3:148', '16:90',
  '17:23', '17:53', '41:34', '2:125', '2:126', '2:197', '2:198', '2:202',
  '5:97', '14:41', '22:26', '22:28', '22:29', '2:250', '3:16', '3:191',
  '3:193', '3:194', '7:23', '10:85', '10:86', '20:114', '21:89', '23:118',
  '28:16', '28:24', '59:10', '60:4', '20:26', '20:27', '26:83', '26:84',
  '26:85', '26:87', '26:88', '26:89', '42:19', '42:28', '50:16'
];

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const limitsPath = path.resolve(__dirname, '../src/data/ayahLimits.json');
const outputPath = path.resolve(__dirname, '../src/data/ayahs.json');

const limits = JSON.parse(fs.readFileSync(limitsPath, 'utf8'));

// expand range like "93:1-11" into ["93:1", "93:2", ... "93:11"]
export function expandReference(ref)
{
  const match = ref.match(/^(\d+):(\d+)-(\d+)$/);
  if (match)
  {
    const surah = parseInt(match[1], 10);
    const start = parseInt(match[2], 10);
    const end = parseInt(match[3], 10);
    const list = [];
    for (let i = start; i <= end; i++)
      list.push(`${surah}:${i}`);
    return list;
  }
  return [ref];
}

async function fetchAyah(ref)
{
  const url = `https://api.alquran.cloud/v1/ayah/${ref}/editions/quran-uthmani,en.sahih`;
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200 || !Array.isArray(json.data))
    throw new Error(`Invalid response for ${ref}`);
  return json.data;
}

async function main()
{
  // expand all input references
  const allRefs = [];
  for (const r of REFERENCES)
    allRefs.push(...expandReference(r));

  console.log(`Building fallback ayahs from ${allRefs.length} expanded candidates (${REFERENCES.length} declared entries)...`);

  const seen = new Set();
  const validAyahs = [];
  const skipped = [];

  for (const ref of allRefs)
  {
    // rule 5: skip duplicates
    if (seen.has(ref))
    {
      skipped.push({ ref, reason: 'duplicate reference' });
      continue;
    }
    seen.add(ref);

    // rule 5: skip numberInSurah === 1 (bismillah / surah opener)
    const [surahNumStr, ayahNumStr] = ref.split(':');
    if (parseInt(ayahNumStr, 10) === 1)
    {
      skipped.push({ ref, reason: 'numberInSurah is 1 (skipping bismillah/openers)' });
      continue;
    }

    try
    {
      const data = await fetchAyah(ref);
      const uthmani = data.find(e => e.edition?.identifier === 'quran-uthmani');
      const sahih = data.find(e => e.edition?.identifier === 'en.sahih');

      if (!uthmani || !sahih)
      {
        skipped.push({ ref, reason: 'missing uthmani or en.sahih edition' });
        continue;
      }

      const arabic = (uthmani.text || '').trim();
      const english = (sahih.text || '').trim();
      const numberInSurah = uthmani.numberInSurah;
      const surah = uthmani.surah?.number;
      const surahNameEn = uthmani.surah?.englishName || '';
      const surahNameAr = uthmani.surah?.name || '';

      if (numberInSurah === 1)
      {
        skipped.push({ ref, reason: 'numberInSurah is 1 (skipping bismillah/openers)' });
        continue;
      }

      if (arabic.length < limits.arabicMin)
      {
        skipped.push({ ref, reason: `Arabic too short (${arabic.length} < ${limits.arabicMin})` });
        continue;
      }

      if (arabic.length > limits.arabicMax)
      {
        skipped.push({ ref, reason: `Arabic too long (${arabic.length} > ${limits.arabicMax})` });
        continue;
      }

      if (english.length > limits.englishMax)
      {
        skipped.push({ ref, reason: `English too long (${english.length} > ${limits.englishMax})` });
        continue;
      }

      validAyahs.push({
        ref: `${surah}:${numberInSurah}`,
        surah,
        surahNameEn,
        surahNameAr,
        numberInSurah,
        arabic,
        english
      });

      // pace requests so api doesn't get flooded
      await new Promise(r => setTimeout(r, 65));
    }
    catch (err)
    {
      skipped.push({ ref, reason: `Fetch error: ${err.message}` });
    }
  }

  // write valid ayahs to file (strip internal ref key to match exact format)
  const fileData = validAyahs.map(({ ref, ...rest }) => rest);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(fileData, null, 2), 'utf8');

  console.log(`\n======================================================`);
  console.log(`COMPACT REVIEW LIST (${validAyahs.length} PASSING AYAHS)`);
  console.log(`======================================================`);
  for (let i = 0; i < validAyahs.length; i++)
  {
    const item = validAyahs[i];
    console.log(`${(i + 1).toString().padStart(3, ' ')}. [${item.ref} ${item.surahNameEn}] ${item.english}`);
  }

  console.log(`\n======================================================`);
  console.log(`SKIPPED LIST (${skipped.length} ENTRIES) WITH REASONS`);
  console.log(`======================================================`);
  for (const item of skipped)
    console.log(`- ${item.ref}: ${item.reason}`);

  console.log(`\n======================================================`);
  console.log(`SUMMARY RESULT:`);
  console.log(`Total passing entries written to ayahs.json: ${fileData.length}`);
  console.log(`Total skipped entries: ${skipped.length}`);
  console.log(`======================================================\n`);
}

main().catch(console.error);
