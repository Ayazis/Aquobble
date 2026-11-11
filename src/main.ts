import { LoadingScreen } from '@menu';
import { bootstrap } from '@app';

const loading = new LoadingScreen(document.body);
try {
  const game = await bootstrap(document.body, loading);
  game.start();
  loading.finish();
} catch (error) {
  loading.fail();
  throw error;
}
