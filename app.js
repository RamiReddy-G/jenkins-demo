const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.end('Hello from Jenkins + Docker');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log("the server is updated")