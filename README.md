# MERN Social Media App

This is a social media app built using the MERN stack. It includes authentication, posts, likes, comments, and follows.

## Screenshots

### Home Page
![image](https://github.com/user-attachments/assets/a63e2218-859f-4ac6-98cb-7c39541cc654)


### SignUp Page
![image](https://github.com/user-attachments/assets/d58e30bc-a4e5-4239-8a71-67d756e4c358)



## Features

- Authentication
- Posts
- Likes
- Comments
- Follows

## Technologies

- MongoDB
- Express
- React
- Node.js

## Installation

1. Clone the repository
```bash
git clone https://github.com/imabhinavdev/mern-social-media.git
```

2. Install dependencies
```bash
cd mern-social-media
```

3. Install server dependencies
```bash
cd server
npm install
```

4. Install client dependencies
```bash
cd client
npm install
```

5. Run the app
```bash
cd server
npm run start
```

6. Create environment files

In client directory, create `.env`:
```bash
REACT_APP_API_URL=http://localhost:3001
```

In server directory, create `.env`:
```bash
RENDER_URL=http://localhost:3001
MONGO_URL=mongodb://127.0.0.1:27017/mern-social-media?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.7
JWT_SECRET=55ccb00c1f1b18edcb6e353845756d62f7ad3c2f0ec5f82fcb1659a44b02514f
PORT=3001
```

