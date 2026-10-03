import createApp from './app';
import config from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   🚀  TECHNOVA API SERVER               ║
  ║                                          ║
  ║   Environment : ${config.nodeEnv.padEnd(22)}║
  ║   Port        : ${String(config.port).padEnd(22)}║
  ║   Health      : http://localhost:${config.port}/api/health ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
});
