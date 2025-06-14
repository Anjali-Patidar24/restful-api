const http = require('http');
const url = require('url');

let tasks = [];
let nextId = 1;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;
  const method = req.method;

  res.setHeader('Content-Type', 'application/json');

  const collectRequestData = (callback) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        callback(null, json);
      } catch (err) {
        callback(err);
      }
    });
  };


  if (pathname === '/tasks' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify(tasks));
  }

  else if (pathname === '/tasks' && method === 'POST') {
    collectRequestData((err, body) => {
      if (err || !body.title) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Invalid JSON or missing title' }));
      }
      const newTask = { id: nextId++, title: body.title };
      tasks.push(newTask);
      res.writeHead(201);
      res.end(JSON.stringify(newTask));
    });
  }


  else if (pathname.startsWith('/tasks/') && method === 'PUT') {
    const id = parseInt(pathname.split('/')[2]);
    const task = tasks.find(t => t.id === id);
    if (!task) {
      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'Task not found' }));
    }
    collectRequestData((err, body) => {
      if (err || !body.title) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Invalid JSON or missing title' }));
      }
      task.title = body.title;
      res.writeHead(200);
      res.end(JSON.stringify(task));
    });
  }

 
  else if (pathname.startsWith('/tasks/') && method === 'DELETE') {
    const id = parseInt(pathname.split('/')[2]);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'Task not found' }));
    }
    tasks.splice(index, 1);
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Task deleted successfully' }));
  }

  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
