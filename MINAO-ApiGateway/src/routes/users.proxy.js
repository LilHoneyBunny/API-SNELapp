const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = Router();

// En docker-compose, el hostname entre containers es el nombre del servicio:
const USERS_SERVICE = process.env.USERS_SERVICE_URL || "http://users_service:3000";

router.use(
  createProxyMiddleware({
    target: USERS_SERVICE,
    changeOrigin: true,
    // Mantiene el path tal cual llega al router base
    logLevel: "debug"
  })
);

module.exports = router;
