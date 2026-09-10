import {
  resourceNames,
  readResource,
  writeResource,
} from '../controllers/resource.controller.ts';
import { Router } from 'express';
import { getAuth, postAuth } from '../controllers/auth.controller.ts';
import { getGym, mutateGym } from '../controllers/gym.controller.ts';
const router = Router();
router.get('/auth', getAuth);
router.post('/auth', postAuth);
router.get('/gym', getGym);
router.post('/gym', mutateGym);

for (const [name, kind] of Object.entries(resourceNames)) {
  router.get('/' + name, readResource(name as keyof typeof resourceNames));
  router.get(
    '/' + name + '/:id',
    readResource(name as keyof typeof resourceNames),
  );
  router.post(
    '/' + name,
    writeResource(
      kind + '.' + (['payment', 'checkin'].includes(kind) ? 'create' : 'save'),
    ),
  );
  if (!['payments', 'checkins'].includes(name)) {
    router.put('/' + name + '/:id', writeResource(kind + '.save'));
    if (name !== 'users')
      router.delete('/' + name + '/:id', writeResource(kind + '.delete'));
  }
}
router.patch('/members/:id/archive', writeResource('member.archive'));
router.patch('/plans/:id/toggle', writeResource('plan.toggle'));
router.patch('/users/:id/toggle', writeResource('user.toggle'));
router.post('/checkins/checkout', writeResource('checkin.checkout'));
export default router;
