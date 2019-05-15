<p align="center"><img src="https://github.com/Spiderpig86/SmoresUnderflow/blob/master/su-frontend/public/assets/logo.png" width="125"></p>
<h1 align=center>SmoresUnderflow</h1>
<br>
<h5 align=center>A scalable StackOverflow clone powered by Koa</a>.</h5>

## Features
* This is the gist of what it can do:
  * User account registration with email verification.
  * Posting questions and answers with media.
  * Upvoting/downvoting questions and answers.
  * Search and filtering for questions based on timestamp, query, count, and more.

## Built With
* :zap: [React](https://reactjs.org/) - a JavaScript library for building UIs.
* :gem: [Koa](https://koajs.com/) - a next generation web framework for Node.js.
* :monkey_face: [MongoDb](https://www.mongodb.com/) - the most popular database for modern apps.
* :ant: [jwt](https://jwt.io/) - compact and secure data transmission for stateful services.
* :mag: [Elastic Search](https://www.elastic.co/) - scalable open source search.
* :guardsman: [Kibana](https://www.elastic.co/products/kibana) - data visualization for Elastic stack.
* :moneybag: [Redis](https://redis.io/) - in-memory data structure store/cache.
* :rocket: [Nginx](https://www.nginx.com/) - high performance load balancer.
* :rabbit: [RabbitMQ](https://www.rabbitmq.com/) - open source message broker.
* :sparkles: [PM2](http://pm2.keymetrics.io/) - Node.js process manager.

## Deployment
* In general, each instance you deploy would consist of all the microservices that are included in the project, which are the folders prefixed with `su-` and `qu-`.
* The option is to deploy them separately and cluster each microservice by type on each machine. This may reduce CPU load on instances that share both the backend microservices and the queueing.
* What I recommend is doing a mix of machines that take on a couple of microservices and partially specializing the instances.
* Assuming that you are familiar with **Ansible**, there are playbooks written to help speed up setting up instances. **PM2** is used to deploy and maintain the instances.

### App Instances
* The app will be able to sustain quite a bit of load if all microservices are located on each machine.
  * Some specialization, such as moving the **search** and **questions** microservices to separate machines may lower the overhead, since these services are often hit the most.

### Database (Mongodb)
* It is recommended to have a **query router** for each app instance you have.
* However, **shards** and **config** servers should run by itself in its own instance to avoid performance hits.
* Deploying 3 **shards**, 3 **config servers** and **one query router for each app instance** should be sufficient.

### Caching
* **Redis** will work best when running by itself on its own instance.
* Clustering is possible, but performance is slower than a single process based on testing.

### Searching
* The ELK stack can run on a single machine. Ensure that there is at least **4GB** of RAM so the write queue limit can be raised in **Elastic Search** to handle more requests.

## How it looks/works
![Smores Demo](https://github.com/Spiderpig86/SmoresUnderflow/blob/master/images/smores.gif)
![Question Page](https://github.com/Spiderpig86/SmoresUnderflow/blob/master/images/smores1.PNG)
![Answer Component](https://github.com/Spiderpig86/SmoresUnderflow/blob/master/images/smores2.PNG)
![Home Page](https://github.com/Spiderpig86/SmoresUnderflow/blob/master/images/smores3.PNG)
![Ask Page](https://github.com/Spiderpig86/SmoresUnderflow/blob/master/images/smores4.PNG)
![Search Page](https://github.com/Spiderpig86/SmoresUnderflow/blob/master/images/smores5.PNG)
![Search Filter](https://github.com/Spiderpig86/SmoresUnderflow/blob/master/images/smores6.PNG)

## Contributors
* Built by [@derivatives](https://gitlab.com/derivatives_)(Ngan Nguyen) and yours truly.