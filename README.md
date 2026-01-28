# TrackBat - Battery Box Manufacturing System

A simple, clean, and professional workshop job tracking system for manufacturing battery boxes.

## Features

- **Battery Box Tracking**: Track battery boxes through manufacturing processes
- **Process Management**: Define processes with optional checklists
- **Checklist Templates**: Create reusable checklist templates with different question types
- **Operator Workflow**: Simple interface for operators to complete checklists
- **Progress Tracking**: Real-time progress visualization
- **Excel Export**: Professional audit-ready Excel reports for completed checklists
- **Role-Based Access**: Admin, Operator, and Quality roles

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon.db recommended)
- **Authentication**: JWT-based session management

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon.db free tier works great)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/trackbat.git
   cd trackbat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your database URL and JWT secret:
   ```
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secure-secret"
   ```

4. Push database schema:
   ```bash
   npm run db:push
   ```

5. Seed the database:
   ```bash
   npm run db:seed
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

After seeding, you can log in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@factory.com | admin123 |
| Operator | operator@factory.com | operator123 |
| Quality | quality@factory.com | quality123 |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `DATABASE_URL`: Your Neon.db connection string
   - `JWT_SECRET`: A secure random string
4. Deploy!

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 characters) |

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── admin/          # Admin pages (processes, checklists, users)
│   │   ├── battery-boxes/  # Battery box management
│   │   └── dashboard/      # Main dashboard
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── battery-boxes/  # Battery box CRUD
│   │   ├── checklist-templates/
│   │   ├── dashboard/      # Dashboard stats
│   │   ├── processes/      # Process CRUD
│   │   └── users/          # User management
│   └── login/              # Login page
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── auth-provider.tsx   # Authentication context
├── lib/
│   ├── auth.ts            # JWT utilities
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Helper functions
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed data
```

## Usage Guide

### Admin Flow

1. **Create Processes**: Define manufacturing processes (Mechanical Assembly, Welding, HV Test, etc.)
2. **Set Checklist Requirement**: Mark which processes require a checklist
3. **Create Checklist Templates**: Add templates with questions (Yes/No, Text, Number)
4. **Manage Users**: Create operator and quality user accounts

### Creating a Battery Box

1. Click "New Battery Box"
2. Enter a unique serial number
3. Select which processes this box will go through
4. For processes requiring checklists, select a template
5. Click "Create Battery Box"

### Operator Flow

1. Log in as an operator
2. Click on a battery box from the dashboard
3. Select a process to work on
4. Click "Start Process" to begin
5. Answer all checklist questions
6. Click "Save Answers" (auto-completes when all required questions answered)

### Exporting Checklists

1. Navigate to a completed process
2. Click the download icon
3. A professional Excel report will be generated

## Data Model

- **User**: System users with roles (Admin, Operator, Quality)
- **Process**: Manufacturing process definitions
- **ChecklistTemplate**: Reusable checklist templates
- **ChecklistQuestion**: Questions within a template
- **BatteryBox**: Individual battery boxes being manufactured
- **BatteryBoxProcess**: Junction table tracking which processes apply to which boxes
- **ChecklistAnswer**: Recorded answers with audit trail

## License

MIT
