// edit this array at the top if you wanna add or swap ayahs
const REFERENCES = [
  '2:152', '2:153', '2:127', '2:158', '2:201', '3:96', '3:97', '3:139',
  '5:2', '13:28', '14:7', '14:40', '16:128', '20:25', '22:27', '25:74',
  '39:53', '40:60', '49:10', '55:13', '65:3', '93:3', '93:5', '94:5',
  '94:6', '106:3', '106:4', '108:2', '2:186', '2:286', '9:51'
];

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const limitsPath = path.resolve(__dirname, '../src/data/ayahLimits.json');
const outputPath = path.resolve(__dirname, '../src/data/ayahs.json');

const limits = JSON.parse(fs.readFileSync(limitsPath, 'utf8'));

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
  console.log(`Building fallback ayahs from ${REFERENCES.length} references...`);
  const validAyahs = [];
  const skipped = [];

  for (const ref of REFERENCES)
  {
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
        surah,
        surahNameEn,
        surahNameAr,
        numberInSurah,
        arabic,
        english
      });

      // chill for 80ms so the api doesn't get cranky
      await new Promise(r => setTimeout(r, 80));
    }
    catch (err)
    {
      skipped.push({ ref, reason: `Fetch error: ${err.message}` });
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(validAyahs, null, 2), 'utf8');

  console.log('\n--- Skipped References ---');
  for (const item of skipped)
    console.log(`- ${item.ref}: ${item.reason}`);

  console.log(`\nSuccessfully saved ${validAyahs.length} passing ayahs to ${outputPath}`);
}

main();
