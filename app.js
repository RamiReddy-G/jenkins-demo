const http = require('http');

const PORT = 3000;

// ❌ Simulated startup failure
throw new Error("Simulated deployment failure");

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("This should never run");
});

server.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});
