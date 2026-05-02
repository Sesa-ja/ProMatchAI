# ProMatchAI Backend Documentation

## 📚 Backend Architecture

### Overview
ProMatchAI uses a **serverless backend architecture** powered by **Supabase**, featuring:
- **Supabase Edge Functions** (Deno runtime)
- **PostgreSQL Database**
- **Key-Value Store** for flexible data storage
- **RESTful API** endpoints

### Technology Stack
```
Frontend (React) → Supabase Edge Functions (Deno) → PostgreSQL Database
```

---

## 🏗️ Backend Structure

### 1. **Server Setup**
Located in `/supabase/functions/server/index.tsx`

```typescript
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';

const app = new Hono();

// Enable CORS for all origins
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Logger middleware
app.use('*', logger(console.log));

// Routes prefix: /make-server-215f50be
app.get('/make-server-215f50be/health', (c) => {
  return c.json({ status: 'ok' });
});

// Start server
Deno.serve(app.fetch);
```

### 2. **Key-Value Store**
Located in `/supabase/functions/server/kv_store.tsx`

The database has a pre-configured table called `kv_store_215f50be` that stores data as key-value pairs:

**Available Functions:**
- `get(key)` - Retrieve single value
- `set(key, value)` - Store single value  
- `del(key)` - Delete single value
- `mget(keys[])` - Retrieve multiple values
- `mset(data{})` - Store multiple values
- `mdel(keys[])` - Delete multiple values
- `getByPrefix(prefix)` - Get all values with key prefix

**Example Usage:**
```typescript
import * as kv from './kv_store';

// Store user data
await kv.set('user:123', {
  name: 'John Doe',
  email: 'john@example.com',
  skills: ['JavaScript', 'React']
});

// Retrieve user data
const user = await kv.get('user:123');

// Get all users
const allUsers = await kv.getByPrefix('user:');
```

### 3. **API Endpoints**

#### Base URL
```
https://{projectId}.supabase.co/functions/v1/make-server-215f50be
```

#### Authentication
All requests require the Supabase anonymous key in headers:
```typescript
headers: {
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json'
}
```

#### Available Endpoints

**Users**
- `GET /users` - Get all users
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

