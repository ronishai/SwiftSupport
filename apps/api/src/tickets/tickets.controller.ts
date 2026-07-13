import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/auth.guard.ts';
import { TicketService } from './tickets.service.ts';
import { CreateTicketDto } from './dto/create-ticket.dto.ts';
import { TicketStatus } from '@swift-support/shared';
import type { TeamId } from '@swift-support/shared';

@Controller('tickets')
export class TicketsController {
  constructor(private tickets: TicketService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.tickets.create(dto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  findAll(@Query() filters: Record<string, string>) {
    return this.tickets.findAll(filters);
  }

  @Patch(':id/status')
  @UseGuards(FirebaseAuthGuard)
  updateStatus(@Param('id') id: string, @Body('status') newStatus: string) {
    return this.tickets.updateStatus(id, newStatus as TicketStatus);
  }
    
    @Patch(':id/note')
    @UseGuards(FirebaseAuthGuard)
    updateNote(@Param('id') id: string, @Body('adminNote') adminNote: string) {
        return this.tickets.updateNote(id, adminNote);
    }

    @Patch(':id/change-team')
    @UseGuards(FirebaseAuthGuard)
    updateTeam(@Param('id') id: string, @Body('teamId') teamId: TeamId) {
        return this.tickets.updateTeam(id, teamId);
    }

    @Patch(':id/assign')
    @UseGuards(FirebaseAuthGuard)
    assignTo(@Param('id') id: string, @Body('') uid: { uid: string; displayName: string; email: string }) {
        return this.tickets.assignTo(id, uid);
    }
}
