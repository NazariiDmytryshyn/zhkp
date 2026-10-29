import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { readFile, writeFile, rename, mkdir, open, unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data.json');
const distPath = path.join(__dirname, '../dist');
const uploadsPath = path.join(__dirname, 'uploads');
const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, { cors: { origin: '*' } });
const sessions = new Map();

await mkdir(uploadsPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (imageMimeTypes.includes(file.mimetype) && imageExtensions.includes(ext)) cb(null, true);
    else cb(new Error('Дозволено тільки зображення: JPG, PNG, GIF, WebP, AVIF'));
  },
});

// Перевірка за вмістом файлу (сигнатура), а не лише за назвою — PDF з розширенням .jpg не пройде
async function isRealImage(filePath) {
  const fh = await open(filePath, 'r');
  try {
    const { buffer } = await fh.read(Buffer.alloc(16), 0, 16, 0);
    const hex = buffer.toString('hex');
    const ascii = buffer.toString('latin1');
    return (
      hex.startsWith('ffd8ff') ||                                   // JPEG
      hex.startsWith('89504e470d0a1a0a') ||                         // PNG
      ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a') ||   // GIF
      (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') || // WebP
      (ascii.slice(4, 8) === 'ftyp' && ascii.slice(8, 12).startsWith('avi')) // AVIF
    );
  } finally {
    await fh.close();
  }
}

const NEWS_TITLE_MAX = 100;
const NEWS_SUMMARY_MAX = 300;
const NEWS_CATEGORIES = ['out', 'work', 'ann', 'tar'];
const nonImageExt = /\.(pdf|docx?|xlsx?|pptx?|txt|zip|rar|svg|html?|js)$/i;

function validateNews(body, { partial = false } = {}) {
  if (!partial || body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) return 'Заголовок обов\'язковий';
    if (title.length > NEWS_TITLE_MAX) return `Заголовок не може бути довшим за ${NEWS_TITLE_MAX} символів`;
  }
  if (!partial || body.summary !== undefined) {
    const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
    if (!summary) return 'Короткий опис обов\'язковий';
    if (summary.length > NEWS_SUMMARY_MAX) return `Короткий опис не може бути довшим за ${NEWS_SUMMARY_MAX} символів`;
  }
  if (body.category !== undefined && body.category !== '' && !NEWS_CATEGORIES.includes(body.category)) {
    return 'Невірна категорія новини';
  }
  if (body.severity !== undefined && body.severity !== '' && !['emergency', 'planned'].includes(body.severity)) {
    return 'Невірний тип відключення';
  }
  for (const key of ['startsAt', 'endsAt']) {
    if (body[key] && Number.isNaN(Date.parse(body[key]))) return 'Невірна дата відключення';
  }
  if (body.category === 'out' && !partial && !body.endsAt) return 'Для відключення вкажіть, до коли воно триває';
  if (body.startsAt && body.endsAt && Date.parse(body.startsAt) > Date.parse(body.endsAt)) {
    return 'Початок відключення має бути раніше за кінець';
  }
  if (body.buildingIds !== undefined && !(Array.isArray(body.buildingIds) && body.buildingIds.every(Number.isFinite))) {
    return 'Невірний список будинків';
  }
  if (body.image) {
    if (typeof body.image !== 'string') return 'Невірне зображення';
    let pathname;
    try { pathname = new URL(body.image, 'http://local').pathname; } catch { return 'Невірне посилання на зображення'; }
    if (nonImageExt.test(pathname)) return 'Поле зображення приймає лише зображення (JPG, PNG, GIF, WebP, AVIF)';
  }
  return null;
}

const docMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const uploadDoc = multer({
  storage,
  defParamCharset: 'utf8', // інакше кириличні назви файлів перетворюються на кракозябри
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (docMimeTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Дозволені формати: PDF, DOC, DOCX, XLS, XLSX'));
  },
});

const docExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
// Звіти будинків: недопустимі файли не валять увесь запит, а збираються в req.rejected
const uploadReport = multer({
  storage,
  defParamCharset: 'utf8',
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (docExtensions.includes(ext) && (docMimeTypes.includes(file.mimetype) || file.mimetype === 'application/octet-stream')) return cb(null, true);
    (req.rejected ||= []).push(file.originalname);
    cb(null, false);
  },
});

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(uploadsPath));

