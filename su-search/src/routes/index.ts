import Router from 'koa-router';
import { search, deleteAll } from './controllers';
import { Auth } from '../utils/lib';
import { SearchDb, Elastic } from '../database';
import { authentication } from '../middleware';

export class Routes {
  public router: Router;
  public auth: Auth;

  constructor(searchDb: SearchDb, elastic: Elastic) {
    this.router = new Router();
    this.auth = new Auth(searchDb);

    this.router.post('/search', search(searchDb, elastic));
    this.router.get('/_deleteAll', deleteAll(elastic));
    this.router.get('/', (ctx: any, next: any) => {
      ctx.body = 'Hello World!';
    });
  }
}
