import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm'
import User from '../users/entity'

@Entity()
export class Session extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @Column('text',{nullable: true})
  participantTurn: string

  @Column('text',{nullable: true})
  topic: string

  @OneToMany(_ => Participant, participant => participant.session, {eager:true})
  participants: Participant[]

  @CreateDateColumn({type: 'timestamp'})
  timeOfCreation: Date 

}

@Entity()
export class Participant extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @ManyToOne(_ => User, user => user.participants)
  user: User

  @ManyToOne(_ => Session, session => session.participants)
  session: Session

}
