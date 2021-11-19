import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'
import WebSocket from 'ws'
import { v4 as uuid }  from 'uuid'

interface Message {
  name: string
  message: string
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    
    if (req.url === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })

      fs.readFile(
        path.join(__dirname, '../client', 'index.html'),
        'utf-8',
        (error, content) => {
          if (error) throw error
          res.end(content)
        }
      )
    } else if (req.url === '/index.js') {
      res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' })

      fs.readFile(
        path.join(__dirname, '../client', 'index.js'),
        'utf-8',
        (error, content) => {
          if (error) throw error
          res.end(content)
        }
      )
    } else if (req.url === '/style.css') {
      res.writeHead(200, { 'content-type': 'text/css; charset=utf-8' })

      fs.readFile(
        path.join(__dirname, '../client', 'style.css'),
        'utf-8',
        (error, content) => {
          if (error) throw error
          res.end(content)
        }
      )
    }
  }
})
const { Server } = WebSocket
const clients: any = {}
const wss = new Server({ port: 8000 })
const history = fs.existsSync(path.join(__dirname, '../db', 'history.json')) && fs.readFileSync(path.join(__dirname, '../db', 'history.json'))
const messages: Message[] = JSON.parse(history.toString()) || []

server.listen(3000)

wss.on('connection', (ws: WebSocket) => {
  const id = uuid()
  clients[id] = ws

  if (messages.length) {
    ws.send(JSON.stringify(messages))
  }

  ws.on('message', (rawMessage: JSON) => {
    const { name, message } = JSON.parse(rawMessage.toString())
    messages.push({ name, message })

    for (const id in clients) {
      clients[id].send(JSON.stringify([{ name, message }]))
    }
  })

  ws.on('close', () => {
    delete clients[id]
    console.log(`Client ${id} is closed`)
  })
})

process.on('SIGINT', () => {
  wss.close()
  fs.writeFile(
    path.join(__dirname, '../db', 'history.json'),
    JSON.stringify(messages),
    error => {
      if (error) {
        console.log(error)
      }
      
      process.exit()
    }
  )
})