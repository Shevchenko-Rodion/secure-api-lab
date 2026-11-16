const express = require('express');
const { users, documents, employees } = require('./data');

const app = express();
const PORT = 3000;

app.use(express.json());

// --- MIDDLEWARE ДЛЯ АУТЕНТИФИКАЦИИ И АВТОРИЗАЦИИ ---

const authMiddleware = (req, res, next) => {
  const login = req.headers['x-login'];
  const password = req.headers['x-password'];

  const user = users.find((u) => u.login === login && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: Invalid credentials' });
  }

  req.user = user;
  next();
};

const adminOnlyMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

// --- ЗАЩИЩЁННЫЕ МАРШРУТЫ ---

app.get('/documents', authMiddleware, (req, res) => {
  res.status(200).json(documents);
});

app.post('/documents', authMiddleware, (req, res) => {
  const newDocument = req.body;
  newDocument.id = Date.now();
  documents.push(newDocument);
  res.status(201).json(newDocument);
});

// Удаление документа (только для администратора)
app.delete('/documents/:id', authMiddleware, adminOnlyMiddleware, (req, res) => {
  const documentId = parseInt(req.params.id, 10);
  const index = documents.findIndex((doc) => doc.id === documentId);

  if (index === -1) {
    return res.status(404).json({ message: 'Document not found' });
  }

  documents.splice(index, 1);
  res.status(204).send();
});

app.get('/employees', authMiddleware, adminOnlyMiddleware, (req, res) => {
  res.status(200).json(employees);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});