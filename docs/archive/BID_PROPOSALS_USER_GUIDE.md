
# Bid Proposals Module - User Guide

## Overview

The **Bid Proposals Module** is a comprehensive AI-powered system for managing RFP (Request for Proposal) responses from platforms like BidNet Direct. It allows the CDM Suite team to efficiently track bids, generate professional proposals using AI, and manage the entire bid lifecycle.

## Access Requirements

### ⚠️ Important: Employee/Admin Access Only

The Bid Proposals module is **only accessible to users with ADMIN or EMPLOYEE roles**. Regular clients will not see the "Bid Proposals" link in their dashboard navigation.

### How to Access:

**Option 1: Admin/Employee Login**
- Log in with an admin account (e.g., cdmsuitellc@gmail.com)
- Navigate to Dashboard
- Click on "Bid Proposals" in the sidebar under "Work Management"

**Option 2: Direct URL**
- Navigate directly to: `https://cdmsuite.com/dashboard/bid-proposals`
- (Requires admin/employee authentication)

## Features

### 1. Bid Proposals List View

**Location:** `/dashboard/bid-proposals`

**Features:**
- View all bid proposals in a clean, organized list
- Search bids by solicitation number, title, or organization
- Filter by status (All, Not Submitted, Submitted, Won, Lost)
- See at-a-glance status indicators:
  - Technical envelope status (Draft/Completed)
  - Cost envelope status (Draft/Completed)
  - Overall submission status
- Sort by closing date with urgency indicators
- Quick access to create new bids with "+ New Bid" button

**Bid Card Information:**
- Solicitation number
- Bid title
- Issuing organization (if provided)
- Status badges (Technical, Cost, Submission)
- Time since last update
- Closing date (if approaching)

### 2. Create New Bid Proposal

**Location:** `/dashboard/bid-proposals/new`

**How to Create a Bid:**

1. Click "+ New Bid" button from the list view
2. Fill in the bid information form:

**Basic Information:**
- **Solicitation Number*** (Required) - From BidNet Direct or other source
- Reference Number - Internal tracking number
- **Title*** (Required) - Descriptive title of the opportunity
- Description - Overview of the requirements
- Bid URL - Link to the original solicitation

**Organization Details:**
- Issuing Organization - Who is requesting the bid
- Solicitation Type - Type of procurement (RFP, RFQ, etc.)
- Location - Geographic location of the project

**Important Dates:**
- Publication Date - When the bid was published
- Bid Intent Deadline - Deadline to declare intent to bid
- Question Deadline - Last day to submit questions
- Closing Date - Final submission deadline

**Contact Information:**
- Contact Name - Primary contact for the bid
- Contact Email - Contact email address
- Contact Phone - Contact phone number

3. Click "Create Bid Proposal" to save

### 3. Bid Proposal Detail View

**Location:** `/dashboard/bid-proposals/[id]`

**Three-Tab Interface:**

#### Tab 1: Bid Info
- View all bid details and metadata
- See publication and deadline dates
- Access contact information
- View submission status
- Edit basic information
- Delete bid (if needed)

#### Tab 2: Technical Proposal (Envelope 1)

**Purpose:** Technical approach, methodology, timeline, and team qualifications

**Features:**
- **AI-Powered Generation** - Generate professional technical proposals with one click
- **Rich Text Editor** - Edit and format proposal content
- **Copy to Clipboard** - Quickly copy content for use in external documents
- **Save Draft** - Save progress at any time
- **Status Tracking** - Draft → Completed status workflow
- **Document Attachments** - Upload supporting documents (Coming soon)
- **Version History** - Track changes and revisions (Coming soon)

**How to Use AI Generation:**
1. Click "Generate with AI" button
2. Fill in the generation dialog:
   - **Custom Instructions** (Optional) - Specific requirements or focus areas
     - Example: "Focus on government compliance and data security"
   - **Bid Documents Content** (Optional) - Paste relevant sections from RFP
   - **Services to Emphasize** (Optional) - List CDM Suite services to highlight
     - Example: "Website Development, SEO, Social Media Management"
3. Click "Generate Proposal"
4. AI generates a professional technical proposal based on:
   - Bid requirements and context
   - CDM Suite's service offerings
   - Custom instructions provided
   - Company expertise and past proposals
5. Review and edit the generated content
6. Click "Save" to save your changes

#### Tab 3: Cost Proposal (Envelope 2)

**Purpose:** Pricing, budget breakdown, and financial terms

