import { ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues
    });
  }

  return res.status(500).json({
    message: "Internal Server Error"
  });
}



//example response
// {
//   "message": "Validation failed",
//   "errors": [
//     {
//       "path": ["email"],
//       "message": "Invalid email",
//       "code": "invalid_string"
//     }
//   ]
// }
