"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const entity_1 = require("../sessions/entity");
const entity_2 = require("./entity");
const class_validator_1 = require("class-validator");
const index_1 = require("../index");
class AuthenticatePayload {
}
__decorate([
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], AuthenticatePayload.prototype, "sessionId", void 0);
__decorate([
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], AuthenticatePayload.prototype, "participantId", void 0);
__decorate([
    class_validator_1.IsDateString(),
    __metadata("design:type", String)
], AuthenticatePayload.prototype, "startTime", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsDateString(),
    __metadata("design:type", String)
], AuthenticatePayload.prototype, "endTime", void 0);
let TurnsController = class TurnsController {
    async createSession({ sessionId, participantId, startTime, endTime }) {
        const session = await entity_1.Session.findOne(sessionId);
        if (!session)
            throw new routing_controllers_1.NotFoundError('Session not found');
        const participant = await entity_1.Participant.findOne(participantId);
        if (!participant)
            throw new routing_controllers_1.NotFoundError('You are not part of this session');
        const turn = await entity_2.default.create();
        turn.session = session;
        turn.participant = participant;
        turn.startTime = startTime;
        turn.endtTime = endTime;
        const newTurn = await turn.save();
        const timeSpoken = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
        participant.timeSpeakingSeconds = participant.timeSpeakingSeconds + timeSpoken;
        if (participant.timeSpeakingSeconds > session.timePerPiece && participant.timeSpeakingSeconds <= 5 * session.timePerPiece) {
            participant.numberOfPieces = Math.trunc(participant.timeSpeakingSeconds / session.timePerPiece);
        }
        const updatedParticipant = await participant.save();
        index_1.io.emit('UPDATE_PARTICIPANT', updatedParticipant);
        return newTurn;
    }
};
__decorate([
    routing_controllers_1.HttpCode(201),
    routing_controllers_1.Post('/turns'),
    __param(0, routing_controllers_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AuthenticatePayload]),
    __metadata("design:returntype", Promise)
], TurnsController.prototype, "createSession", null);
TurnsController = __decorate([
    routing_controllers_1.JsonController()
], TurnsController);
exports.default = TurnsController;
//# sourceMappingURL=controller.js.map