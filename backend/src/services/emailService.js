import transporter from '../config/nodemailer.js';

const FROM = process.env.EMAIL_FROM || 'Takeout Dhanmondi <noreply@takeoutdhanmondi.com>';

export const sendOTPEmail = async (email, name, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: 'Arial', sans-serif; background:#0a0a0a; margin:0; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#1a1a1a; border-radius:16px; overflow:hidden;">
        <div style="background:linear-gradient(135deg,#FF6B00,#E63946); padding:30px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:28px;">🍔 Takeout Dhanmondi</h1>
          <p style="color:rgba(255,255,255,0.85); margin:8px 0 0;">Email Verification</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#fff; font-size:16px;">Hi <strong>${name}</strong>,</p>
          <p style="color:#a0a0a0; font-size:15px; line-height:1.6;">Please use the code below to verify your email and confirm your order.</p>
          <div style="background:#0a0a0a; border:2px solid #FF6B00; border-radius:12px; padding:24px; text-align:center; margin:24px 0;">
            <p style="color:#a0a0a0; margin:0 0 8px; font-size:13px; text-transform:uppercase; letter-spacing:2px;">Your Verification Code</p>
            <h2 style="color:#FF6B00; font-size:48px; letter-spacing:12px; margin:0; font-weight:700;">${otp}</h2>
          </div>
          <p style="color:#a0a0a0; font-size:13px;">⏰ This code expires in <strong style="color:#fff;">10 minutes</strong>.</p>
          <p style="color:#a0a0a0; font-size:13px;">If you did not place this order, please ignore this email.</p>
        </div>
        <div style="background:#111; padding:20px; text-align:center; border-top:1px solid #2a2a2a;">
          <p style="color:#666; font-size:12px; margin:0;">© 2024 Takeout Dhanmondi. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  try {
    await transporter.sendMail({ from: FROM, to: email, subject: '🔐 Your Verification Code — Takeout Dhanmondi', html });
    console.log(`✉️ OTP email sent to ${email}`);
  } catch (err) {
    console.warn(`⚠️ Failed to send OTP email to ${email}. Error: ${err.message}`);
    console.log(`🔑 Fallback OTP for ${email}: ${otp}`);
  }
};

export const sendSignupOTPEmail = async (email, name, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: 'Arial', sans-serif; background:#0a0a0a; margin:0; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#1a1a1a; border-radius:16px; overflow:hidden;">
        <div style="background:linear-gradient(135deg,#FF6B00,#E63946); padding:30px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:28px;">🍔 Takeout Dhanmondi</h1>
          <p style="color:rgba(255,255,255,0.85); margin:8px 0 0;">Create Your Account</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#fff; font-size:16px;">Hi <strong>${name}</strong>,</p>
          <p style="color:#a0a0a0; font-size:15px; line-height:1.6;">Thank you for registering at Takeout Dhanmondi! Use the verification code below to complete your sign up.</p>
          <div style="background:#0a0a0a; border:2px solid #FF6B00; border-radius:12px; padding:24px; text-align:center; margin:24px 0;">
            <p style="color:#a0a0a0; margin:0 0 8px; font-size:13px; text-transform:uppercase; letter-spacing:2px;">Your Verification Code</p>
            <h2 style="color:#FF6B00; font-size:48px; letter-spacing:12px; margin:0; font-weight:700;">${otp}</h2>
          </div>
          <p style="color:#a0a0a0; font-size:13px;">⏰ This code expires in <strong style="color:#fff;">10 minutes</strong>.</p>
          <p style="color:#a0a0a0; font-size:13px;">If you did not request this, please ignore this email.</p>
        </div>
        <div style="background:#111; padding:20px; text-align:center; border-top:1px solid #2a2a2a;">
          <p style="color:#666; font-size:12px; margin:0;">© 2024 Takeout Dhanmondi. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  try {
    await transporter.sendMail({ from: FROM, to: email, subject: '🔐 Verify Your Email — Takeout Dhanmondi', html });
    console.log(`✉️ Signup OTP email sent to ${email}`);
  } catch (err) {
    console.warn(`⚠️ Failed to send signup OTP email to ${email}. Error: ${err.message}`);
    console.log(`🔑 Fallback Signup OTP for ${email}: ${otp}`);
  }
};

