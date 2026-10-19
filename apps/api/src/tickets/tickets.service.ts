import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.ts';
import { CreateTicketDto } from './dto/create-ticket.dto.ts';
import {
  STATUS_TRANSITIONS,
  TicketStatus,
  Category,
  TeamId,
  Ticket,
} from '@swift-support/shared';
import * as admin from 'firebase-admin';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SettingsService } from '../settings/settings.service.ts';

@Injectable()
export class TicketService {
  constructor(
    private firebase: FirebaseService,
    private eventEmitter: EventEmitter2,
    private settingsService: SettingsService,
  ) {}

  private async getInitialTeam(category: Category): Promise<TeamId> {
    const config = await this.settingsService.getConfig();
    const teams = config.categoryResponsibleTeams[category];
    return teams?.[0] ?? config.teams[0]?.id ?? 'Network';
  }

  async create(dto: CreateTicketDto) {
    const reference = await this.firebase.db.collection('tickets').doc();
    const time = new Date().toISOString();
    const config = await this.settingsService.getConfig();
    const categoryItem = config.categories.find(
      (item) => item.id === dto.category,
    );
    const team = await this.getInitialTeam(dto.category);

    await reference.set({
      id: reference.id,
      title: categoryItem?.label.en ?? dto.category,
      description: dto.description,
      status: 'new' as TicketStatus,
      priority: dto.priority,
      category: dto.category,
      floor: dto.floor,
      room: dto.room,
      createdBy: { name: dto.name, email: dto.email, phone: dto.phone },
      teamInCharge: team,
      adminNote: '',
      assignedTo: null,
      createdAt: time,
      updatedAt: time,
    });
    return { id: reference.id };
  }

  async findAll(filters: Record<string, string> = {}) {
    let query: admin.firestore.Query = this.firebase.db
      .collection('tickets')
      .orderBy('createdAt', 'desc');

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.priority) {
      query = query.where('priority', '==', filters.priority);
    }
    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }
    if (filters.teamInCharge) {
      query = query.where('teamInCharge', '==', filters.teamInCharge);
    }
    if (filters.floor) {
      query = query.where('floor', '==', filters.floor);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async updateStatus(id: string, newStatus: TicketStatus) {
    const reference = this.firebase.db.collection('tickets').doc(id);
    const snapshot = await reference.get();
    if (!snapshot.exists) throw new NotFoundException('Ticket not found');
    const ticket = snapshot.data() as Ticket;
    const currentStatus = ticket.status;

    if (!currentStatus || !STATUS_TRANSITIONS[currentStatus]) {
      throw new BadRequestException(`Invalid current status: ${currentStatus}`);
    }

    if (!STATUS_TRANSITIONS[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }

    const updatedAt = new Date().toISOString();
    await reference.update({
      status: newStatus,
      updatedAt,
    });

    const updatedTicket = { ...ticket, status: newStatus, updatedAt };
    this.eventEmitter.emit('ticket.updated', {
      ticket: updatedTicket,
      changeType: 'status',
      previousValue: currentStatus,
      newValue: newStatus,
    });

    return { ok: true };
  }

  async updateNote(id: string, note: string) {
    const reference = this.firebase.db.collection('tickets').doc(id);
    const snapshot = await reference.get();
    if (!snapshot.exists) throw new NotFoundException('Ticket not found');
    const ticket = snapshot.data() as Ticket;
    const oldNote = ticket.adminNote;
    const updatedAt = new Date().toISOString();

    await reference.update({
      adminNote: note,
      updatedAt,
    });

    const updatedTicket = { ...ticket, adminNote: note, updatedAt };
    this.eventEmitter.emit('ticket.updated', {
      ticket: updatedTicket,
      changeType: 'adminNote',
      previousValue: oldNote,
      newValue: note,
    });

    return { ok: true };
  }

  async updateTeam(id: string, team: TeamId) {
    const reference = this.firebase.db.collection('tickets').doc(id);
    const snapshot = await reference.get();
    if (!snapshot.exists) throw new NotFoundException('Ticket not found');
    const ticket = snapshot.data() as Ticket;
    const oldTeam = ticket.teamInCharge;
    const updatedAt = new Date().toISOString();

    await reference.update({
      teamInCharge: team,
      updatedAt,
    });

    const updatedTicket = { ...ticket, teamInCharge: team, updatedAt };
    this.eventEmitter.emit('ticket.updated', {
      ticket: updatedTicket,
      changeType: 'team',
      previousValue: oldTeam,
      newValue: team,
    });

    return { ok: true };
  }

  async assignTo(
    id: string,
    user: { uid: string; displayName: string; email: string },
  ) {
    const reference = this.firebase.db.collection('tickets').doc(id);
    const snapshot = await reference.get();
    if (!snapshot.exists) throw new NotFoundException('Ticket not found');
    const ticket = snapshot.data() as Ticket;
    const oldAssignee = ticket.assignedTo;
    const updatedAt = new Date().toISOString();

    await reference.update({
      assignedTo: user,
      updatedAt,
    });

    const updatedTicket = { ...ticket, assignedTo: user, updatedAt };
    this.eventEmitter.emit('ticket.updated', {
      ticket: updatedTicket,
      changeType: 'assignment',
      previousValue: oldAssignee,
      newValue: user,
    });

    return { ok: true };
  }
}
