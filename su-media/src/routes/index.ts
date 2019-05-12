import Router from 'koa-router';

import { Auth } from '../utils/lib/auth';
import { authentication } from '../middleware';
import { addMedia, deleteMedia } from './controllers';
import { UserDb } from '../database';
import { Instance } from 'koa-multer';
import { MediaDb } from '../database/mediadb';

export class Routes {
  public router: Router;
  private auth: Auth;

  constructor(userDb: UserDb, mediaDb: MediaDb, upload: Instance) {
    this.router = new Router();
    this.auth = new Auth(userDb);

    this.router.post(
      '/addmedia',
      authentication(this.auth),
      upload.single('content'),
      addMedia(mediaDb)
    );
    this.router.get(
      '/addmedia',
      authentication(this.auth),
      (ctx: any, next: (err?: any) => void) => {
          ctx.status(200);
      }
    );
    this.router.get('/deletemedia/:id', deleteMedia(mediaDb));
  }
}
