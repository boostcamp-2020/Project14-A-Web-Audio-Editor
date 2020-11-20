import Application from './application';

class ApplicationFactory {
  static async create() {
    const application = new Application();
    await application.initialize();
    return application;
  }
}

export default ApplicationFactory;
