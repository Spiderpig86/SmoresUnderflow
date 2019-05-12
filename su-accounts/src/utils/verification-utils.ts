export const KEY = 'abracadabra';

export const SERVICE = {
  host: 'cloud.cloud.compas.cs.stonybrook.edu',
  email: 'smores.overflow@gmail.com',
  password: 'stanleythemanly',
  title: 'Verify your account at SMORES'
};


export function generateMailBody(email: string, verificationToken: string): string {
    return `validation key: <${verificationToken}>
        `;
}

// export function generateMailBody(email: string, verificationToken: string): string {
//   return `
//         <p>Thanks for registering with SmoresUnderflow!</p>
//         <p><a href="http://smores.cse356.compas.cs.stonybrook.edu/verify?email=${email}&key=${verificationToken}" target="_blank">Verify your account to get started</a>.</p>
//         <p>validation key: &lt;${verificationToken}&gt;</p>
//       `;
// }

