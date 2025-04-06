/**
 * User Schema Reference for MongoDB
 * 
 * This is not a strict schema since MongoDB is schema-less,
 * but provides a reference for the expected document structure.
 */

const userSchema = {
    // Basic user information
    firstName: String,         // User's first name
    lastName: String,          // User's last name
    email: String,             // User's email (unique)
    password: String,          // Hashed password (only for local auth)

    // Authentication related
    authProvider: String,      // 'local' or 'google'
    googleId: String,          // Only for Google auth users
    profilePicture: String,    // URL to profile picture, usually from Google

    // Timestamps
    createdAt: Date,           // Account creation timestamp
    updatedAt: Date,           // Last update timestamp

    // Optional additional fields
    role: String,              // User role (e.g., 'user', 'admin')
    isActive: Boolean,         // Account status
    lastLogin: Date,           // Last login timestamp

    // Example of document stored in MongoDB:
    // {
    //   "_id": ObjectId("60d5ec9af682facf97b0014a"),
    //   "firstName": "John",
    //   "lastName": "Doe",
    //   "email": "john.doe@example.com",
    //   "password": "$2b$10$X5RFJWMjgd9VL9HmVe3X.eH8YFpUP8JTX5jBrLc9zL1JOr/yMBhXm",
    //   "authProvider": "local",
    //   "createdAt": ISODate("2023-01-01T00:00:00Z"),
    //   "updatedAt": ISODate("2023-01-01T00:00:00Z"),
    //   "isActive": true
    // }
    //
    // OR for Google auth:
    // {
    //   "_id": ObjectId("60d5ec9af682facf97b0014b"),
    //   "firstName": "Jane",
    //   "lastName": "Smith",
    //   "email": "jane.smith@gmail.com",
    //   "googleId": "109238102938109283019",
    //   "profilePicture": "https://lh3.googleusercontent.com/...",
    //   "authProvider": "google",
    //   "createdAt": ISODate("2023-01-02T00:00:00Z"),
    //   "updatedAt": ISODate("2023-01-02T00:00:00Z"),
    //   "isActive": true
    // }
};

export default userSchema;