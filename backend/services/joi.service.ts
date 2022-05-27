import Joi from 'joi';
import {RequestUser} from "../api/authentication/auth.interface";
import {RawQueryParams} from "../api/gallery/gallery.interface";

export class JoiService {
  public async validateUserObject (user: RequestUser): Promise<RequestUser> {
    const userSchema = Joi.object({
      email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required(),

      password: Joi.string()
        .min(3)
        .alphanum()
        .required(),
    })

    return userSchema.validateAsync(user);
  }

  public async validateQueryObject (query: RawQueryParams): Promise<RawQueryParams> {
    const querySchema = Joi.object({
      page: Joi.string()
        .pattern(new RegExp('[0-9]+'))
        .required(),

      limit: Joi.string()
        .pattern(new RegExp('[0-9]+'))
        .required(),

      filter: Joi.string()
        .required(),

      keyWord: Joi.string()
        .min(1)
        .max(30)
        .alphanum(),
    })

    return querySchema.validateAsync(query);
  }
}