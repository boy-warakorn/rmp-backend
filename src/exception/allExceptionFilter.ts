import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = '';
    switch (status) {
      case 400:
        message = 'Sorry, Not responding because of incorrect syntax';
        break;
      case 401:
        message =
          'Sorry, We are not able to process your request. Please try again';
        break;
      case 403:
        message =
          "Sorry, The requested doesn't have permissions to perform the request. Please try again";
        break;
      case 404:
        message =
          "Sorry, The requested resource doesn't exist. Please try again";
        break;
      case 409:
        message =
          'Sorry, The request conflicts with another request. Please try again';
        break;
      default:
        message = 'Internal Server Error';
        break;
    }

    this.logger.error(`${request.originalUrl} ${exception.stack}`);

    response.status(status).json({
      status: {
        code: status,
        message,
      },
    });
  }
}
