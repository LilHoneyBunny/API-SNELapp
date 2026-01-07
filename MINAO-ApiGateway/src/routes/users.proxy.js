const { Router } = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const router = Router();

const USERS_SERVICE = process.env.USERS_SERVICE_URL || "http://users_service:3000";

router.use(
  createProxyMiddleware({
    target: USERS_SERVICE,
    changeOrigin: true,
    logLevel: "debug",
    proxyTimeout: 120000,
    timeout: 120000
  })
);

module.exports = router;
