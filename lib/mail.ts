import {Resend} from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail (email:string, otp:string){
    const {data} = await resend.emails.send({
        from:"Sports <info@johnmbugua.info>",
        to:email,
        subject:"Verify Your Sports Account",
        html:`
            <!DOCTYPE html>
            <html>
                <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Account</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to Sports!</h1>
                    
                    <p style="margin-bottom: 15px;">Thank you for creating an account. To complete your registration, please use the verification code below:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #1f2937;">${otp}</span>
                    </div>
                    
                    <p style="margin-bottom: 15px;">This code will expire in 10 minutes for security purposes.</p>
                    
                    <p style="margin-bottom: 15px;">If you didn't create an account, you can safely ignore this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    
                    <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
                    This is an automated message, please do not reply to this email.
                    If you need assistance, please contact our support team.
                    </p>
                </div>
                </body>
            </html>
        `,
    })
}