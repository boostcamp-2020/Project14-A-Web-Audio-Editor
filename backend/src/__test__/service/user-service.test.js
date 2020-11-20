import { getEntityManagerOrTransactionManager } from 'typeorm-transactional-cls-hooked';
import { Application } from '../../application';
import { UserService } from '../../service';
import { TransactionWrapper } from '../TransactionWrapper';
import { User } from '../../model/user';

const mockUsers = [
  {
    email: 'test1@test.com',
    name: '테스터1',
    password: 'test123!@#',
    profileImage: 'http://test-image.com'
  },
  {
    email: 'test2@test.com',
    name: '테스터2',
    password: 'test123!@#',
    profileImage: 'http://test-image.com'
  }
];

describe('UserService Test', () => {
  const app = new Application();

  beforeAll(async () => {
    await app.initEnvironment();
    await app.initDatabase();
  });

  test('모든 유저 정보를 조회할 수 있다', async () => {
    const userService = UserService.getInstance();

    await TransactionWrapper.transaction(async () => {
      const entityManager = getEntityManagerOrTransactionManager();
      await entityManager.query('SAVEPOINT STARTPOINT');

      // given
      const promises = mockUsers.map((user) => entityManager.save(User, user));
      await Promise.all(promises);

      // when
      const users = await userService.getUsers();

      // then
      mockUsers.forEach((mockUser, idx) => {
        expect(users[idx].id).toBe(mockUser.id);
        expect(users[idx].name).toBe(mockUser.name);
        expect(users[idx].password).toBe(mockUser.password);
        expect(users[idx].profileImage).toBe(mockUser.profileImage);
      });

      await entityManager.query('ROLLBACK TO STARTPOINT');
    });
  });

  test('올바른 이메일, 이름, 프로필사진, 패스워드 정보로 회원가입을 할 수 있다', async () => {
    const userService = UserService.getInstance();

    await TransactionWrapper.transaction(async () => {
      const entityManager = getEntityManagerOrTransactionManager();
      await entityManager.query('SAVEPOINT STARTPOINT');

      // given | when
      const promises = mockUsers.map((mockUser) => userService.signup(mockUser));
      await Promise.all(promises);

      // then
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
