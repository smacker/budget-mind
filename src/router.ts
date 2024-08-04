import { createRouter } from '@nanostores/router';

export const $router = createRouter({
  dashboard: `${import.meta.env.BASE_URL}`,
  transactions: `${import.meta.env.BASE_URL}transactions`,
});
