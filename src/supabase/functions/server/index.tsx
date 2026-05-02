import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';
import {
  DEFAULT_RECOMMENDATION_WEIGHTS,
  normalizeCandidateProfile,
  normalizeOpportunityProfile,
  recommendCandidatesForOpportunity,
  recommendOpportunitiesForCandidate,
} from '../../../utils/recommendations.ts';
import { computeProfileAchievements } from '../../../utils/profileAchievements.ts';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Helper function to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============= USER ROUTES =============

// Get all users (refugees and employers)
app.get('/make-server-215f50be/users', async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    return c.json({
      success: true,
      data: users.map((user: any) => ({
        ...user,
        achievements: computeProfileAchievements(user),
      })),
    });
  } catch (error) {
    console.log('Error fetching users:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get a specific user
app.get('/make-server-215f50be/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const user = await kv.get(`user:${id}`);
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    return c.json({
      success: true,
      data: {
        ...user,
        achievements: computeProfileAchievements(user),
      },
    });
  } catch (error) {
    console.log('Error fetching user:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new user
app.post('/make-server-215f50be/users', async (c) => {
  try {
    const body = await c.req.json();
    const userId = String(body.id || generateId());
    const user = {
      ...body,
      id: userId,
      achievements: computeProfileAchievements(body),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`user:${userId}`, user);
    return c.json({ success: true, data: user });
  } catch (error) {
    console.log('Error creating user:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a user
app.put('/make-server-215f50be/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existingUser = await kv.get(`user:${id}`);
    if (!existingUser) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    const updatedUser = {
      ...existingUser,
      ...body,
      id,
      achievements: computeProfileAchievements({
        ...existingUser,
        ...body,
        id,
      }),
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`user:${id}`, updatedUser);
    return c.json({ success: true, data: updatedUser });
  } catch (error) {
    console.log('Error updating user:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a user
app.delete('/make-server-215f50be/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`user:${id}`);
    return c.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.log('Error deleting user:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= JOB ROUTES =============

// Get all jobs
app.get('/make-server-215f50be/jobs', async (c) => {
  try {
    const jobs = await kv.getByPrefix('job:');
    return c.json({ success: true, data: jobs });
  } catch (error) {
    console.log('Error fetching jobs:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get a specific job
app.get('/make-server-215f50be/jobs/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const job = await kv.get(`job:${id}`);
    if (!job) {
      return c.json({ success: false, error: 'Job not found' }, 404);
    }
    return c.json({ success: true, data: job });
  } catch (error) {
    console.log('Error fetching job:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new job
app.post('/make-server-215f50be/jobs', async (c) => {
  try {
    const body = await c.req.json();
    const jobId = String(body.id || generateId());
    const job = {
      ...body,
      id: jobId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: body.status || 'active',
    };
    await kv.set(`job:${jobId}`, job);
    return c.json({ success: true, data: job });
  } catch (error) {
    console.log('Error creating job:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a job
app.put('/make-server-215f50be/jobs/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existingJob = await kv.get(`job:${id}`);
    if (!existingJob) {
      return c.json({ success: false, error: 'Job not found' }, 404);
    }
    const updatedJob = {
      ...existingJob,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`job:${id}`, updatedJob);
    return c.json({ success: true, data: updatedJob });
  } catch (error) {
    console.log('Error updating job:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a job
app.delete('/make-server-215f50be/jobs/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`job:${id}`);
    return c.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.log('Error deleting job:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= COURSE ROUTES =============

// Get all courses
app.get('/make-server-215f50be/courses', async (c) => {
  try {
    const courses = await kv.getByPrefix('course:');
    return c.json({ success: true, data: courses });
  } catch (error) {
    console.log('Error fetching courses:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get a specific course
app.get('/make-server-215f50be/courses/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const course = await kv.get(`course:${id}`);
    if (!course) {
      return c.json({ success: false, error: 'Course not found' }, 404);
    }
    return c.json({ success: true, data: course });
  } catch (error) {
    console.log('Error fetching course:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new course
app.post('/make-server-215f50be/courses', async (c) => {
  try {
    const body = await c.req.json();
    const courseId = String(body.id || generateId());
    const course = {
      ...body,
      id: courseId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: body.status || 'active',
    };
    await kv.set(`course:${courseId}`, course);
    return c.json({ success: true, data: course });
  } catch (error) {
    console.log('Error creating course:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a course
app.put('/make-server-215f50be/courses/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existingCourse = await kv.get(`course:${id}`);
    if (!existingCourse) {
      return c.json({ success: false, error: 'Course not found' }, 404);
    }
    const updatedCourse = {
      ...existingCourse,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`course:${id}`, updatedCourse);
    return c.json({ success: true, data: updatedCourse });
  } catch (error) {
    console.log('Error updating course:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a course
app.delete('/make-server-215f50be/courses/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`course:${id}`);
    return c.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    console.log('Error deleting course:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= APPLICATION ROUTES =============

// Get all applications
app.get('/make-server-215f50be/applications', async (c) => {
  try {
    const applications = await kv.getByPrefix('application:');
    return c.json({ success: true, data: applications });
  } catch (error) {
    console.log('Error fetching applications:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new application
app.post('/make-server-215f50be/applications', async (c) => {
  try {
    const body = await c.req.json();
    const applicationId = String(body.id || generateId());
    const application = {
      ...body,
      id: applicationId,
      createdAt: new Date().toISOString(),
      status: body.status || 'pending',
    };
    await kv.set(`application:${applicationId}`, application);
    return c.json({ success: true, data: application });
  } catch (error) {
    console.log('Error creating application:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update application status
app.put('/make-server-215f50be/applications/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existingApplication = await kv.get(`application:${id}`);
    if (!existingApplication) {
      return c.json({ success: false, error: 'Application not found' }, 404);
    }
    const updatedApplication = {
      ...existingApplication,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`application:${id}`, updatedApplication);
    return c.json({ success: true, data: updatedApplication });
  } catch (error) {
    console.log('Error updating application:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete an application
app.delete('/make-server-215f50be/applications/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`application:${id}`);
    return c.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    console.log('Error deleting application:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= RECOMMENDATION ROUTES =============

app.get('/make-server-215f50be/recommendations/opportunities/:candidateId', async (c) => {
  try {
    const candidateId = c.req.param('candidateId');
    const topK = Number(c.req.query('topK') || 5);
    const candidate = await kv.get(`user:${candidateId}`);

    if (!candidate) {
      return c.json({ success: false, error: 'Candidate not found' }, 404);
    }

    const allOpportunities = await kv.getByPrefix('job:');
    const recommendations = recommendOpportunitiesForCandidate(
      normalizeCandidateProfile(candidate),
      allOpportunities,
      DEFAULT_RECOMMENDATION_WEIGHTS,
      topK,
    );

    return c.json({
      success: true,
      data: recommendations.map((recommendation) => ({
        opportunity: recommendation.item,
        score: recommendation.score,
        breakdown: recommendation.breakdown,
      })),
      weights: DEFAULT_RECOMMENDATION_WEIGHTS,
    });
  } catch (error) {
    console.log('Error generating opportunity recommendations:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-215f50be/recommendations/candidates/:opportunityId', async (c) => {
  try {
    const opportunityId = c.req.param('opportunityId');
    const topK = Number(c.req.query('topK') || 8);
    const opportunity = await kv.get(`job:${opportunityId}`);

    if (!opportunity) {
      return c.json({ success: false, error: 'Opportunity not found' }, 404);
    }

    const allUsers = await kv.getByPrefix('user:');
    const candidates = allUsers.filter((user: any) => user.userType === 'refugee');
    const recommendations = recommendCandidatesForOpportunity(
      normalizeOpportunityProfile(opportunity),
      candidates,
      DEFAULT_RECOMMENDATION_WEIGHTS,
      topK,
    );

    return c.json({
      success: true,
      data: recommendations.map((recommendation) => ({
        candidate: recommendation.item,
        score: recommendation.score,
        breakdown: recommendation.breakdown,
      })),
      weights: DEFAULT_RECOMMENDATION_WEIGHTS,
    });
  } catch (error) {
    console.log('Error generating candidate recommendations:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Saved candidates are stored as shortlist records in the KV store.
app.get('/make-server-215f50be/shortlists/opportunity/:opportunityId', async (c) => {
  try {
    const opportunityId = c.req.param('opportunityId');
    const shortlistRecords = await kv.getByPrefix('shortlist:');
    const matches = shortlistRecords.filter((record: any) => record.opportunityId === opportunityId);
    return c.json({ success: true, data: matches });
  } catch (error) {
    console.log('Error fetching shortlist:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-215f50be/shortlists', async (c) => {
  try {
    const body = await c.req.json();
    const shortlistId = String(body.id || generateId());
    const shortlistRecord = {
      id: shortlistId,
      companyId: body.companyId || body.companyName || body.opportunityId,
      companyName: body.companyName || '',
      opportunityId: body.opportunityId,
      opportunityTitle: body.opportunityTitle || '',
      candidateId: body.candidateId,
      candidateName: body.candidateName || '',
      note: body.note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`shortlist:${shortlistId}`, shortlistRecord);
    return c.json({ success: true, data: shortlistRecord });
  } catch (error) {
    console.log('Error saving shortlist:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put('/make-server-215f50be/shortlists/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existingRecord = await kv.get(`shortlist:${id}`);

    if (!existingRecord) {
      return c.json({ success: false, error: 'Shortlist record not found' }, 404);
    }

    const updatedRecord = {
      ...existingRecord,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`shortlist:${id}`, updatedRecord);
    return c.json({ success: true, data: updatedRecord });
  } catch (error) {
    console.log('Error updating shortlist:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-215f50be/shortlists/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`shortlist:${id}`);
    return c.json({ success: true, message: 'Shortlist removed' });
  } catch (error) {
    console.log('Error removing shortlist:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============= ANALYTICS ROUTES =============

// Get analytics data for admin dashboard
app.get('/make-server-215f50be/analytics', async (c) => {
  try {
    const users = await kv.getByPrefix('user:');
    const jobs = await kv.getByPrefix('job:');
    const courses = await kv.getByPrefix('course:');
    const applications = await kv.getByPrefix('application:');

    const refugees = users.filter((u: any) => u.userType === 'refugee');
    const employers = users.filter((u: any) => u.userType === 'employer');
    const activeJobs = jobs.filter((j: any) => j.status === 'active');
    const activeCourses = courses.filter((c: any) => c.status === 'active');
    const pendingApplications = applications.filter((a: any) => a.status === 'pending');

    return c.json({
      success: true,
      data: {
        totalUsers: users.length,
        totalRefugees: refugees.length,
        totalEmployers: employers.length,
        totalJobs: jobs.length,
        activeJobs: activeJobs.length,
        totalCourses: courses.length,
        activeCourses: activeCourses.length,
        totalApplications: applications.length,
        pendingApplications: pendingApplications.length,
      },
    });
  } catch (error) {
    console.log('Error fetching analytics:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Health check
app.get('/make-server-215f50be/health', (c) => {
  return c.json({ success: true, message: 'Server is running' });
});

Deno.serve(app.fetch);
