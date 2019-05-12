import * as jwt from 'jsonwebtoken';
import { PUBLIC_KEY } from './const';

/**
 * Mainly used for decoding user credentials from a given token
 *
 * @export
 * @class Auth
 */
export class Auth {
    /**
     * Validate a given user with a user defined token.
     * Will throw an exception if there is no match.
     * User object from db is returned if there is no discrepency
     *
     * @param {string} token - token passed in by the client
     * @returns {Promise<IUser>} - promise containing the IUser that can be used to retrieve other data
     * @memberof JWTAuth
     */
    public async validate(token: string): Promise<any> {
        try {
            const decode: any = jwt.verify(token, PUBLIC_KEY, {
                algorithms: ['RS256']
            }); // Verify that the given token is a valid token

            return {
                username: decode.username,
                email: decode.email
            };
        } catch (err) {
            throw new Error(
                'Given token could not be verified for authorization.'
            );
        }
    }
}
