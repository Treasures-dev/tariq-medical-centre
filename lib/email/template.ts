interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Base template wrapper with common styling
function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Healthcare Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 30px; background-color: #4F46E5; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; text-align: center;">Healthcare Portal</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                  <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                    © ${new Date().getFullYear()} Healthcare Portal. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export const emailTemplates = {
  appointmentConfirmed: (
    patientName: string,
    doctorName: string,
    date: string,
    time: string
  ): EmailTemplate => {
    const content = `
      <h2 style="color: #10b981; margin-top: 0;">Appointment Confirmed ✓</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Dear ${patientName},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Your appointment has been confirmed with the following details:
      </p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 8px 0; color: #374151;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> ${time}</p>
      </div>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Please arrive 10 minutes before your scheduled time. If you need to reschedule, please contact us at least 24 hours in advance.
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Best regards,<br>
        Healthcare Portal Team
      </p>
    `;

    return {
      subject: `Appointment Confirmed - ${date} at ${time}`,
      html: emailWrapper(content),
      text: `Dear ${patientName},\n\nYour appointment has been confirmed.\n\nDoctor: Dr. ${doctorName}\nDate: ${date}\nTime: ${time}\n\nPlease arrive 10 minutes before your scheduled time.\n\nBest regards,\nHealthcare Portal Team`,
    };
  },

  appointmentCancelled: (
    patientName: string,
    doctorName: string,
    date: string,
    time: string
  ): EmailTemplate => {
    const content = `
      <h2 style="color: #ef4444; margin-top: 0;">Appointment Cancelled</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Dear ${patientName},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        We regret to inform you that your appointment has been cancelled:
      </p>
      <div style="background-color: #fee2e2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ef4444;">
        <p style="margin: 8px 0; color: #374151;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
        <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> ${time}</p>
      </div>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        If you would like to reschedule, please log in to your account or contact our support team.
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Best regards,<br>
        Healthcare Portal Team
      </p>
    `;

    return {
      subject: `Appointment Cancelled - ${date} at ${time}`,
      html: emailWrapper(content),
      text: `Dear ${patientName},\n\nYour appointment has been cancelled.\n\nDoctor: Dr. ${doctorName}\nDate: ${date}\nTime: ${time}\n\nIf you would like to reschedule, please contact us.\n\nBest regards,\nHealthcare Portal Team`,
    };
  },

  appointmentCompleted: (
    patientName: string,
    doctorName: string,
    hasPrescription: boolean
  ): EmailTemplate => {
    const content = `
      <h2 style="color: #4F46E5; margin-top: 0;">Appointment Completed</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Dear ${patientName},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Your appointment with Dr. ${doctorName} has been completed.
      </p>
      ${
        hasPrescription
          ? `
      <div style="background-color: #dbeafe; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; color: #374151;">
          <strong>📋 Prescription Available</strong><br>
          Your prescription is ready and can be viewed in your patient portal.
        </p>
      </div>
      `
          : ''
      }
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        You can view your appointment summary and medical records in your patient portal. If you have any questions or concerns, please don't hesitate to contact us.
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Best regards,<br>
        Healthcare Portal Team
      </p>
    `;

    return {
      subject: `Appointment Completed - Dr. ${doctorName}`,
      html: emailWrapper(content),
      text: `Dear ${patientName},\n\nYour appointment with Dr. ${doctorName} has been completed.${
        hasPrescription ? '\n\nYour prescription is available in your patient portal.' : ''
      }\n\nBest regards,\nHealthcare Portal Team`,
    };
  },

  appointmentReminder: (
    recipientName: string,
    isDoctor: boolean,
    patientName: string,
    doctorName: string,
    date: string,
    time: string
  ): EmailTemplate => {
    const content = `
      <h2 style="color: #f59e0b; margin-top: 0;">⏰ Appointment Reminder</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Dear ${recipientName},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        This is a reminder about ${isDoctor ? 'your upcoming appointment' : 'an upcoming appointment'}:
      </p>
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        ${
          isDoctor
            ? `<p style="margin: 8px 0; color: #374151;"><strong>Patient:</strong> ${patientName}</p>`
            : `<p style="margin: 8px 0; color: #374151;"><strong>Doctor:</strong> Dr. ${doctorName}</p>`
        }
        <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> ${time}</p>
      </div>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        ${
          isDoctor
            ? 'Please review the patient history before the appointment.'
            : 'Please arrive 10 minutes early. Remember to bring any relevant medical documents.'
        }
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Best regards,<br>
        Healthcare Portal Team
      </p>
    `;

    return {
      subject: `Reminder: Appointment Tomorrow at ${time}`,
      html: emailWrapper(content),
      text: `Dear ${recipientName},\n\nThis is a reminder about ${
        isDoctor ? 'your upcoming appointment' : 'an upcoming appointment'
      }.\n\n${isDoctor ? `Patient: ${patientName}` : `Doctor: Dr. ${doctorName}`}\nDate: ${date}\nTime: ${time}\n\nBest regards,\nHealthcare Portal Team`,
    };
  },

  doctorNotification: (
    doctorName: string,
    patientName: string,
    action: string,
    date: string,
    time: string
  ): EmailTemplate => {
    const actionColors: Record<string, { bg: string; border: string; text: string }> = {
      confirmed: { bg: '#d1fae5', border: '#10b981', text: 'Confirmed' },
      completed: { bg: '#dbeafe', border: '#3b82f6', text: 'Completed' },
      cancelled: { bg: '#fee2e2', border: '#ef4444', text: 'Cancelled' },
    };

    const colors = actionColors[action] || actionColors.confirmed;

    const content = `
      <h2 style="color: #374151; margin-top: 0;">Appointment ${colors.text}</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Dear Dr. ${doctorName},
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        An appointment has been ${action}:
      </p>
      <div style="background-color: ${colors.bg}; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${colors.border};">
        <p style="margin: 8px 0; color: #374151;"><strong>Patient:</strong> ${patientName}</p>
        <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> ${time}</p>
        <p style="margin: 8px 0; color: #374151;"><strong>Status:</strong> ${colors.text}</p>
      </div>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        You can view more details in your doctor portal.
      </p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">
        Best regards,<br>
        Healthcare Portal Team
      </p>
    `;

    return {
      subject: `Appointment ${colors.text} - ${patientName} on ${date}`,
      html: emailWrapper(content),
      text: `Dear Dr. ${doctorName},\n\nAn appointment has been ${action}.\n\nPatient: ${patientName}\nDate: ${date}\nTime: ${time}\nStatus: ${colors.text}\n\nBest regards,\nHealthcare Portal Team`,
    };
  },
};