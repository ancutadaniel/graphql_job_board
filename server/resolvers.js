import {
  getJobs,
  getJob,
  getJobsForCompany,
  createJob,
  deleteJob,
  updateJob,
  countJobs,
} from './db/jobs.js';
import { getUser, getUserByEmail } from './db/users.js';
import { getCompany } from './db/companies.js';
import { toIsoDate, notFoundError, notAuthorizedError } from './db/utils.js';

export const resolvers = {
  Query: {
    job: async (_parent, { id }) => {
      const job = await getJob(id);
      notFoundError(`Job not found: ${id}`, job);
      return job;
    },
    jobs: async (_parent, { limit, offset }, _context) => {
      const items = await getJobs(limit, offset);
      const totalCount = await countJobs();
      return {
        items,
        totalCount,
      };
    },
    company: async (_parent, { id }) => {
      const company = await getCompany(id);
      notFoundError(`Company not found: ${id}`, company);
      return company;
    },
    user: async (_parent, { id }) => {
      const user = await getUser(id);
      notFoundError(`User not found: ${id}`, user);
      return user;
    },
    userByEmail: async (_parent, { email }) => {
      const user = await getUserByEmail(email);
      notFoundError(`User not found: ${email}`, user);
      return user;
    },
  },

  Mutation: {
    createJob: async (_parent, { input }, { user }) => {
      if (!user) {
        notAuthorizedError('You must be logged in to create a job');
      }
      const { title, description } = input;
      const companyId = user.companyId;
      return await createJob({ companyId, title, description });
    },
    deleteJob: async (_parent, { id }, { user }) => {
      if (!user) {
        notAuthorizedError('You must be logged in to delete a job');
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        notFoundError(`Job not found: ${id}`, job);
      }
      return job;
    },
    updateJob: async (
      _parent,
      { id, input: { title, description } },
      { user }
    ) => {
      if (!user) {
        notAuthorizedError('You must be logged in to update a job');
      }
      const job = await updateJob({
        id,
        companyId: user.companyId,
        title,
        description,
      });
      if (!job) {
        notFoundError(`Job not found: ${id}`, job);
      }
      return job;
    },
  },

  // custom resolver for Job.date that replace createdAt with a date string
  Job: {
    date: (job) => toIsoDate(job.createdAt),
    company: (job, _args, { companyLoader }) =>
      companyLoader.load(job.companyId),
  },

  // custom resolver for Company.jobs that returns all jobs for a company
  Company: {
    jobs: (company) => getJobsForCompany(company.id),
  },

  // custom resolver for User.company that returns the company for a user
  User: {
    company: (user) => getCompany(user.companyId),
  },
};
