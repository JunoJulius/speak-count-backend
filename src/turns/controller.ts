import { JsonController, Post, HttpCode, Body, NotFoundError, ForbiddenError} from 'routing-controllers'
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
    async createTurn(
        @Body() { sessionId , participantId, startTime, endTime} : AuthenticatePayload
        ) {
            const session = await Session.findOne(sessionId)
            if(!session) throw new NotFoundError('Session not found')
            if(session.status !== 'started') throw new ForbiddenError("the sessison hasn't started yet")

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
                participant.numberOfPieces = 5 - Math.trunc(participant.timeSpeakingSeconds/session.timePerPiece)
            }
            
            const updatedParticipant = await participant.save()

            const [payload] = await Participant.query(`select * from participants where id=${updatedParticipant.id}`)

            io.emit('UPDATE_PARTICIPANT', payload)

            const [{'sum': sumpayload}] = await Participant.query(`SELECT SUM(number_of_pieces) FROM participants where session_id=${session.id}`)

            session.piecesToComplete = sumpayload
            await session.save()

            const [updatedSession] =await Session.query(`select * from sessions where id=${session.id}`)

            io.emit( 'UPDATE_SESSION', updatedSession )

            
            return newTurn
        }
   



}
