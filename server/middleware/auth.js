import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    // Allow public access to GET /posts endpoint
    if (req.method === 'GET' && req.path === '/posts') {
      console.log("Public access granted for GET /posts"); // Debug log
      return next();
    }

    console.log("Checking auth for:", req.method, req.path); // Debug log
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err); // Debug log
    res.status(500).json({ error: err.message });
  }
};
