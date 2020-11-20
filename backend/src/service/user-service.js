import { getRepository } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { User } from '../model/user';
import { EntityAlreadyExist } from '../common/error/entity-already-exist';
import { EntityNotFoundError } from '../common/error/entity-not-found-error';

class UserService {
  constructor() {
    this.userRepository = getRepository(User);
  }

    static instance = null;

    static getInstance() {
      if (UserService.instance === null) {
        UserService.instance = new UserService();
      }
      return UserService.instance;
    }

    @Transactional()
    async signup({
      email, name, password, profileImage
    }) {
      const promises = [];
      promises.push(this.userRepository.findOne({ email }));
      promises.push(this.userRepository.findOne({ name }));

      const [userByEmail, userByName] = await Promise.all(promises);
      if (userByEmail || userByName) { throw new EntityAlreadyExist(); }

      const newUser = this.userRepository.create({
        email, name, password, profileImage
      });
      await this.userRepository.save(newUser);
    }

    async getUsers() {
      const users = await this.userRepository.find();
      if (!users) { throw new EntityNotFoundError(); }

      return users;
    }
}

export default UserService;