const defaultData = {
  logo: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
  news: [
    {
      id: 1,
      title: 'Новий рух прибиральників',
      summary: 'Команда готова працювати для вашої чистоти. Розширюємо штат прибиральників для кращого обслуговування.',
      image: 'https://images.unsplash.com/photo-1581091870622-0b97f5b8db92?auto=format&fit=crop&w=900&q=80',
      createdAt: '2026-06-01T10:00:00.000Z',
    },
    {
      id: 2,
      title: 'Графік відключень води',
      summary: 'Актуальна інформація про планові роботи у вашому районі. Відключення заплановане на 12-13 червня.',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      createdAt: '2026-06-05T08:00:00.000Z',
    },
  ],
  gallery: [
    { id: 1, url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80' },
    { id: 2, url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80' },
    { id: 3, url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
  ],
  requests: [],
  services: [
    {
      id: 1,
      title: 'Автовишка',
      description: 'Надаємо послуги автовишки для робіт на висоті: монтаж освітлення, обрізка дерев, ремонт покрівлі та фасадів.',
      price: 'від 800 грн/год',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
      features: ['Висота підйому до 18 м', 'Оператор у вартості', 'Виїзд по місту та за містом'],
    },
    {
      id: 2,
      title: 'Прибирання після ремонту',
      description: 'Генеральне прибирання квартир, офісів та приміщень після будівельних і ремонтних робіт.',
      price: 'від 50 грн/м²',
      image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80',
      features: ['Квартири, офіси, приміщення', 'Хімчистка покриттів', 'Виїзд у той же день'],
    },
    {
      id: 3,
      title: 'Вивезення будівельного сміття',
      description: 'Швидке та зручне вивезення будівельного та великогабаритного сміття різних обсягів.',
      price: 'від 600 грн/рейс',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
      features: ['Вантажники у вартості', 'Різні обсяги', 'Оперативний виїзд'],
    },
    {
      id: 4,
      title: 'Аварійна служба',
      description: 'Цілодобова аварійна служба з усунення поломок сантехніки, електрики та інших неполадок.',
      price: 'від 350 грн/виклик',
      image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=900&q=80',
      features: ['Цілодобово 24/7', 'Виїзд до 30 хвилин', 'Сантехніка та електрика'],
    },
    {
      id: 5,
      title: 'Дезінфекція приміщень',
      description: 'Профілактична та знезаражуюча обробка квартир, офісів та підвалів сертифікованими засобами.',
      price: 'від 15 грн/м²',
      image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=900&q=80',
      features: ['Сертифіковані засоби', 'Безпечно для людей та тварин', 'Документ про обробку'],
    },
  ],
  serviceRequests: [],
  tariffs: [
    { id: 1, category: 'Утримання будинку', name: 'Технічне обслуговування', price: '4.80', unit: 'м²/міс' },
    { id: 2, category: 'Утримання будинку', name: 'Прибирання прибудинкової території', price: '1.20', unit: 'м²/міс' },
    { id: 3, category: 'Утримання будинку', name: 'Вивезення сміття', price: '0.80', unit: 'м²/міс' },
    { id: 4, category: 'Водопостачання', name: 'Холодна вода', price: '42.50', unit: 'м³' },
    { id: 5, category: 'Водопостачання', name: 'Водовідведення', price: '28.30', unit: 'м³' },
    { id: 6, category: 'Опалення', name: 'Опалення (сезон)', price: '38.00', unit: 'м²/міс' },
  ],
  emergencyContacts: [
    { id: 1, name: 'Диспетчерська служба', phone: '+380 (352) 24-34-75', description: 'Прийом заявок, загальні питання', available: 'Пн–Пт: 8:00–17:00' },
    { id: 2, name: 'Аварійна служба', phone: '+380 (352) 24-00-01', description: 'Аварії сантехніки та електрики', available: '24/7' },
    { id: 3, name: 'Газова служба', phone: '104', description: 'Витік газу, аварії газопостачання', available: '24/7' },
    { id: 4, name: 'Електромережі', phone: '105', description: 'Аварії електропостачання', available: '24/7' },
  ],
  documents: [],
  siteContent: {
    companyName: 'ПП "Наш Дім"',
    tagline: 'Онлайн сервіс підтримки мешканців',
    address: 'вул. Клима Савури, 3, м. Тернопіль, 46022',
    phone: '+380 (352) 24-34-75',
    email: 'info@nashdim-te.at.ua',
    hours: 'Пн–Чт: 8:00–17:15, Пт: 8:00–16:00',
    director: 'Дмитришин Анатолій Євгенович',
    founded: '2000',
    statHouses: '50',
    statResidents: '5000',
    statSatisfied: '98',
    heroTitle: 'Сучасний сервіс',
    heroAccent: 'для вашого будинку',
    heroDesc: 'Підтримка мешканців, оперативне реагування на заявки, актуальні новини та прозора інформація про роботи у вашому районі.',
    heroBadge2: '24/7 аварійна служба',
    heroBadge3: 'Понад 50 будинків',
    heroCard1Val: '~2 год',
    heroCard1Lbl: 'час реагування',
    heroCard2Val: '4.9 / 5',
    heroCard2Lbl: 'оцінка мешканців',
    aboutText: 'Приватне підприємство "Наш Дім" — житлово-комунальне підприємство міста Тернопіль, зареєстроване у 2000 році. Підприємство забезпечує технічне обслуговування та управління житловим фондом, утримання будинків та прибудинкових територій. Керівник: Дмитришин Анатолій Євгенович.',
    aboutText2: 'Ми обслуговуємо житловий фонд через дочірні підприємства ДП "Наш Дім-2" та ДП "Наш Дім-3". Наша мета — швидко реагувати на заявки мешканців, підтримувати будівлі та прибудинкову територію в належному стані, надавати прозору інформацію про заплановані та виконані роботи.',
  },
  sections: {
    about: true,
    news: true,
    gallery: true,
    services: true,
    tariffs: true,
    emergency: true,
    documents: true,
    request: true,
  },
  admins: [
    {
      id: 1,
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'changeme',
      role: 'superadmin',
    },
  ],
};

// База живе в пам'яті процесу: усі запити змінюють один і той самий об'єкт, тож одночасні
// запити не перетирають зміни одне одного. Файл читається один раз (після ручної правки
// data.json на сервері — перезапустити процес).
let cache = null;
let loading = null;

async function loadData() {
  if (cache) return cache;
  if (!loading) {
    loading = (async () => {
      let raw;
      try {
        raw = await readFile(dataPath, 'utf-8');
      } catch (err) {
        // Дефолтні дані створюємо лише якщо файлу справді немає — ніколи не перезаписуємо існуючу базу
        if (err.code !== 'ENOENT') throw err;
        cache = structuredClone(defaultData);
        await saveData(cache);
        return cache;
      }
      cache = JSON.parse(raw);
      return cache;
    })().finally(() => { loading = null; });
  }
  return loading;
}

// Записи йдуть строго по черзі, кожен — у власний тимчасовий файл, потім атомарний rename,
// щоб data.json ніколи не залишився обрізаним
let writeChain = Promise.resolve();
let writeSeq = 0;
function saveData(data) {
  cache = data;
  const run = writeChain.then(async () => {
    const tmpPath = `${dataPath}.${process.pid}.${++writeSeq}.tmp`;
    await writeFile(tmpPath, JSON.stringify(cache, null, 2), 'utf-8');
    await rename(tmpPath, dataPath);
  });
  writeChain = run.catch((err) => console.error('Не вдалося зберегти data.json:', err));
  return run;
}

// Унікальні зростаючі id (Date.now() + random давав збіги при масовому імпорті)
let lastId = 0;
const nextId = () => { lastId = Math.max(Date.now(), lastId + 1); return lastId; };

// Помилка в одному запиті не повинна вбивати весь сервер
process.on('unhandledRejection', (err) => console.error('Необроблена помилка:', err));

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Неавторизований доступ' });
  }
  req.admin = sessions.get(token);
  next();
}

function requireSuperadmin(req, res, next) {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ error: 'Доступ дозволено тільки супер-адміну' });
  }
  next();
}

