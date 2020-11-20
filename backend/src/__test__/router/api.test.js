import { getEntityManagerOrTransactionManager } from 'typeorm-transactional-cls-hooked';
import { agent } from 'supertest';
import { TransactionWrapper } from '../TransactionWrapper';
import { ApplicationFactory } from '../../application';
import { UserService } from '../../service';

const mockUsers = [
  {
    id: 1,
    email: 'newtest1@test.com',
    name: '테스터테스터1',
    password: 'test123!@#',
    profileImage: 'profile image'
  },
  {
    id: 2,
    email: 'newtest2@test.com',
    name: '테스터테스터2',
    password: 'test123!@#',
    profileImage: 'profile image'
  }
];

describe('User Router Test', () => {
  let app = null;

  beforeAll(async () => {
    app = await ApplicationFactory.create();
  });

  test('모든 유저 정보를 조회할 수 있다', async () => {
    await TransactionWrapper.transaction(async () => {
      const entityManager = getEntityManagerOrTransactionManager();
      await entityManager.query('SAVEPOINT STARTPOINT');

      // given
      const userService = UserService.getInstance();
      const promises = mockUsers.map((mockUser) => userService.signup(mockUser));
      await Promise.all(promises);

      // when
      const response = await agent(app.httpServer).get('/api/users').send();

      // then
      expect(response.status).toEqual(200);

      const users = await userService.getUsers();
      mockUsers.forEach((mockUser, idx) => {
        expect(users[idx].id).toBe(mockUser.id);
        expect(users[idx].name).toBe(mockUser.name);
        expect(users[idx].password).toBe(mockUser.password);
        expect(users[idx].profileImage).toBe(mockUser.profileImage);
      });

      await entityManager.query('ROLLBACK TO STARTPOINT');
    });
  });
});
