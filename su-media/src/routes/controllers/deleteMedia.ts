import { IMiddleware } from 'koa-router';
import { MediaDb } from '../../database/mediadb';

import { PREFIX, ERROR_CODE } from "../../utils/const";
import { sendSuccess, sendError } from "../../utils/response";
import { unlinkSync } from 'fs';
import globSync from 'glob';
import { Context } from 'koa';

export function deleteMedia(mediaDb: MediaDb): IMiddleware {
  return async (ctx: Context, next: (err?: any) => void) => {
    const id = ctx.params.id;
    
    if (!id) {
      ctx.status = ERROR_CODE;
      ctx.body = sendError('Malformed request');
      return;
    }
    
    await mediaDb.deleteMedia([id]);
    globSync(PREFIX + id + '.*', (err: any, matches: any) => {
      if(!err && matches.length){
        const file = matches[0];
        try {
          unlinkSync(file);
        } catch (ex) {
          console.log(`Tried to delete file with ${PREFIX}${id}`);
        }
      }
    });
    ctx.status = 200;
    ctx.body  = sendSuccess('Media deleted');
  }
}