app.get('/api/site', async (req, res) => {
  const data = await loadData();
  res.json({
    logo: data.logo,
    news: data.news,
    gallery: data.gallery,
    services: data.services || [],
    siteContent: data.siteContent || {},
    tariffs: data.tariffs || [],
    emergencyContacts: data.emergencyContacts || [],
    documents: data.documents || [],
    sections: data.sections || {},
  });
});

app.put('/api/admin/sections', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  data.sections = { ...(data.sections || {}), ...req.body };
  await saveData(data);
  res.json({ ok: true });
});

app.put('/api/admin/site-content', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  data.siteContent = { ...(data.siteContent || {}), ...req.body };
  await saveData(data);
  res.json({ ok: true });
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

app.post('/api/request', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().slice(0, 120) : '';
  if (!email) return res.status(400).json({ error: "Email обов'язковий" });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Невірний email' });
  const data = await loadData();
  const requestData = {
    id: nextId(),
    status: 'Нова',
    createdAt: new Date().toISOString(),
    ...req.body,
    email,
  };
  data.requests.unshift(requestData);
  await saveData(data);
  io.emit('new-request', requestData);
  res.json(requestData);
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Логін та пароль обов\'язкові' });
  }

  const data = await loadData();
  const admin = data.admins.find((item) => item.username === username && item.password === password);
  if (!admin) {
    return res.status(401).json({ error: 'Невірний логін або пароль' });
  }

  const token = crypto.randomUUID();
  sessions.set(token, { username: admin.username, role: admin.role });
  res.json({ token, user: { username: admin.username, role: admin.role } });
});

app.get('/api/admin/me', authMiddleware, (req, res) => {
  res.json({ user: req.admin });
});

app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  const data = await loadData();
  res.json({
    totalRequests: data.requests.length,
    newRequests: data.requests.filter((r) => r.status === 'Нова').length,
    inProgressRequests: data.requests.filter((r) => r.status === 'Взята в роботу').length,
    completedRequests: data.requests.filter((r) => r.status === 'Виконанна').length,
    rejectedRequests: data.requests.filter((r) => r.status === 'Відхиленна').length,
    totalNews: data.news.length,
    totalGallery: data.gallery.length,
    totalBuildings: (data.buildings || []).length,
  });
});

app.get('/api/admin/requests', authMiddleware, async (req, res) => {
  const data = await loadData();
  res.json({ requests: data.requests });
});

