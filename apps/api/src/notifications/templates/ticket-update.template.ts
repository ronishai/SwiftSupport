import { Ticket } from '@swift-support/shared';
import { STATUS_LABELS, PRIORITY_LABELS } from '@swift-support/shared';

export interface TicketChange {
  changeType: 'status' | 'adminNote' | 'team' | 'assignment';
  previousValue: any;
  newValue: any;
}

export function getTicketUpdateEmailTemplate(
  ticket: Ticket,
  change: TicketChange,
  opts?: {
    categoryLabels?: Record<string, string>;
    teamLabels?: Record<string, string>;
    lang?: 'en' | 'he';
  },
): string {
  const ticketUrl = `https://seven-stars-helpdesk.web.app/tickets/${ticket.id}`;
  
  let changeDescription = '';
  let detailedContentHtml = '';

  switch (change.changeType) {
    case 'status': {
      const prevLabel = STATUS_LABELS[change.previousValue] || change.previousValue;
      const newLabel = STATUS_LABELS[change.newValue] || change.newValue;
      changeDescription = `סטטוס הפנייה עודכן ל-<strong>${newLabel}</strong>.`;
      
      detailedContentHtml = `
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0; border-right: 4px solid #3b82f6; text-align: right; direction: rtl;">
          <span style="color: #4b5563; font-size: 14px;">שינוי סטטוס:</span>
          <div style="font-size: 18px; font-weight: bold; margin-top: 8px; color: #1f2937;">
            <span style="color: #ef4444; text-decoration: line-through; font-weight: normal; font-size: 15px;">${prevLabel}</span> 
            <span style="color: #9ca3af; margin: 0 8px;">&larr;</span> 
            <span style="color: #10b981;">${newLabel}</span>
          </div>
        </div>
      `;
      break;
    }
    case 'adminNote': {
      changeDescription = `נוספה הערת מנהל חדשה לפנייה שלך.`;
      
      detailedContentHtml = `
        <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0; border-right: 4px solid #f59e0b; text-align: right; direction: rtl;">
          <span style="color: #78350f; font-size: 14px; font-weight: bold;">הערת מנהל:</span>
          <p style="margin: 8px 0 0 0; color: #451a03; font-style: italic; font-size: 15px; line-height: 1.5; white-space: pre-line;">${change.newValue}</p>
        </div>
      `;
      break;
    }
    case 'team': {
      const teamLabels = opts?.teamLabels ?? {};
      const prevLabel = teamLabels[change.previousValue] || change.previousValue;
      const newLabel = teamLabels[change.newValue] || change.newValue;
      changeDescription = `צוות הטיפול בפנייה עודכן ל-<strong>${newLabel}</strong>.`;
      
      detailedContentHtml = `
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0; border-right: 4px solid #8b5cf6; text-align: right; direction: rtl;">
          <span style="color: #4b5563; font-size: 14px;">צוות מטפל:</span>
          <div style="font-size: 16px; font-weight: bold; margin-top: 8px; color: #1f2937;">
            <span style="color: #9ca3af; font-weight: normal; font-size: 14px;">${prevLabel || 'לא הוקצה'}</span> 
            <span style="color: #9ca3af; margin: 0 8px;">&larr;</span> 
            <span style="color: #8b5cf6;">${newLabel}</span>
          </div>
        </div>
      `;
      break;
    }
    case 'assignment': {
      const prevName = change.previousValue?.displayName || 'לא מוקצה';
      const newName = change.newValue?.displayName || 'לא מוקצה';
      changeDescription = `הפנייה שלך שויכה לטיפול של <strong>${newName}</strong>.`;
      
      detailedContentHtml = `
        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0; border-right: 4px solid #10b981; text-align: right; direction: rtl;">
          <span style="color: #4b5563; font-size: 14px;">נציג מטפל:</span>
          <div style="font-size: 16px; font-weight: bold; margin-top: 8px; color: #1f2937;">
            <span style="color: #9ca3af; font-weight: normal; font-size: 14px;">${prevName}</span> 
            <span style="color: #9ca3af; margin: 0 8px;">&larr;</span> 
            <span style="color: #10b981;">${newName}</span>
          </div>
        </div>
      `;
      break;
    }
    default: {
      changeDescription = `הפנייה שלך עודכנה במערכת.`;
    }
  }

  const categoryLabels = opts?.categoryLabels ?? {};
  const categoryLabel = categoryLabels[ticket.category] || ticket.category;
  const statusLabel = STATUS_LABELS[ticket.status] || ticket.status;
  const priorityLabel = PRIORITY_LABELS[ticket.priority] || ticket.priority;
  const teamLabels = opts?.teamLabels ?? {};
  const teamLabel = teamLabels[ticket.teamInCharge] || ticket.teamInCharge;
  const assignedName = ticket.assignedTo?.displayName || 'טרם שויך';

  return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>עדכון פנייה - ${ticket.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Premium Header -->
    <div style="background: linear-gradient(135deg, #312e81 0%, #4f46e5 100%); border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">SwiftSupport Helpdesk</h1>
      <p style="margin: 8px 0 0 0; color: #c7d2fe; font-size: 14px; font-weight: 500;">עדכון לגבי פנייתך במערכת</p>
    </div>

    <!-- Main Card Body -->
    <div style="background-color: white; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; padding: 32px 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Greeting and Main Alert -->
      <div style="text-align: right; direction: rtl; margin-bottom: 24px; border-bottom: 1px solid #f3f4f6; padding-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #111827; font-weight: 700;">שלום ${ticket.createdBy.name},</h2>
        <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">${changeDescription}</p>
      </div>

      <!-- Specific Change Showcase -->
      ${detailedContentHtml}

      <!-- Ticket Summary Table -->
      <div style="margin-top: 32px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f8fafc; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: bold; font-size: 14px; text-align: right; direction: rtl;">
          פרטי הפנייה
        </div>
        <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 14px; direction: rtl;">
          <tbody>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; font-weight: 600; color: #4b5563; width: 35%;">כותרת</td>
              <td style="padding: 12px 16px; color: #1f2937;"><strong>${ticket.title}</strong></td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; font-weight: 600; color: #4b5563;">קטגוריה</td>
              <td style="padding: 12px 16px; color: #1f2937;">${categoryLabel}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; font-weight: 600; color: #4b5563;">סטטוס נוכחי</td>
              <td style="padding: 12px 16px; color: #1f2937;">
                <span style="display: inline-block; padding: 2px 8px; font-size: 12px; font-weight: bold; border-radius: 9999px; background-color: #e0f2fe; color: #0369a1;">
                  ${statusLabel}
                </span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; font-weight: 600; color: #4b5563;">עדיפות</td>
              <td style="padding: 12px 16px; color: #1f2937;">${priorityLabel}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; font-weight: 600; color: #4b5563;">מיקום</td>
              <td style="padding: 12px 16px; color: #1f2937;">קומה ${ticket.floor || '-'}, חדר ${ticket.room || '-'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 16px; font-weight: 600; color: #4b5563;">צוות מטפל</td>
              <td style="padding: 12px 16px; color: #1f2937;">${teamLabel}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; font-weight: 600; color: #4b5563;">נציג מטפל</td>
              <td style="padding: 12px 16px; color: #1f2937;">${assignedName}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Action Button -->
      <div style="margin-top: 32px; text-align: center;">
        <a href="${ticketUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 28px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.25);">
          צפייה בפנייה במערכת
        </a>
      </div>

      <!-- Divider -->
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0 24px 0;">

      <!-- Footer Info -->
      <div style="text-align: center; color: #9ca3af; font-size: 12px; line-height: 1.5;">
        <p style="margin: 0 0 8px 0;">פנייה זו נשלחה באופן אוטומטי ממערכת פתיחת התקלות של SwiftSupport.</p>
        <p style="margin: 0;">&copy; 2026 SwiftSupport Ltd. כל הזכויות שמורות.</p>
      </div>

    </div>

  </div>
</body>
</html>
  `;
}
