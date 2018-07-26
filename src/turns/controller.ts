import { JsonController, Post, HttpCode, Body, NotFoundError} from 'routing-controllers'
import { Session, Participant } from '../sessions/entity'
import Turn from './entity'
import { IsNumber, IsDateString, IsOptional } from 'class-validator'
import {io} from '../index'

class AuthenticatePayload {
    @IsNumber()
    sessionId: number

    @IsNumber()
    participantId: number

    @IsDateString()
    startTime: string
    
    @IsOptional()
    @IsDateString()
    endTime: string
}
    

@JsonController()
export default class TurnsController {

    @HttpCode(201)
    @Post('/turns')
    async createSession(
        @Body() { sessionId , participantId, startTime, endTime} : AuthenticatePayload
        ) {
            const session = await Session.findOne(sessionId)
            if(!session) throw new NotFoundError('Session not found')

            const participant = await Participant.findOne(participantId)
            if(!participant) throw new NotFoundError('You are not part of this session')
            

            const turn = await Turn.create()
            turn.session = session
            turn.participant = participant
            turn.startTime = startTime
            turn.endtTime = endTime
            const newTurn = await turn.save()

            
            const timeSpoken =  Math.round((new Date(endTime).getTime() - new Date(startTime).getTime())/1000)
           

            participant.timeSpeakingSeconds = participant.timeSpeakingSeconds + timeSpoken
            if(participant.timeSpeakingSeconds > session.timePerPiece && participant.timeSpeakingSeconds <= 5*session.timePerPiece){
                participant.numberOfPieces = Math.trunc(participant.timeSpeakingSeconds/session.timePerPiece)
            }
            
            const updatedParticipant = await participant.save()

            const [payload] = await Participant.query(`select * from participants where id=${updatedParticipant.id}`)

            io.emit('UPDATE_PARTICIPANT', payload)

            
            return newTurn
        }
   



}
