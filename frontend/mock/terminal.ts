import type { PendingIssuancesResponse, DashboardKpi } from '../src/pages/terminal/types';
import { faker } from '@faker-js/faker';

export const getMockDashboardKpi = (): Promise<DashboardKpi> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        pendingCount: faker.number.int({ min: 0, max: 10 }),
        approvedToday: faker.number.int({ min: 50, max: 200 }),
        rejectedToday: faker.number.int({ min: 0, max: 10 }),
        customerCount: faker.number.int({ min: 100, max: 500 }),
      });
    }, 300); // Simulate network delay
  });
};

export const getMockPendingIssuances = (): Promise<PendingIssuancesResponse> => {
  return new Promise((resolve) => {
    const requestCount = faker.number.int({ min: 1, max: 5 });
    const content = Array.from({ length: requestCount }, () => {
      const requestedAt = faker.date.recent();
      return {
        requestId: faker.string.uuid(),
        customerNickname: faker.person.firstName(),
        customerPhoneNumber: `010-****-${faker.string.numeric(4)}`,
        requestedAt: requestedAt.toISOString(),
        expiresAt: new Date(requestedAt.getTime() + 10 * 60 * 1000).toISOString(),
        status: 'PENDING' as const,
      };
    });

    setTimeout(() => {
      resolve({
        content,
        pageable: {
          pageNumber: 0,
          pageSize: 10,
        },
        totalPages: 1,
        totalElements: requestCount,
      });
    }, 500); // Simulate network delay
  });
};