const statusTransitions = {
  'Нова': ['Взята в роботу', 'Відхиленна'],
  'Взята в роботу': ['Виконанна', 'Відхиленна'],
  'Відхиленна': [],
  'Виконанна': [],
};

app.patch('/api/admin/requests/:id/note', authMiddleware, async (req, res) => {
  const data = await loadData();
  const request = data.requests.find((item) => item.id === Number(req.params.id));
  if (!request) return res.status(404).json({ error: 'Заявку не знайдено' });
  request.note = req.body.note ?? '';
  await saveData(data);
  res.json({ request });
});

app.post('/api/admin/requests/:id/status', authMiddleware, async (req, res) => {
  const data = await loadData();
  const request = data.requests.find((item) => item.id === Number(req.params.id));
  if (!request) {
    return res.status(404).json({ error: 'Заявку не знайдено' });
  }

  const { status } = req.body;
  if (!status || !statusTransitions[request.status]?.includes(status)) {
    return res.status(400).json({ error: 'Невірний перехід статусу' });
  }

  request.status = status;
  await saveData(data);
  res.json({ request });
});

app.post('/api/admin/news', authMiddleware, requireSuperadmin, async (req, res) => {
  const error = validateNews(req.body);
  if (error) return res.status(400).json({ error });
  const data = await loadData();
  const newsItem = { id: nextId(), createdAt: new Date().toISOString(), ...req.body };
  data.news.unshift(newsItem);
  await saveData(data);
  res.json({ newsItem });
});

app.put('/api/admin/news/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const error = validateNews(req.body, { partial: true });
  if (error) return res.status(400).json({ error });
  const data = await loadData();
  const idx = data.news.findIndex((item) => item.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Новину не знайдено' });
  const { id, createdAt, ...changes } = req.body;
  data.news[idx] = { ...data.news[idx], ...changes, updatedAt: new Date().toISOString() };
  await saveData(data);
  res.json({ newsItem: data.news[idx] });
});

app.delete('/api/admin/news/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const index = data.news.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Новину не знайдено' });
  data.news.splice(index, 1);
  await saveData(data);
  res.json({ ok: true });
});

app.post('/api/admin/gallery', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const photo = { id: nextId(), ...req.body };
  data.gallery.unshift(photo);
  await saveData(data);
  res.json({ photo });
});

app.put('/api/admin/gallery/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const photo = data.gallery.find((item) => item.id === Number(req.params.id));
  if (!photo) return res.status(404).json({ error: 'Фото не знайдено' });
  for (const key of ['title', 'place', 'date']) {
    if (req.body[key] !== undefined) photo[key] = String(req.body[key]).slice(0, 120);
  }
  await saveData(data);
  res.json({ photo });
});

app.delete('/api/admin/gallery/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const index = data.gallery.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Фото не знайдено' });
  data.gallery.splice(index, 1);
  await saveData(data);
  res.json({ ok: true });
});

app.post('/api/admin/logo', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  data.logo = req.body.logo;
  await saveData(data);
  res.json({ logo: data.logo });
});

app.get('/api/admin/admins', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const admins = data.admins.map(({ password, ...rest }) => rest);
  res.json({ admins });
});

app.post('/api/admin/admins', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const { username, password, role = 'viewer' } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Логін та пароль обов\'язкові' });
  }
  if (!['viewer', 'superadmin', 'worker'].includes(role)) {
    return res.status(400).json({ error: 'Невірна роль адміністратора' });
  }
  if (data.admins.some((item) => item.username === username)) {
    return res.status(400).json({ error: 'Адмін з таким логіном вже існує' });
  }
  const admin = { id: nextId(), username, password, role };
  data.admins.push(admin);
  await saveData(data);
  res.json({ admin: { id: admin.id, username: admin.username, role: admin.role } });
});

app.delete('/api/admin/admins/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const index = data.admins.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Адміна не знайдено' });
  const superadminCount = data.admins.filter((a) => a.role === 'superadmin').length;
  if (data.admins[index].role === 'superadmin' && superadminCount === 1) {
    return res.status(400).json({ error: 'Не можна видалити єдиного суперадміна' });
  }
  data.admins.splice(index, 1);
  await saveData(data);
  res.json({ ok: true });
});

