import { UserService } from '../service';

const sendUsers = async (req, res, next) => {
  try {
    const userService = UserService.getInstance();
    const users = await userService.getUsers();

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const signup = async (req, res, next) => {
  try {
    const {
      email, name, password, profileImage
    } = req.body;
    const userService = UserService.getInstance();
    await userService.signup({
      email,
      name,
      password,
      profileImage
    });

    res.status(200).end();
  } catch (error) {
    next(error);
  }
};

export { sendUsers, signup };
