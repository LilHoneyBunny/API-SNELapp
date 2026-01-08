require("dotenv").config();
const express = require("express");
const cors = require("cors");

const hpm = require("http-proxy-middleware");
// ✅ compatible con export default / named export
const createProxyMiddleware = hpm.createProxyMiddleware || hpm;

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Targets en docker (hostname = service name)
const USERS_SERVICE = process.env.USERS_SERVICE_URL || "http://users_service:3000";
const COURSES_SERVICE = process.env.COURSES_SERVICE_URL || "http://courses_service:3000";
const QUIZZES_SERVICE = process.env.QUIZZES_SERVICE_URL || "http://quizzes_service:3000";
const CHATS_SERVICE = process.env.CHATS_SERVICE_URL || "http://chats_service:3000";

app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Healthcheck
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    targets: {
      USERS_SERVICE,
      COURSES_SERVICE,
      QUIZZES_SERVICE,
      CHATS_SERVICE,
    },
  });
});

// --------------------
// Proxies (un solo options object, target SIEMPRE presente)
// --------------------
const usersProxy = createProxyMiddleware({
  target: USERS_SERVICE,
  changeOrigin: true,
  logLevel: "debug",
  proxyTimeout: 120000,
  timeout: 120000,
});

const coursesProxy = createProxyMiddleware({
  target: COURSES_SERVICE,
  changeOrigin: true,
  logLevel: "debug",
  proxyTimeout: 120000,
  timeout: 120000,
});

const quizzesProxy = createProxyMiddleware({
  target: QUIZZES_SERVICE,
  changeOrigin: true,
  logLevel: "debug",
  proxyTimeout: 120000,
  timeout: 120000,
});

const chatsProxy = createProxyMiddleware({
  target: CHATS_SERVICE,
  changeOrigin: true,
  logLevel: "debug",
  proxyTimeout: 120000,
  timeout: 120000,
});

// --------------------
// Routing manual (evita que Express recorte el path)
// y evita problemas de firma de HPM
// --------------------
app.use((req, res, next) => {
  const p = req.path || "";

  // USERS SERVICE (incluye users, instructors, students y uploads)
  if (
    p.startsWith("/minao_systems/users") ||
    p.startsWith("/minao_systems/instructors") ||
    p.startsWith("/minao_systems/students") ||
    p.startsWith("/uploads")
  ) {
    return usersProxy(req, res, next);
  }

  // COURSES
  if (p.startsWith("/minao_systems/courses")) {
    return coursesProxy(req, res, next);
  }

  // QUIZZES
  if (p.startsWith("/minao_systems/quizzes")) {
    return quizzesProxy(req, res, next);
  }

  // CHATS
  if (p.startsWith("/minao_systems/chats")) {
    return chatsProxy(req, res, next);
  }

  return next();
});

// ✅ fallback 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// ✅ importante en contenedor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log("Targets:", { USERS_SERVICE, COURSES_SERVICE, QUIZZES_SERVICE, CHATS_SERVICE });
});