**Features:**
- Same AI generation capabilities as Technical envelope
- Structured pricing format
- Budget breakdown support
- Cost justification sections
- Payment terms and conditions

### 4. AI Generation Engine

**Technology:** Powered by Abacus AI (GPT-4o)

**How It Works:**
1. Analyzes bid requirements and context
2. Reviews CDM Suite's service catalog
3. Incorporates custom instructions
4. Generates professional, tailored proposals
5. Maintains consistent CDM Suite brand voice

**Best Practices:**
- Provide detailed custom instructions for better results
- Paste relevant RFP sections into "Bid Documents Content"
- Specify which services to emphasize
- Review and customize generated content
- Save frequently while editing

### 5. Status Management

**Envelope Statuses:**
- **Draft** - Proposal is being written/edited
- **Completed** - Proposal is ready for submission

**Submission Statuses:**
- **Not Submitted** - Bid package is not yet submitted
- **Submitted** - Bid has been sent to the organization
- **Won** - Bid was successful
- **Lost** - Bid was not awarded

## Workflow Example

### Complete Bid Response Workflow:

1. **Discover Opportunity**
   - Find bid on BidNet Direct or other platform
   - Review requirements and deadlines

2. **Create Bid Proposal**
   - Navigate to Bid Proposals module
   - Click "+ New Bid"
   - Enter solicitation number: `7778493665`
   - Enter title: "Website Development and Digital Marketing Services"
   - Fill in organization: "City of Springfield"
   - Set closing date: 30 days from now
   - Add contact information
   - Save bid proposal

3. **Generate Technical Proposal**
   - Go to "Technical" tab
   - Click "Generate with AI"
   - Add custom instructions:
     ```
     Focus on our proven track record with government agencies.
     Emphasize data security, compliance with federal standards,
     and our 24/7 support capabilities.
     ```
   - Specify services: "Website Development, SEO, Content Management, Analytics"
   - Click "Generate Proposal"
   - Review and customize generated content
   - Click "Save"
   - Mark as "Completed" when ready

4. **Generate Cost Proposal**
   - Go to "Cost" tab
   - Click "Generate with AI"
   - Add custom instructions:
     ```
     Provide competitive pricing with clear breakdown.
     Include setup costs, monthly retainer, and a la carte options.
     Show 3 package options: Basic, Standard, Premium.
     ```
   - Specify services: "Website Development, SEO, Social Media Management"
   - Click "Generate Proposal"
   - Review pricing and adjust as needed
   - Click "Save"
   - Mark as "Completed" when ready

5. **Prepare Final Package**
   - Review both Technical and Cost proposals
   - Copy content to official bid documents
   - Add any required attachments
   - Format according to RFP requirements

6. **Submit to Client**
   - Submit through BidNet Direct or specified platform
   - Update bid status to "Submitted" in CDM Suite
   - Add submission date and confirmation number

7. **Track Outcome**
   - Monitor for award announcements
   - Update status to "Won" or "Lost"
   - Document lessons learned for future bids

## Database Schema