export const sendPasswordResetEmail = async (email, name, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: 'Arial', sans-serif; background:#0a0a0a; margin:0; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#1a1a1a; border-radius:16px; overflow:hidden;">
        <div style="background:linear-gradient(135deg,#FF6B00,#E63946); padding:30px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:28px;">🍔 Takeout Dhanmondi</h1>
          <p style="color:rgba(255,255,255,0.85); margin:8px 0 0;">Password Reset</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#fff; font-size:16px;">Hi <strong>${name}</strong>,</p>
          <p style="color:#a0a0a0; font-size:15px; line-height:1.6;">We received a request to reset your password. Use the code below to set a new password.</p>
          <div style="background:#0a0a0a; border:2px solid #FF6B00; border-radius:12px; padding:24px; text-align:center; margin:24px 0;">
            <p style="color:#a0a0a0; margin:0 0 8px; font-size:13px; text-transform:uppercase; letter-spacing:2px;">Your Reset Code</p>
            <h2 style="color:#FF6B00; font-size:48px; letter-spacing:12px; margin:0; font-weight:700;">${otp}</h2>
          </div>
          <p style="color:#a0a0a0; font-size:13px;">⏰ This code expires in <strong style="color:#fff;">15 minutes</strong>.</p>
          <p style="color:#a0a0a0; font-size:13px;">If you did not request a password reset, please ignore this email — your password will remain unchanged.</p>
        </div>
        <div style="background:#111; padding:20px; text-align:center; border-top:1px solid #2a2a2a;">
          <p style="color:#666; font-size:12px; margin:0;">© 2024 Takeout Dhanmondi. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  try {
    await transporter.sendMail({ from: FROM, to: email, subject: '🔑 Password Reset Code — Takeout Dhanmondi', html });
    console.log(`✉️ Password reset email sent to ${email}`);
  } catch (err) {
    console.warn(`⚠️ Failed to send password reset email to ${email}. Error: ${err.message}`);
    console.log(`🔑 Fallback reset code for ${email}: ${otp}`);
  }
};

export const sendOrderConfirmationEmail = async (order) => {
  const itemsHtml = order.items.map(item =>
    `<tr>
      <td style="padding:10px; color:#fff; border-bottom:1px solid #2a2a2a;">${item.name}</td>
      <td style="padding:10px; color:#a0a0a0; border-bottom:1px solid #2a2a2a; text-align:center;">${item.quantity}</td>
      <td style="padding:10px; color:#FF6B00; border-bottom:1px solid #2a2a2a; text-align:right;">৳${(item.price * item.quantity).toFixed(0)}</td>
    </tr>`
  ).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: 'Arial', sans-serif; background:#0a0a0a; margin:0; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#1a1a1a; border-radius:16px; overflow:hidden;">
        <div style="background:linear-gradient(135deg,#FF6B00,#E63946); padding:30px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:28px;">🎉 Order Confirmed!</h1>
          <p style="color:rgba(255,255,255,0.85); margin:8px 0 0;">Takeout Dhanmondi</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#fff; font-size:16px;">Hi <strong>${order.customer.name}</strong>, your order has been placed successfully!</p>
          <div style="background:#0a0a0a; border-radius:12px; padding:16px; margin:16px 0;">
            <p style="color:#a0a0a0; margin:0 0 4px; font-size:13px;">Order ID</p>
            <p style="color:#FF6B00; font-size:22px; font-weight:700; margin:0;">${order.orderId}</p>
          </div>
          <table style="width:100%; border-collapse:collapse; margin:20px 0;">
            <thead>
              <tr style="background:#0a0a0a;">
                <th style="padding:10px; color:#a0a0a0; text-align:left;">Item</th>
                <th style="padding:10px; color:#a0a0a0; text-align:center;">Qty</th>
                <th style="padding:10px; color:#a0a0a0; text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="border-top:1px solid #2a2a2a; padding-top:16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
              <span style="color:#a0a0a0;">Subtotal</span><span style="color:#fff;">৳${order.subtotal}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
              <span style="color:#a0a0a0;">Delivery Charge</span><span style="color:#fff;">৳${order.deliveryCharge}</span>
            </div>
            ${order.discount > 0 ? `<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="color:#a0a0a0;">Discount</span><span style="color:#22c55e;">-৳${order.discount}</span></div>` : ''}
            <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:700; margin-top:12px; padding-top:12px; border-top:1px solid #2a2a2a;">
              <span style="color:#fff;">Total</span><span style="color:#FF6B00;">৳${order.total}</span>
            </div>
          </div>
          <div style="background:#0a0a0a; border-radius:12px; padding:16px; margin-top:20px;">
            <p style="color:#a0a0a0; margin:0 0 8px; font-size:13px; text-transform:uppercase; letter-spacing:1px;">Delivery Address</p>
            <p style="color:#fff; margin:0;">${order.customer.address}</p>
          </div>
          <p style="color:#a0a0a0; font-size:13px; margin-top:20px;">You can track your order at <a href="${process.env.FRONTEND_URL}/order-tracking?id=${order.orderId}" style="color:#FF6B00;">Track My Order</a></p>
        </div>
        <div style="background:#111; padding:20px; text-align:center; border-top:1px solid #2a2a2a;">
          <p style="color:#666; font-size:12px; margin:0;">© 2024 Takeout Dhanmondi. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  try {
    await transporter.sendMail({ from: FROM, to: order.customer.email, subject: `✅ Order Confirmed — ${order.orderId} | Takeout Dhanmondi`, html });
    console.log(`✉️ Order confirmation email sent to ${order.customer.email}`);
  } catch (err) {
    console.warn(`⚠️ Failed to send order confirmation email to ${order.customer.email}. Error: ${err.message}`);
  }
};

