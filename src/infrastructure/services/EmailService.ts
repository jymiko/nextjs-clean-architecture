export interface IEmailService {
  sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean>;
}

export class EmailService implements IEmailService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${this.baseUrl}/auth/reset-password?token=${resetToken}`;

    // In production, integrate with email provider (Resend, SendGrid, etc.)
    // For now, we'll log the email details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('='.repeat(50));
      console.log('PASSWORD RESET EMAIL');
      console.log('='.repeat(50));
      console.log(`To: ${email}`);
      console.log(`Subject: Reset Your Password`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('='.repeat(50));
      return true;
    }

    // TODO: Implement actual email sending
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@yourdomain.com',
    //   to: email,
    //   subject: 'Reset Your Password',
    //   html: `
    //     <h1>Password Reset Request</h1>
    //     <p>Click the link below to reset your password:</p>
    //     <a href="${resetUrl}">Reset Password</a>
    //     <p>This link will expire in 1 hour.</p>
    //     <p>If you didn't request this, please ignore this email.</p>
    //   `,
    // });

    return true;
  }
}