/* ── Buildings & tariffs ── */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const str = (v, max = 200) => (v === undefined || v === null ? '' : String(v).trim().slice(0, max));
const intOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};
const addrKey = (street, number) =>
  `${String(street).toLowerCase().replace(/[’ʼ'`-]/g, '').replace(/[.,№#/\\]/g, ' ').split(/\s+/)
    .filter((w) => w && !['вул', 'вулиця', 'просп', 'проспект', 'бульв', 'бульвар', 'пров', 'провулок', 'пл', 'площа'].includes(w))
    .join(' ')}|${String(number).toLowerCase().replace(/[\s-]/g, '')}`;

function sanitizePeriod(p) {
  if (!p || !ISO_DATE.test(String(p.from || ''))) throw new Error('Вкажіть дату початку дії тарифу (РРРР-ММ-ДД)');
  const parts = (Array.isArray(p.parts) ? p.parts : []).map((part) => {
    const rate = Number(String(part.rate).replace(',', '.'));
    if (!str(part.name)) throw new Error('У кожної складової тарифу має бути назва');
    if (!Number.isFinite(rate) || rate < 0) throw new Error(`Невірна ставка для «${str(part.name)}»`);
    return { name: str(part.name), rate: Math.round(rate * 10000) / 10000 };
  });
  if (!parts.length) throw new Error('Додайте хоча б одну складову тарифу');
  return {
    id: Number(p.id) || nextId(),
    from: p.from,
    decision: str(p.decision, 300),
    decisionUrl: str(p.decisionUrl, 500),
    parts,
  };
}

function sanitizeBuilding(body, existing = {}) {
  const b = {
    id: existing.id || nextId(),
    street: str(body.street ?? existing.street, 120),
    number: str(body.number ?? existing.number, 20),
    dp: str(body.dp ?? existing.dp, 80),
    floors: intOrNull(body.floors !== undefined ? body.floors : existing.floors),
    flats: intOrNull(body.flats !== undefined ? body.flats : existing.flats),
    lifts: intOrNull(body.lifts !== undefined ? body.lifts : existing.lifts),
    master: str(body.master ?? existing.master, 120),
    phone: str(body.phone ?? existing.phone, 40),
    aliases: (Array.isArray(body.aliases) ? body.aliases : existing.aliases || []).map((a) => str(a, 120)).filter(Boolean),
    tariffs: Array.isArray(body.tariffs) ? body.tariffs.map(sanitizePeriod) : existing.tariffs || [],
    // Звіти змінюються лише окремими маршрутами завантаження/видалення
    reports: existing.reports || [],
  };
  if (!b.street || !b.number) throw new Error('Вкажіть вулицю і номер будинку');
  const dates = b.tariffs.map((t) => t.from);
  if (new Set(dates).size !== dates.length) throw new Error('Два періоди тарифу не можуть починатися в один день');
  return b;
}

app.get('/api/buildings', async (req, res) => {
  const data = await loadData();
  res.json({ buildings: data.buildings || [] });
});

app.post('/api/admin/buildings', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  if (!data.buildings) data.buildings = [];
  let building;
  try { building = sanitizeBuilding(req.body); } catch (err) { return res.status(400).json({ error: err.message }); }
  if (data.buildings.some((b) => addrKey(b.street, b.number) === addrKey(building.street, building.number))) {
    return res.status(400).json({ error: 'Будинок з такою адресою вже є' });
  }
  data.buildings.push(building);
  await saveData(data);
  res.json({ building });
});

app.put('/api/admin/buildings/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const idx = (data.buildings || []).findIndex((b) => b.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Будинок не знайдено' });
  let building;
  try { building = sanitizeBuilding(req.body, data.buildings[idx]); } catch (err) { return res.status(400).json({ error: err.message }); }
  const key = addrKey(building.street, building.number);
  if (data.buildings.some((b, i) => i !== idx && addrKey(b.street, b.number) === key)) {
    return res.status(400).json({ error: 'Будинок з такою адресою вже є' });
  }
  data.buildings[idx] = building;
  await saveData(data);
  res.json({ building });
});

app.delete('/api/admin/buildings/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const idx = (data.buildings || []).findIndex((b) => b.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Будинок не знайдено' });
  data.buildings.splice(idx, 1);
  await saveData(data);
  res.json({ ok: true });
});

/* ── Звіти та документи будинків ── */
const STREET_WORDS = new Set(['вул', 'вулиця', 'просп', 'проспект', 'бульв', 'бульвар', 'пров', 'провулок', 'пл', 'площа']);
const streetTokens = (s) => String(s).toLowerCase().replace(/[’ʼ'`-]/g, '').replace(/[.,№#/\\_]/g, ' ')
  .split(/\s+/).filter((w) => w && !STREET_WORDS.has(w));
// Латинську «a» в номері (16a) вважаємо кириличною «а»
const houseNumber = (n) => String(n).toLowerCase().replace(/[\s-]/g, '').replace(/a/g, 'а');

// «Героїв Крут 5.pdf», «вул. Клима Савури, 3.pdf», «К.Савури 3.pdf» → { street, number }
function parseReportName(filename) {
  const base = filename.replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim();
  // Рік у кінці назви («Героїв Крут 5 2026.pdf») — не номер будинку
  const m = base.match(/^(.*?)[\s,]*(\d+\s*[a-zа-яіїєґ]?)(?:[\s,._-]+(?:19|20)\d{2}(?:\s*р\.?)?)?\s*$/i);
  if (!m || !streetTokens(m[1]).length) return null;
  return { street: m[1], number: houseNumber(m[2]) };
}

// Точний збіг вулиці, або скорочення: кожне слово з файлу — початок слова вулиці по порядку («К.Савури» → «Клима Савури»)
function streetMatch(fileTokens, streetWords) {
  if (fileTokens.join(' ') === streetWords.join(' ')) return 'exact';
  let j = 0;
  for (const t of fileTokens) {
    while (j < streetWords.length && !streetWords[j].startsWith(t)) j += 1;
    if (j === streetWords.length) return null;
    j += 1;
  }
  return fileTokens.some((t) => streetWords.includes(t)) ? 'short' : null;
}

function findBuildingForFile(filename, buildings) {
  const parsed = parseReportName(filename);
  if (!parsed) return { error: 'у назві немає вулиці й номера будинку (приклад: «Героїв Крут 5.pdf»)' };
  const tokens = streetTokens(parsed.street);
  const hits = [];
  for (const b of buildings) {
    if (houseNumber(b.number) !== parsed.number) continue;
    const kinds = [b.street, ...(b.aliases || [])].map((s) => streetMatch(tokens, streetTokens(s))).filter(Boolean);
    if (kinds.length) hits.push({ b, exact: kinds.includes('exact') });
  }
  const exact = hits.filter((h) => h.exact);
  const list = exact.length ? exact : hits;
  if (list.length === 1) return { building: list[0].b };
  if (!list.length) return { error: `не знайдено будинок «${parsed.street.trim()}, ${parsed.number}» — перевірте назву вулиці й номер` };
  return { error: `назва підходить до кількох будинків (${list.map((h) => `${h.b.street}, ${h.b.number}`).join('; ')}) — уточніть вулицю` };
}

// Рік звіту обов'язковий: від 2000 до наступного року
function parseReportYear(v) {
  const year = Number(v);
  return Number.isInteger(year) && year >= 2000 && year <= new Date().getFullYear() + 1 ? year : null;
}

// «Героїв Крут 5.pdf» + 2026 → «Героїв Крут 5 2026.pdf» (якщо року в назві ще немає)
function withYear(filename, year) {
  const ext = path.extname(filename);
  const base = filename.slice(0, filename.length - ext.length).trim();
  return new RegExp(`(^|\\D)${year}(\\D|$)`).test(base) ? filename : `${base} ${year}${ext.toLowerCase()}`;
}

// Звіт за той самий рік у будинку замінюється новим файлом, інакше додається
function attachReport(building, file, year) {
  if (!building.reports) building.reports = [];
  const report = {
    id: nextId(),
    year,
    title: `${year} рік — звіт`,
    url: `/uploads/${file.filename}`,
    originalName: withYear(file.originalname, year),
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
  const at = building.reports.findIndex((r) => r.year === year);
  if (at === -1) building.reports.push(report);
  else building.reports[at] = { ...report, id: building.reports[at].id };
  return at === -1 ? 'added' : 'replaced';
}

const reportUpload = (field, many) => (req, res, next) => {
  const mw = many ? uploadReport.array(field, 50) : uploadReport.single(field);
  mw(req, res, (err) => {
    if (!err) return next();
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Файл більший за 20 МБ' : err.message;
    res.status(400).json({ error: msg });
  });
};

app.post('/api/admin/buildings/:id/reports', authMiddleware, requireSuperadmin, reportUpload('file', false), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: req.rejected?.length ? 'Дозволені формати: PDF, DOC, DOCX, XLS, XLSX' : 'Файл не завантажено' });
  }
  const year = parseReportYear(req.body.year);
  if (!year) { await unlink(req.file.path).catch(() => {}); return res.status(400).json({ error: 'Вкажіть рік звіту' }); }
  const data = await loadData();
  const building = (data.buildings || []).find((b) => b.id === Number(req.params.id));
  if (!building) { await unlink(req.file.path).catch(() => {}); return res.status(404).json({ error: 'Будинок не знайдено' }); }
  const status = attachReport(building, req.file, year);
  await saveData(data);
  res.json({ building, status });
});