```prisma
model BidProposal {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id])
  
  // Basic Information
  solicitationNumber    String
  referenceNumber       String?
  title                 String
  description           String?
  issuingOrganization   String?
  solicitationType      String?
  location              String?
  bidUrl                String?
  
  // Important Dates
  publicationDate       DateTime?
  bidIntentDeadline     DateTime?
  questionDeadline      DateTime?
  closingDate           DateTime?
  
  // Contact Information
  contactName           String?
  contactEmail          String?
  contactPhone          String?
  
  // Envelope 1: Technical Proposal
  technicalProposal     String?  // Rich text content
  technicalStatus       String   @default("draft") // draft, completed
  technicalDocuments    Json?    // Array of document metadata
  technicalLastEdited   DateTime?
  technicalGeneratedBy  String?  // AI generation metadata
  
  // Envelope 2: Cost Proposal
  costProposal          String?  // Rich text content
  costStatus            String   @default("draft") // draft, completed
  costDocuments         Json?    // Array of document metadata
  costPricing           Json?    // Structured pricing data
  costLastEdited        DateTime?
  costGeneratedBy       String?  // AI generation metadata
  
  // Submission Tracking
  submissionStatus      String   @default("not_submitted")
  // not_submitted, submitted, won, lost
  submittedAt           DateTime?
  awardedAt             DateTime?
  
  // Metadata
  notes                 String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

## API Endpoints

### List & Create Bids
- **GET** `/api/bid-proposals` - List all bid proposals
- **POST** `/api/bid-proposals` - Create new bid proposal

### Individual Bid Operations
- **GET** `/api/bid-proposals/[id]` - Get bid details
- **PUT** `/api/bid-proposals/[id]` - Update bid
- **DELETE** `/api/bid-proposals/[id]` - Delete bid

### AI Generation
- **POST** `/api/bid-proposals/[id]/generate` - Generate proposal with AI

## Tips & Best Practices

### For Better AI Results:
1. **Be Specific** - Provide detailed custom instructions
2. **Include Context** - Paste relevant RFP sections
3. **Highlight Services** - Specify which CDM Suite services to emphasize
4. **Review & Edit** - Always customize generated content
5. **Save Frequently** - Don't lose your work

### For Efficient Bid Management:
1. **Create Immediately** - Add bids as soon as you find them
2. **Set Deadlines** - Always enter closing dates for reminders
3. **Use Draft Status** - Mark envelopes as "Completed" only when ready
4. **Track Outcomes** - Update submission status for reporting
5. **Add Notes** - Document important details and decisions

### For Winning Proposals:
1. **Customize Everything** - Don't submit raw AI output
2. **Match RFP Format** - Follow their structure and requirements
3. **Show Expertise** - Reference past projects and results
4. **Be Competitive** - Price fairly and show value
5. **Meet Deadlines** - Submit early, never late

## Testing & Verification

### ✅ Tested Features:

1. **Bid Creation**
   - ✅ Form validation
   - ✅ Required fields enforcement
   - ✅ Database save
   - ✅ Redirect to detail view

2. **Bid List View**
   - ✅ Display all bids
   - ✅ Status badges
   - ✅ Search functionality
   - ✅ Filter by status
   - ✅ Sort by date

3. **Bid Detail View**
   - ✅ Three-tab interface
   - ✅ Bid info display
   - ✅ Technical proposal editor
   - ✅ Cost proposal editor
   - ✅ Status indicators

4. **AI Generation**
   - ✅ Generation dialog
   - ✅ Custom instructions input
   - ✅ Services specification
   - ✅ API integration
   - ✅ Content generation (requires LLM API key)

### Test Bid Created:
- Solicitation #: `7778493665`
- Title: "Website Development and Digital Marketing Services"
- Status: Draft
- Location: `/dashboard/bid-proposals/cmhpzsyl10000plbyx03r5c1b`

## Troubleshooting

### "I don't see Bid Proposals in my sidebar"
**Solution:** This feature is only available to admin/employee accounts. Regular clients cannot access bid proposals. Log in with an admin account or navigate directly to `/dashboard/bid-proposals`.

### "AI Generation isn't working"
**Possible Causes:**
1. LLM API key not configured
2. Network connectivity issues
3. API rate limits reached

**Solution:** Check environment variables and API key configuration in `.env.local`.

### "I can't save my proposal"
**Possible Causes:**
1. Database connection issue
2. Authentication expired
3. Invalid data format

**Solution:** Check browser console for errors, refresh the page, and try again. If persistent, contact system administrator.

## Future Enhancements

### Planned Features:
- 📎 **Document Attachments** - Upload and manage bid documents
- 📊 **Pricing Calculator** - Interactive pricing builder
- 📧 **Email Integration** - Send proposals directly to clients
- 📅 **Calendar Integration** - Sync deadlines with Google Calendar
- 📈 **Win/Loss Analytics** - Track bid success rates
- 🔔 **Deadline Reminders** - Email/SMS notifications for approaching deadlines
- 👥 **Team Collaboration** - Multiple users working on same bid
- 📝 **Templates** - Save and reuse proposal templates
- 🔍 **Version History** - Track all changes and revisions
- 📄 **PDF Export** - Generate formatted PDF proposals

## Support

For technical support or feature requests:
- **Email:** cdmsuitellc@gmail.com
- **Dashboard:** Contact support through Help & Support link
- **Documentation:** This guide and BID_PROPOSALS_IMPLEMENTATION.md

## Summary

The Bid Proposals module streamlines the RFP response process with:
- ✅ Centralized bid tracking
- ✅ AI-powered proposal generation
- ✅ Separate Technical and Cost envelopes
- ✅ Status tracking and workflow management
- ✅ Professional, customizable content
- ✅ Employee-only access for internal use

Start creating winning proposals today! 🎯
