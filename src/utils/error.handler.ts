import { ConflictException, HttpException, InternalServerErrorException } from '@nestjs/common';

export function handleErrors(error: any, context: string): never {
  if (error instanceof HttpException) {
    throw error;
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors?.[0]?.path;
    throw new ConflictException({
      status: 'error',
      message: `The ${field} provided already exists.`,
      pagination: null,
      response: null,
      errors: error.errors,
    });
  }

  throw new InternalServerErrorException({
    status: 'error',
    message: 'An unexpected error occurred. Please try again later.',
    pagination: null,
    response: null,
    errors: error,
  });
}
