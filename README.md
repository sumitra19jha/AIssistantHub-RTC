# AIssistantHub
Welcome to AIssistantHub! This innovative project facilitates real-time communication between users and the OpenAI GPT model for content generation and refinement. Whether you need a blog post, article, or any written content, simply provide a topic, set the sentiment, and specify the length—AIssistantHub will handle the rest!

**Key Features**
- **Topic Submission**: Input your desired topic.
- **Sentiment Control**: Define the tone of your content.
- **Length Adjustment**: Specify the length of your post or article.

**Major Components**
- Frontend - [AIssistantHub](https://github.com/sumitra19jha/AIssistantHub)
- Backend - [AIssistantHub-Backend](https://github.com/sumitra19jha/AIssistantHub-Backend)
- RTC - [AIssistantHub-RTC](https://github.com/sumitra19jha/AIssistantHub-RTC)

# AIssistant Hub RTC

The RTC component of AIssistantHub enables seamless real-time communication with users, ensuring an interactive and responsive experience.

### Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)

## Installation

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/sumitra19jha/Generative-AI-Content-Creation-RTC.git
    ```

2. **Install Node.js Server Dependencies**:
    ```bash
    npm install
    ```

3. **Configure Environment Settings**:
    - Update your database settings in the `.env` file.
    - Set up your OpenAI API key and other required configurations in the `.env` file.

## Usage
1. **First Start the Flask API Server ([AIssistantHub-Backend](https://github.com/sumitra19jha/AIssistantHub-Backend))**
2. **Start the Node.js Server**:
    ```bash
    npm start
    ```

3. **Access the Application ([AIssistantHub Frontend](https://github.com/sumitra19jha/AIssistantHub))**:
    - Open your browser and navigate to `http://localhost:3001` (or the appropriate port).

## Project Structure
```plaintext
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
```

### Infrastructure
```
+---------+        +-------------------+      +------------+      +-------+
|         |        |                   |      |            |      |       |
|  User   +-------->  Frontend (React) +----->+  Flask API  +----->+ OpenAI|
|         |        |                   |      |            |      |       |
+---------+        +----+---------+----+      +------+-----+      +---+---+
                        |         ^            |      |              ^
                        |         |            |      |              |
                        |         |            |      v              |
                        |         |        +---+------+              |
                        |         |        |             |              |
                        v         +-------->   MySQL DB   |              |
              +---------+------+  |        |             |              |
              |                +--+        +-------------+--------------+
              | Node.js Server |
              | (Socket.IO)    |
              +----------------+

```
