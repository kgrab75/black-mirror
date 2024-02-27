# Layer 1: Telling Docker to use the node:20.11.1-alpine3.19 image as the base image for the container.
FROM node:20.11.1-alpine3.19

# Layer 2:  We use nodemon to restart the server every time there's a change
RUN npm install -g nodemon

# Layer 3: Telling Docker to create a directory called `app` in the container and set it as the working directory.
WORKDIR /app

# Layer 4: Copying the package.json file from the root of the project to the `app` directory in the container.
COPY package.json .

# Layer 5: Installing the dependencies listed in the package.json file.
RUN npm install

# Layer 6: Copying all the files from the root of the project to the `app` directory in the container.
COPY . .

# Layer 7: Telling Docker that the container will listen on port 5000.
EXPOSE 5000

# Layer 8: Telling Docker to run the `npm run dev` command when the container is started.
CMD ["npm", "run", "dev"]