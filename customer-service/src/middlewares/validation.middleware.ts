import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

type Constructor<T> = new (...args: unknown[]) => T;

export const validateBody = <T extends object>(DtoClass: Constructor<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(DtoClass, req.body);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors.flatMap((error) =>
        Object.values(error.constraints ?? {})
      );
      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
      });
    }

    req.body = instance;
    next();
  };
};