export const sendStatusUpdateEmail = async (order) => {
  const statusMessages = {
    'Confirmed': { emoji: '✅', msg: 'Your order has been confirmed and is being prepared!' },
    'Preparing': { emoji: '👨‍🍳', msg: 'Our chefs are preparing your delicious food!' },
    'Out For Delivery': { emoji: '🛵', msg: 'Your order is on the way! Get ready to enjoy.' },
    'Delivered': { emoji: '🎉', msg: 'Your order has been delivered. Enjoy your meal!' },
    'Cancelled': { emoji: '❌', msg: 'Unfortunately, your order has been cancelled.' },
  };

  const info = statusMessages[order.status] || { emoji: '📦', msg: `Order status updated to ${order.status}` };

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background:#0a0a0a; margin:0; padding:20px;">
      <div style="max-width:600px; margin:0 auto; background:#1a1a1a; border-radius:16px; overflow:hidden;">
        <div style="background:linear-gradient(135deg,#FF6B00,#E63946); padding:30px; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:36px;">${info.emoji}</h1>
          <h2 style="color:#fff; margin:8px 0 0; font-size:22px;">Order ${order.status}</h2>
        </div>
        <div style="padding:32px;">
          <p style="color:#fff;">Hi <strong>${order.customer.name}</strong>,</p>
          <p style="color:#a0a0a0;">${info.msg}</p>
          <div style="background:#0a0a0a; border-radius:12px; padding:16px; margin:16px 0;">
            <p style="color:#a0a0a0; margin:0 0 4px;">Order ID</p>
            <p style="color:#FF6B00; font-size:20px; font-weight:700; margin:0;">${order.orderId}</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/order-tracking?id=${order.orderId}" style="display:block; background:linear-gradient(135deg,#FF6B00,#E63946); color:#fff; text-decoration:none; padding:14px 24px; border-radius:8px; text-align:center; font-weight:700; margin-top:20px;">Track My Order</a>
        </div>
        <div style="background:#111; padding:20px; text-align:center; border-top:1px solid #2a2a2a;">
          <p style="color:#666; font-size:12px; margin:0;">© 2024 Takeout Dhanmondi</p>
        </div>
      </div>
    </body>
    </html>
  `;
  try {
    await transporter.sendMail({ from: FROM, to: order.customer.email, subject: `${info.emoji} Order Update — ${order.orderId} | Takeout Dhanmondi`, html });
    console.log(`✉️ Order status email sent to ${order.customer.email} for status: ${order.status}`);
  } catch (err) {
    console.warn(`⚠️ Failed to send order status email to ${order.customer.email}. Error: ${err.message}`);
  }
};
