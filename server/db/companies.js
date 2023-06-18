import { connection } from './connection.js';
import DataLoader from 'dataloader';

const getCompanyTable = () => connection.table('company');

export async function getCompany(id) {
  return await getCompanyTable().first().where({ id });
}

// data loader for companies by id batched loading, create a new instance of DataLoader for
// each request to avoid caching
export const createCompanyLoader = () =>
  new DataLoader(async (ids) => {
    // console.log('createCompanyLoader[db]:', ids);
    const companies = await getCompanyTable().select().whereIn('id', ids);
    return ids.map((id) => companies.find((company) => company.id === id));
  });
