import { User } from "../entity/User";

declare global {
  namespace Express {
    interface Request {
      me?: User;
    }
  }
}

export {};