// Масове завантаження: кожен файл іде в будинок за своєю назвою; невдалі пропускаються з поясненням
app.post('/api/admin/buildings/reports/bulk', authMiddleware, requireSuperadmin, reportUpload('files', true), async (req, res) => {
  const year = parseReportYear(req.body.year);
  if (!year) {
    await Promise.all((req.files || []).map((f) => unlink(f.path).catch(() => {})));
    return res.status(400).json({ error: 'Вкажіть рік звіту' });
  }
  const data = await loadData();
  const buildings = data.buildings || [];
  const uploaded = [];
  const skipped = (req.rejected || []).map((file) => ({ file, reason: 'непідтримуваний формат (дозволені PDF, DOC, DOCX, XLS, XLSX)' }));
  for (const file of req.files || []) {
    const { building, error } = findBuildingForFile(file.originalname, buildings);
    if (!building) {
      skipped.push({ file: file.originalname, reason: error });
      await unlink(file.path).catch(() => {});
      continue;
    }
    const status = attachReport(building, file, year);
    uploaded.push({ file: file.originalname, building: `${building.street}, ${building.number}`, buildingId: building.id, status });
  }
  if (uploaded.length) await saveData(data);
  res.json({ uploaded, skipped });
});

app.delete('/api/admin/buildings/:id/reports/:reportId', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const building = (data.buildings || []).find((b) => b.id === Number(req.params.id));
  if (!building) return res.status(404).json({ error: 'Будинок не знайдено' });
  const before = (building.reports || []).length;
  building.reports = (building.reports || []).filter((r) => r.id !== Number(req.params.reportId));
  if (building.reports.length === before) return res.status(404).json({ error: 'Документ не знайдено' });
  await saveData(data);
  res.json({ building });
});

