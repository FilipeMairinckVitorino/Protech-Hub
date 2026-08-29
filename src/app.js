require("dotenv").config();

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const alunosRoutes = require("./routes/alunos.routes");
const conteudoRoutes = require("./routes/conteudo.routes");
const professorRoutes = require("./routes/professor.routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

const origensPermitidas = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: origensPermitidas.length > 0 ? origensPermitidas : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/api/alunos", alunosRoutes);
app.use("/api", conteudoRoutes);
app.use("/api/professor", professorRoutes);

const PASTA_PUBLICA = path.join(__dirname, "..", "public");
app.use(express.static(PASTA_PUBLICA));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/auth") || req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(PASTA_PUBLICA, "index.html"));
});

app.use(errorHandler);

module.exports = app;
