import { getEntityManagerOrTransactionManager } from 'typeorm-transactional-cls-hooked';
import { agent } from 'supertest';
import { TransactionWrapper } from '../TransactionWrapper';
import { ApplicationFactory } from '../../application';
import { UserService } from '../../service';

const mockUser = {
  id: 1,
  email: 'newtest1@test.com',
  name: '테스터테스터1',
  password: 'test123!@#',
  profileImage: 'http://test-image.com'
};

const InvalidMockUser = {
  id: 1,
  email: 'abcd',
  name: 1000,
  password: 2134,
  profileImage: 'abcd'
};

describe('Auth Router Test', () => {
  let app = null;

  beforeAll(async () => {
    app = await ApplicationFactory.create();
  });

  test('유효한 회원가입 정보(이메일, 이름, 프로필사진, 패스워드)로 회원가입 할 수 있다', async () => {
    await TransactionWrapper.transaction(async () => {
      const entityManager = getEntityManagerOrTransactionManager();
      await entityManager.query('SAVEPOINT STARTPOINT');

      // given | when
      const response = await agent(app.httpServer).post('/auth/signup').send({
        email: mockUser.email,
        name: mockUser.name,
        password: mockUser.password,
        profileImage: mockUser.profileImage
      });

      // then
      expect(response.status).toEqual(200);

      const userService = UserService.getInstance();
      const users = await userService.getUsers();
      expect(users[0].id).toBe(mockUser.id);
      expect(users[0].name).toBe(mockUser.name);
      expect(users[0].password).toBe(mockUser.password);
      expect(users[0].profileImage).toBe(mockUser.profileImage);

      await entityManager.query('ROLLBACK TO STARTPOINT');
    });
  });

  test('유효하지 않은 회원가입 정보(이메일, 이름, 프로필사진, 패스워드)로 회원가입 할 수 없다', async () => {
    await TransactionWrapper.transaction(async () => {
      const entityManager = getEntityManagerOrTransactionManager();
      await entityManager.query('SAVEPOINT STARTPOINT');

      // given | when
      const response = await agent(app.httpServer).post('/auth/signup').send({
        email: InvalidMockUser.email,
        name: InvalidMockUser.name,
        password: InvalidMockUser.password,
        profileImage: InvalidMockUser.profileImage
      });

      // then
      expect(response.status).toEqual(400);

      await entityManager.query('ROLLBACK TO STARTPOINT');
    });
  });
});
