import { ApplicationFactory } from './application';

const main = async () => {
  const app = await ApplicationFactory.create();
  await app.listen(process.env.port || 5000);
};

main();
