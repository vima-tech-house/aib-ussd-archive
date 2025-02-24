import { RequestHandler } from 'express';
import { parse } from 'url';

export const loggerMiddleware: RequestHandler = (
  request: any,
  response: any,
  next: any,
) => {
  const { headers, method, query, params } = request;
  const date = new Date().toJSON();
  const time = date.replace('T', ' ').slice(0, -5);
  const route = parse(request.url).path;
  next();
};
