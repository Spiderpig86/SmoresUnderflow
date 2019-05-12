import { IMiddleware } from 'koa-router';

// import { Context } from 'koa';
import { sendSuccess, sendError } from '../../utils/response';
import { getMime, ERROR_CODE } from '../../utils/const';
import { Media } from '../../models/media';
import { MediaDb } from '../../database/mediadb';

export function addMedia(mediaDb: MediaDb): IMiddleware {
  return async (ctx: any, next: (err?: any) => void) => {
    if (!ctx.req.file){
      ctx.status = ERROR_CODE;
      sendError('No file uploaded');
      return;
    }

    const file = ctx.req.file;
    const mime = getMime(file.mimetype);
    const length = file.filename.indexOf(mime) - 1;
    const id = file.filename.substr(0, length);

    const media: Media = {
      _id: id,
      machine: (id as string).substr(0, 3),
      used: false,
      username: ctx.state.user.username
    };
    
    await mediaDb.insert(media);

    ctx.status = 200
    ctx.body = sendSuccess('Successfully added media.', id, 'id');
  }
}