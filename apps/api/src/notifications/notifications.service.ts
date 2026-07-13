import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Ticket } from '@swift-support/shared';
import * as nodemailer from 'nodemailer';
import { getTicketUpdateEmailTemplate, TicketChange } from './templates/ticket-update.template.ts';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress = 'noreply@swift-support.com';

  constructor(private configService: ConfigService, private settings: SettingsService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      const host = this.configService.get<string>('SMTP_HOST') || this.configService.get<string>('MAIL_HOST');
      const port = Number(this.configService.get<string>('SMTP_PORT') || this.configService.get<string>('MAIL_PORT') || 587);
      const user = this.configService.get<string>('SMTP_USER') || 
                   this.configService.get<string>('MAIL_USER') || 
                   this.configService.get<string>('SMTP_USERNAME') || 
                   this.configService.get<string>('MAIL_USERNAME');
      const pass = this.configService.get<string>('SMTP_PASS') || 
                   this.configService.get<string>('MAIL_PASS') || 
                   this.configService.get<string>('SMTP_PASSWORD') || 
                   this.configService.get<string>('MAIL_PASSWORD');
      
      this.fromAddress = this.configService.get<string>('SMTP_FROM') || 
                         this.configService.get<string>('MAIL_FROM') || 
                         'SwiftSupport Helpdesk <noreply@swift-support.com>';

      if (!host || !user || !pass) {
        this.logger.warn(
          'Email service configuration is incomplete. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables. Emails will not be sent.',
        );
        return;
      }

      const secure = this.configService.get<string>('SMTP_SECURE') === 'true' || port === 465;

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false, // Prevents certificate issues during development/local tests
        },
      });

      this.logger.log(`SMTP transporter initialized successfully on ${host}:${port} (secure: ${secure})`);
    } catch (error) {
      this.logger.error('Failed to initialize nodemailer transporter:', error);
    }
  }

  @OnEvent('ticket.updated')
  async handleTicketUpdated(payload: {
    ticket: Ticket;
    changeType: TicketChange['changeType'];
    previousValue: any;
    newValue: any;
  }) {
    const { ticket, changeType, previousValue, newValue } = payload;
    const clientEmail = ticket.createdBy?.email;

    if (!clientEmail) {
      this.logger.warn(`No creator email found for ticket ${ticket.id}. Notification skipped.`);
      return;
    }

    if (!this.transporter) {
      this.logger.warn(`Transporter not initialized. Cannot send notification email to ${clientEmail} for ticket ${ticket.id}.`);
      return;
    }

    try {
      const subject = `[SwiftSupport Helpdesk] עדכון פנייה / Ticket Update: ${ticket.title}`;
      const change: TicketChange = { changeType, previousValue, newValue };
      // fetch current labels from settings so notifications reflect admin-managed config
      const cfg = await this.settings.getConfig();
      const categoryLabels: Record<string, string> = Object.fromEntries(
        cfg.categories.map((c) => [c.id, c.label.he || c.label.en]),
      );
      const teamLabels: Record<string, string> = Object.fromEntries(
        cfg.teams.map((t) => [t.id, t.label.he || t.label.en]),
      );

      const htmlContent = getTicketUpdateEmailTemplate(ticket, change, {
        categoryLabels,
        teamLabels,
        lang: 'he',
      });

      this.logger.log(`Sending ticket update email to client: ${clientEmail} for ticket ${ticket.id}`);

      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: clientEmail,
        subject,
        html: htmlContent,
      });

      this.logger.log(`Email sent successfully to ${clientEmail}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${clientEmail} for ticket ${ticket.id}:`, error);
    }
  }
}
