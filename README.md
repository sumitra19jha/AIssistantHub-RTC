# Real-time GPT Communication Application

This project enables real-time communication between users and the OpenAI GPT model for content generation and refinement. It uses a Flask API for content generation and a Node.js server with Socket.IO for real-time communication and room management.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/sumitra19jha/Generative-AI-Content-Creation-RTC.git
```
2. Install dependencies for the Node.js server:
```bash
npm install
```
3. Configure your database settings in the .env file.
4. Set up your OpenAI API key and other required settings in the .env file.

## Usage
1. Start the Flask API server
2. Start the Node.js server:
```bash
npm start
```
3. Access the frontend application in your browser at http://localhost:3001 (or the appropriate port).

## Project Structure
.
├── nodejs-server
    ├── src
    │   ├── config
    |   |   |__ config.js
    |   |__ middleware
    |   |   |__ errorHandlers.js
    │   |
    │   ├── controllers
    │   │   └── roomController.js
    |   |   |__ roomController.js
    │   └── routes
    │   |    └── index.js
    |   |    |__ chatRoutes.js
    |   |__ db.js
    |   |__ app.js
    ├── package.json
    └── server.js


