import 'reflect-metadata'
import { useKoaServer } from 'routing-controllers'
import setupDb from './db'
import * as Koa from 'koa'
import {Server} from 'http'
import * as IO from 'socket.io'
import SessionsController from './sessions/controller';
import TurnsController from './turns/controller';


const app = new Koa()
const server = new Server(app.callback())
export const io = IO(server)
const port = process.env.PORT || 4000

useKoaServer(app, {
  cors: true,
  controllers: [
    SessionsController,
    TurnsController
  ]
})


// io.on('connect', socket => {
//   const name = socket.request.user.firstName
//   console.log(`User ${name} just connected`)

//   socket.on('disconnect', () => {
//     console.log(`User ${name} just disconnected`)
//   })
// })

setupDb()
  .then(_ => {
    server.listen(port)
    console.log(`Listening on port ${port}`)
  })
  .catch(err => console.error(err))