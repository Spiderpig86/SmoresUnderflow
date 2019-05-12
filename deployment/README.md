# How to Deploy
* Simply setup the instances with Ansible and then deploy with pm2.

## Ansible Setup
* This installs the needed packages and sets up SSH keys.
    ```sh
    ansible-playbook deployment/ansible.yml -i deployment/hosts
    ```

## PM2 Deploy
* Deploy application to all instances.
    ```sh
    pm2 deploy deployment/ecosystem.config.js production setup
    ```
* To update the existing instances.
    ```sh
    pm2 deploy deployment/ecosystem.config.js production update
    ```