// Імпорт з Excel (рядки вже розібрані в браузері). Ніколи не видаляє будинки:
// знайдений за адресою — оновлюється, новий — додається; період з тією ж датою — замінюється.
app.post('/api/admin/buildings/import', authMiddleware, requireSuperadmin, async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : null;
  if (!items || !items.length) return res.status(400).json({ error: 'Немає рядків для імпорту' });
  const data = await loadData();
  if (!data.buildings) data.buildings = [];
  const index = new Map(data.buildings.map((b) => [addrKey(b.street, b.number), b]));
  const result = { created: 0, updated: 0, periods: 0, errors: [] };
  const next = data.buildings.map((b) => ({ ...b, tariffs: [...(b.tariffs || [])] }));
  const byId = new Map(next.map((b) => [b.id, b]));

  items.forEach((item, i) => {
    const row = item.row || i + 2;
    try {
      const key = addrKey(item.street || '', item.number || '');
      const found = index.get(key);
      const info = {};
      for (const k of ['street', 'number', 'dp', 'master', 'phone']) if (str(item[k])) info[k] = item[k];
      for (const k of ['floors', 'flats', 'lifts']) if (intOrNull(item[k]) !== null) info[k] = item[k];
      let target;
      if (found) {
        target = byId.get(found.id);
        Object.assign(target, sanitizeBuilding(info, target));
        result.updated += 1;
      } else {
        target = sanitizeBuilding(info);
        next.push(target);
        byId.set(target.id, target);
        index.set(key, target);
        result.created += 1;
      }
      if (item.period) {
        const period = sanitizePeriod(item.period);
        const at = target.tariffs.findIndex((t) => t.from === period.from);
        if (at === -1) target.tariffs.push(period);
        else target.tariffs[at] = { ...period, id: target.tariffs[at].id };
        result.periods += 1;
      }
    } catch (err) {
      result.errors.push(`Рядок ${row}: ${err.message}`);
    }
  });

  if (result.errors.length) return res.status(400).json({ error: 'Імпорт скасовано — виправте помилки у файлі', details: result.errors.slice(0, 20) });
  data.buildings = next;
  await saveData(data);
  res.json(result);
});

/* ── Services ── */
app.post('/api/service-request', async (req, res) => {
  const data = await loadData();
  if (!data.serviceRequests) data.serviceRequests = [];
  const sr = { id: nextId(), status: 'Нова', note: '', createdAt: new Date().toISOString(), ...req.body };
  data.serviceRequests.unshift(sr);
  await saveData(data);
  io.emit('new-service-request', sr);
  res.json(sr);
});

app.get('/api/admin/service-requests', authMiddleware, async (req, res) => {
  const data = await loadData();
  res.json({ serviceRequests: data.serviceRequests || [] });
});

app.post('/api/admin/service-requests/:id/status', authMiddleware, async (req, res) => {
  const data = await loadData();
  const sr = (data.serviceRequests || []).find(i => i.id === Number(req.params.id));
  if (!sr) return res.status(404).json({ error: 'Заявку не знайдено' });
  const { status } = req.body;
  if (!statusTransitions[sr.status]?.includes(status)) {
    return res.status(400).json({ error: 'Невірний перехід статусу' });
  }
  sr.status = status;
  await saveData(data);
  res.json({ serviceRequest: sr });
});

app.patch('/api/admin/service-requests/:id/note', authMiddleware, async (req, res) => {
  const data = await loadData();
  const sr = (data.serviceRequests || []).find(i => i.id === Number(req.params.id));
  if (!sr) return res.status(404).json({ error: 'Заявку не знайдено' });
  sr.note = req.body.note ?? '';
  await saveData(data);
  res.json({ serviceRequest: sr });
});

const SERVICE_CATEGORIES = ['plumbing', 'electric', 'greenery', 'other'];

function validateServiceCategory(body) {
  if (body.category === undefined || body.category === '') return null;
  return SERVICE_CATEGORIES.includes(body.category) ? null : 'Невірна категорія послуги';
}

app.post('/api/admin/services', authMiddleware, requireSuperadmin, async (req, res) => {
  const error = validateServiceCategory(req.body);
  if (error) return res.status(400).json({ error });
  const data = await loadData();
  if (!data.services) data.services = [];
  const service = { id: nextId(), ...req.body };
  data.services.push(service);
  await saveData(data);
  res.json({ service });
});

