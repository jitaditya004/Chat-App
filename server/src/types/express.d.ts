// import { JwtPayload } from "jsonwebtoken";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: JwtPayload & {
//         userId: string;
//       };
//     }
//   }
// }



import "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
      };
    }
  }
}

export {};