**Jobs**
- `GET /jobs` - Get all jobs
- `POST /jobs` - Create new job
- `PUT /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job

**Courses**
- `GET /courses` - Get all courses
- `POST /courses` - Create new course
- `PUT /courses/:id` - Update course  
- `DELETE /courses/:id` - Delete course

**Applications**
- `GET /applications` - Get all applications
- `POST /applications` - Submit application
- `PUT /applications/:id` - Update application status
- `DELETE /applications/:id` - Delete application

**Analytics**
- `GET /analytics` - Get dashboard analytics

---

## 🔧 Initialize Sample Data

### What is it?
The **Initialize Sample Data** feature populates the database with demo content for testing.

### How it was created
Located in `/components/InitializeData.tsx`

```typescript
const initializeData = async () => {
  // Sample jobs
  const sampleJobs = [
    {
      id: 'job-1',
      title: 'Junior Web Developer',
      company: 'Tech Solutions GmbH',
      location: 'Berlin, Germany',
      type: 'Full-time Apprenticeship',
      description: '3-year apprenticeship...',
      requiredSkills: ['HTML/CSS', 'JavaScript'],
      salary: '€800-1200/month',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    // ... more jobs
  ];

  // Sample courses
  const sampleCourses = [
    {
      id: 'course-1',
      title: 'Web Development Basics',
      description: 'Learn HTML, CSS, and JavaScript',
      duration: '40 hours',
      status: 'active',
      offlineAvailable: true,
      createdAt: new Date().toISOString()
    },
    // ... more courses
  ];

  // Store in database
  for (const job of sampleJobs) {
    await kv.set(`job:${job.id}`, job);
  }
  
  for (const course of sampleCourses) {
    await kv.set(`course:${course.id}`, course);
  }
};
```

### When to use it
- **First-time setup**: When starting the app for the first time
- **Testing**: To see how the app works with real data
- **Demo**: For showing the platform to stakeholders

---

## 📊 Data Models

### User Profile
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profilePicture?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  completedCourses: number;
  badges: string[];
  language: Language;
  userType: 'refugee' | 'employer';
  createdAt: string;
}
```

### Job Posting
```typescript
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requiredSkills: string[];
  salary?: string;
  status: 'active' | 'closed';
  createdAt: string;
}
```

### Course
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  materials?: Array<{ name: string; url: string }>;
  offlineAvailable: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
}
```

### Application
```typescript
interface Application {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  jobId: string;
  jobTitle: string;
  company: string;
  introduction: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
```

---

## 🔐 Security

### Environment Variables
The backend uses protected environment variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anonymous key (frontend)
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key (backend only)
- `SUPABASE_DB_URL` - Database connection string

⚠️ **Important**: The `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the frontend!

### Authorization
Currently, the app uses the anonymous key for all requests. For production, implement:
- User authentication (signup/login)
- JWT tokens for protected routes
- Role-based access control (RBAC)

---

## 🚀 Deployment

### How it works
1. **Code is written** in `/supabase/functions/server/`
2. **Deployed automatically** to Supabase Edge Functions
3. **Available at** `https://{projectId}.supabase.co/functions/v1/make-server-215f50be`

### File Limitations
- Server code must be in `/supabase/functions/server/` directory
- **Cannot create subfolders** in server directory
- Can create new `.tsx` files in the server directory
- File operations only allowed in `/tmp` directory

---

## 📝 Best Practices

### 1. Error Handling
Always wrap database operations in try-catch:
```typescript
try {
  const data = await kv.get('user:123');
  return c.json({ success: true, data });
} catch (error) {
  console.error('Database error:', error);
  return c.json({ success: false, error: error.message }, 500);
}
```

### 2. Logging
Use console.log for debugging (visible in Supabase logs):
```typescript
console.log('Fetching user:', userId);
console.error('Error occurred:', error);
```

### 3. Data Validation
Validate input before storing:
```typescript
if (!data.name || !data.email) {
  return c.json({ success: false, error: 'Name and email required' }, 400);
}
```

### 4. Key Naming Convention
Use prefixes for organization:
```typescript
user:{id}           // User profiles
job:{id}            // Job postings  
course:{id}         // Courses
application:{id}    // Applications
```

---

## 🔄 How Data Flows

### Example: Student Applies for Job

1. **Frontend** - Student clicks "Apply" button
   ```typescript
   const response = await fetch(`${API_URL}/applications`, {
     method: 'POST',
     headers: { Authorization: `Bearer ${publicAnonKey}` },
     body: JSON.stringify({
       userId: userProfile.id,
       jobId: selectedJob.id,
       introduction: 'I am interested...'
     })
   });
   ```

2. **Backend** - Receives and processes request
   ```typescript
   app.post('/make-server-215f50be/applications', async (c) => {
     const data = await c.req.json();
     const applicationId = `application-${Date.now()}`;
     
     await kv.set(`application:${applicationId}`, {
       ...data,
       id: applicationId,
       status: 'pending',
       createdAt: new Date().toISOString()
     });
     
     return c.json({ success: true });
   });
   ```

3. **Admin** - Views application
   ```typescript
   // Fetches all applications
   const apps = await kv.getByPrefix('application:');
   
   // Can view student's full profile
   const studentProfile = await kv.get(`user:${app.userId}`);
   ```

---

## 🎯 Future Enhancements

### Recommended Improvements
1. **User Authentication** - Implement Supabase Auth
2. **Real-time Updates** - Use Supabase Realtime
3. **File Storage** - Store PDFs/videos in Supabase Storage
4. **Email Notifications** - Notify users of application status
5. **Search & Filters** - Advanced job/course search
6. **AI Matching** - Use AI API to improve skill matching
7. **Analytics** - Track user behavior and success rates

---

## 📞 Support

For questions about the backend:
- Check Supabase documentation: https://supabase.com/docs
- Review the KV store utilities: `/supabase/functions/server/kv_store.tsx`
- Inspect server logs in Supabase dashboard

---

**Last Updated**: December 2024  
**Version**: 1.0.0
