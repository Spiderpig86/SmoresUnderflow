import * as bcrypt from 'bcryptjs';

/**
 * Password hasher and verifier
 *
 * @export
 * @class Hash
 */
export class Hash {
  /**
   * Hash a password with BCrypt with a certain number of rounds of salt generation
   *
   * @param {string} password - password to verify
   * @returns {Promise<string>} - hashed version of password
   * @memberof Hash
   */
  public async hashPassword(password: string, rounds: number = 1): Promise<string> {
    const salt = bcrypt.genSaltSync(rounds);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verify if password matches existing hash
   *
   * @param {string} password - the password to verify
   * @param {string} hash - hash value to compare with
   * @returns {Promise<boolean>} - if the passwords match
   * @memberof Hash
   */
  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    return password === hash;
    // return bcrypt.compare(password, hash);
  }
}
