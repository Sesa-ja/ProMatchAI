interface JobLike {
  id?: string | number;
  title?: string;
  company?: string;
  location?: string;
}

const DELETED_JOB_IDS_KEY = 'promatchai_deleted_job_ids';
const DELETED_JOB_SIGNATURES_KEY = 'promatchai_deleted_job_signatures';

const normalize = (value?: string) => (value || '').trim().toLowerCase();

const getJobSignature = (job: JobLike) =>
  [normalize(job.title), normalize(job.company), normalize(job.location)].join('|');

const readStringSet = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    const values = raw ? JSON.parse(raw) : [];
    return new Set<string>(Array.isArray(values) ? values.map((value) => String(value)) : []);
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return new Set<string>();
  }
};

const writeStringSet = (key: string, values: Set<string>) => {
  localStorage.setItem(key, JSON.stringify(Array.from(values)));
};

export const markJobDeleted = (job: JobLike) => {
  const deletedIds = readStringSet(DELETED_JOB_IDS_KEY);
  const deletedSignatures = readStringSet(DELETED_JOB_SIGNATURES_KEY);

  if (job.id !== undefined && job.id !== null) {
    deletedIds.add(String(job.id));
  }

  const signature = getJobSignature(job);
  if (signature !== '||') {
    deletedSignatures.add(signature);
  }

  writeStringSet(DELETED_JOB_IDS_KEY, deletedIds);
  writeStringSet(DELETED_JOB_SIGNATURES_KEY, deletedSignatures);
};

export const unmarkJobDeleted = (job: JobLike) => {
  const deletedIds = readStringSet(DELETED_JOB_IDS_KEY);
  const deletedSignatures = readStringSet(DELETED_JOB_SIGNATURES_KEY);

  if (job.id !== undefined && job.id !== null) {
    deletedIds.delete(String(job.id));
  }

  const signature = getJobSignature(job);
  if (signature !== '||') {
    deletedSignatures.delete(signature);
  }

  writeStringSet(DELETED_JOB_IDS_KEY, deletedIds);
  writeStringSet(DELETED_JOB_SIGNATURES_KEY, deletedSignatures);
};

export const filterDeletedJobs = <T extends JobLike>(jobs: T[]) => {
  const deletedIds = readStringSet(DELETED_JOB_IDS_KEY);

  return jobs.filter((job) => {
    const idMatch = job.id !== undefined && job.id !== null && deletedIds.has(String(job.id));
    return !idMatch;
  });
};

export const mergeJobCollections = <T extends JobLike>(localJobs: T[], backendJobs: T[]) => {
  const merged = [...backendJobs];

  for (const localJob of localJobs) {
    const existingIndex = merged.findIndex((job) => String(job.id) === String(localJob.id));
    if (existingIndex === -1) {
      merged.push(localJob);
    } else {
      merged[existingIndex] = { ...backendJobs[existingIndex], ...localJob };
    }
  }

  return merged;
};
