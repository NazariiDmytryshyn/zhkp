import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { readFile, writeFile, mkdir } from 'fs/promises';
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

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Дозволено тільки зображення'));
  },
});

app.use(cors());
app.use(express.json());
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
  siteContent: {
    companyName: 'ПП "Наш Дім"',
    tagline: 'Онлайн сервіс підтримки мешканців',
    address: 'вул. Клима Савури, 3, м. Тернопіль, 46022',
    phone: '+380 (352) 24-34-75',
    email: 'info@nashdim-te.at.ua',
    hours: 'Пн–Чт: 8:00–17:15, Пт: 8:00–16:00',
    director: 'Дмитришин Анатолій Євгенович',
    founded: '2000',
    aboutText: 'Приватне підприємство "Наш Дім" — житлово-комунальне підприємство міста Тернопіль, зареєстроване у 2000 році. Підприємство забезпечує технічне обслуговування та управління житловим фондом, утримання будинків та прибудинкових територій. Керівник: Дмитришин Анатолій Євгенович.',
    aboutText2: 'Ми обслуговуємо житловий фонд через дочірні підприємства ДП "Наш Дім-2" та ДП "Наш Дім-3". Наша мета — швидко реагувати на заявки мешканців, підтримувати будівлі та прибудинкову територію в належному стані, надавати прозору інформацію про заплановані та виконані роботи.',
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

async function loadData() {
  try {
    const raw = await readFile(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    await saveData(defaultData);
    return defaultData;
  }
}

async function saveData(data) {
  await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

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
  res.json({ logo: data.logo, news: data.news, gallery: data.gallery, services: data.services || [], siteContent: data.siteContent || {} });
});

app.put('/api/admin/site-content', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  data.siteContent = { ...(data.siteContent || {}), ...req.body };
  await saveData(data);
  res.json({ ok: true });
});

app.post('/api/request', async (req, res) => {
  const data = await loadData();
  const requestData = {
    id: Date.now(),
    status: 'Нова',
    createdAt: new Date().toISOString(),
    ...req.body,
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
  const data = await loadData();
  const newsItem = { id: Date.now(), createdAt: new Date().toISOString(), ...req.body };
  data.news.unshift(newsItem);
  await saveData(data);
  res.json({ newsItem });
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
  const photo = { id: Date.now(), ...req.body };
  data.gallery.unshift(photo);
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
  const admin = { id: Date.now(), username, password, role };
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

/* ── Services ── */
app.post('/api/service-request', async (req, res) => {
  const data = await loadData();
  if (!data.serviceRequests) data.serviceRequests = [];
  const sr = { id: Date.now(), status: 'Нова', note: '', createdAt: new Date().toISOString(), ...req.body };
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

app.post('/api/admin/services', authMiddleware, requireSuperadmin, async (req, res) => {
  const data = await loadData();
  if (!data.services) data.services = [];
  const service = { id: Date.now(), ...req.body };
  data.services.push(service);
  await saveData(data);
  res.json({ service });
});

app.put('/api/admin/services/:id', authMiddleware, requireSuperadmin, async (req, res) => {
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

app.post('/api/admin/upload', authMiddleware, requireSuperadmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не завантажено' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`ЖЕКП API запущено на http://localhost:${port}`);
});