// Імпорт прайс-листа з Excel. Ніколи не видаляє: послуга з тією ж назвою в категорії оновлюється
// (лише поля з файлу — опис, фото, переваги лишаються), нова — додається в кінець.
app.post('/api/admin/services/import', authMiddleware, requireSuperadmin, async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : null;
  if (!items || !items.length) return res.status(400).json({ error: 'Немає рядків для імпорту' });
  const errors = [];
  const clean = items.map((it, i) => {
    const row = it.row || i + 2;
    const title = str(it.title, 200);
    const category = str(it.category, 20) || 'other';
    if (!title) errors.push(`Рядок ${row}: немає назви`);
    if (!SERVICE_CATEGORIES.includes(category)) errors.push(`Рядок ${row}: невідома категорія`);
    return { title, category, group: str(it.group, 120), unit: str(it.unit, 40), price: str(it.price, 60), summary: str(it.summary, 220) };
  });
  if (errors.length) return res.status(400).json({ error: 'Імпорт скасовано — виправте помилки у файлі', details: errors.slice(0, 20) });

  const data = await loadData();
  if (!data.services) data.services = [];
  const key = (s) => `${s.category || 'other'}|${String(s.title).trim().toLowerCase().replace(/\s+/g, ' ')}`;
  const index = new Map(data.services.map((s) => [key(s), s]));
  let created = 0, updated = 0;
  clean.forEach((it, i) => {
    const found = index.get(key(it));
    if (found) {
      for (const k of ['group', 'unit', 'price', 'summary']) if (it[k]) found[k] = it[k];
      updated += 1;
    } else {
      const s = { id: nextId(), ...it, description: '', image: '', features: [], uses: [], specs: [] };
      data.services.push(s);
      index.set(key(s), s);
      created += 1;
    }
  });
  await saveData(data);
  res.json({ created, updated });
});

app.put('/api/admin/services/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const error = validateServiceCategory(req.body);
  if (error) return res.status(400).json({ error });
  const data = await loadData();
  const idx = (data.services || []).findIndex(s => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Послугу не знайдено' });
  data.services[idx] = { ...data.services[idx], ...req.body, id: data.services[idx].id };
  await saveData(data);
  res.json({ service: data.services[idx] });
});

app.delete('/api/admin/services/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const idx = (data.services || []).findIndex(s => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Послугу не знайдено' });
  data.services.splice(idx, 1);
  await saveData(data);
  res.json({ ok: true });
});

app.post('/api/admin/upload', authMiddleware, requireSuperadmin, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Файл не завантажено' });
    if (!(await isRealImage(req.file.path))) {
      await unlink(req.file.path).catch(() => {});
      return res.status(400).json({ error: 'Файл не є зображенням' });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
  });
});

/* ── Tariffs ── */
app.post('/api/admin/tariffs', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  if (!data.tariffs) data.tariffs = [];
  const tariff = { id: nextId(), ...req.body };
  data.tariffs.push(tariff);
  await saveData(data);
  res.json({ tariff });
});

app.put('/api/admin/tariffs/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const idx = (data.tariffs || []).findIndex(t => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Тариф не знайдено' });
  data.tariffs[idx] = { ...data.tariffs[idx], ...req.body, id: data.tariffs[idx].id };
  await saveData(data);
  res.json({ tariff: data.tariffs[idx] });
});

app.delete('/api/admin/tariffs/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const idx = (data.tariffs || []).findIndex(t => t.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Тариф не знайдено' });
  data.tariffs.splice(idx, 1);
  await saveData(data);
  res.json({ ok: true });
});

/* ── Emergency Contacts ── */
app.post('/api/admin/emergency-contacts', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  if (!data.emergencyContacts) data.emergencyContacts = [];
  const contact = { id: nextId(), ...req.body };
  data.emergencyContacts.push(contact);
  await saveData(data);
  res.json({ contact });
});

app.put('/api/admin/emergency-contacts/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const idx = (data.emergencyContacts || []).findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Контакт не знайдено' });
  data.emergencyContacts[idx] = { ...data.emergencyContacts[idx], ...req.body, id: data.emergencyContacts[idx].id };
  await saveData(data);
  res.json({ contact: data.emergencyContacts[idx] });
});

app.delete('/api/admin/emergency-contacts/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const idx = (data.emergencyContacts || []).findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Контакт не знайдено' });
  data.emergencyContacts.splice(idx, 1);
  await saveData(data);
  res.json({ ok: true });
});

/* ── Documents ── */
app.post('/api/admin/documents', authMiddleware, requireSuperadmin, uploadDoc.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не завантажено' });
  const data = await loadData();
  if (!data.documents) data.documents = [];
  const doc = {
    id: nextId(),
    name: req.body.name || req.file.originalname,
    originalName: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
  };
  data.documents.push(doc);
  await saveData(data);
  res.json({ doc });
});

app.delete('/api/admin/documents/:id', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  const idx = (data.documents || []).findIndex(d => d.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Документ не знайдено' });
  data.documents.splice(idx, 1);
  await saveData(data);
  res.json({ ok: true });
});

app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`ЖЕКП API запущено на http://localhost:${port}`);
});
