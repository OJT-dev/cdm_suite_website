
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendContactNotification, sendContactConfirmation } from "@/lib/email";

export const dynamic = "force-dynamic";

// Simple in-memory rate limiter
const submissionTracker = new Map<string, { count: number; firstSubmission: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const WINDOW_MS = 60 * 60 * 1000; // 1 hour window
  const MAX_SUBMISSIONS = 3; // Max 3 submissions per hour
  
  const existing = submissionTracker.get(identifier);
  
  if (!existing) {
    submissionTracker.set(identifier, { count: 1, firstSubmission: now });
    return true;
  }
  
  // Reset if window expired
  if (now - existing.firstSubmission > WINDOW_MS) {
    submissionTracker.set(identifier, { count: 1, firstSubmission: now });
    return true;
  }
  
  // Check if limit exceeded
  if (existing.count >= MAX_SUBMISSIONS) {
    return false;
  }
  
  // Increment count
  existing.count++;
  return true;
}

// Clean up old entries every 2 hours
setInterval(() => {
  const now = Date.now();
  const CLEANUP_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours
  
  for (const [key, value] of submissionTracker.entries()) {
    if (now - value.firstSubmission > CLEANUP_THRESHOLD) {
      submissionTracker.delete(key);
    }
  }
}, 2 * 60 * 60 * 1000);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, message, formType, website, _submitTime } = body;

    // Get client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(',')[0].trim() : "unknown";
    const identifier = email || ip; // Use email as primary identifier, fallback to IP
    
    // Rate limiting check
    if (!checkRateLimit(identifier)) {
      console.warn('Spam blocked: rate limit exceeded', { identifier, email, name });
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    // Anti-spam validation
    
    // Check 1: Honeypot field should be empty
    if (website) {
      console.warn('Spam blocked: honeypot field filled', { email, name });
      return NextResponse.json(
        { error: "Invalid submission" },
        { status: 400 }
      );
    }
    
    // Check 2: Time-based validation (should take at least 3 seconds)
    if (_submitTime && _submitTime < 3) {
      console.warn('Spam blocked: form submitted too quickly', { email, name, time: _submitTime });
      return NextResponse.json(
        { error: "Please take a moment to review your message" },
        { status: 400 }
      );
    }
    
    // Check 3: Pattern detection for obvious spam
    const spamPatterns = [
      /[a-z]{20,}/i, // Random gibberish (20+ consecutive letters)
      /^[A-Z0-9]{15,}$/i, // All caps random strings
      /(.)\1{10,}/, // Repeated characters (10+ times)
    ];
    
    const textToCheck = `${name} ${email} ${company || ''} ${message}`.toLowerCase();
    const isSpamPattern = spamPatterns.some(pattern => pattern.test(textToCheck));
    
    if (isSpamPattern) {
      console.warn('Spam blocked: detected spam pattern', { email, name });
      return NextResponse.json(
        { error: "Invalid submission content" },
        { status: 400 }
      );
    }
    
    // Check 4: Email validation (basic check for common spam email patterns)
    const emailLower = email.toLowerCase();
    const spamEmailPatterns = [
      /@example\.com$/,
      /@test\.com$/,
      /@mailinator\.com$/,
      /\+spam@/,
    ];
    
    if (spamEmailPatterns.some(pattern => pattern.test(emailLower))) {
      console.warn('Spam blocked: suspicious email pattern', { email, name });
      return NextResponse.json(
        { error: "Please use a valid email address" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: name?.trim() || "",
        email: email?.trim() || "",
        phone: phone?.trim() || "",
        company: company?.trim() || "",
        message: message?.trim() || "",
        formType: formType || "get-started",
      },
    });

    // Send emails (don't wait for them, send async)
    const emailData = {
      name: name?.trim() || "",
      email: email?.trim() || "",
      phone: phone?.trim() || "",
      company: company?.trim() || "",
      message: message?.trim() || "",
      formType: formType || "get-started",
    };

    // Send emails in background (don't block response)
    Promise.all([
      sendContactNotification(emailData),
      sendContactConfirmation(emailData),
    ]).catch(error => {
      console.error('Email sending failed:', error);
      // Don't fail the request if emails fail
    });

    return NextResponse.json(
      { 
        message: "Contact submission saved successfully",
        id: submission.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);
    return NextResponse.json(
      { error: "Failed to save contact submission" },
      { status: 500 }
    );
  }
}
