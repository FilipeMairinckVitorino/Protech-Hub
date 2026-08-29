const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Protech Hub backend rodando em http://localhost:${PORT}`);
});
