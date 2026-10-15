import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: [true, "Email already exists!"],
      index: true, 
    },
    isOnline: {
      type: String,
      default: '0',
    },
    username: {
      type: String,
      required: [true, "Username is required!"],
    },
    title: { type: String },
    avatar: { type: String },
    bio: { type: String },
    firm: { type: String },
    location: { type: String },
    phone: { type: String },
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        year: { type: String },
      },
    ],
    barAdmissions: [{ type: String }],
    areasOfPractice: [{ type: String }],
    awards: [{ type: String }],
    recentCases: [
      {
        title: { type: String },
        year: { type: String },
        outcome: { type: String },
      },
    ],
    publications: [
      {
        title: { type: String },
        journal: { type: String },
        year: { type: String },
      },
    ],
    password: {
      type: String,
      // NOTE: not required for OAuth users (Google sign-in)
      select: false, // Never return password hash in queries unless explicitly asked for
    },
    bookmarks: {
      type: [String],
      default: [],
    },
    charge: { type: Number, default: 0 },
    yearsexp: { type: Number, default: 0 },
    subscribe: { type: Boolean, default: false },
    subscriptionExpiry: { type: Date, default: null },
    resetPasswordToken: { type: String },
    notificationsEnabled: { type: Boolean, default: true },
    resetPasswordExpires: { type: Date },
    admin: { type: Boolean, default: false }, 
    islaywer: { type: Boolean, default: false },

    // ✅ New field for storing subscription traction data as array of objects
    subscriptions: [
      {
        orderId: { type: String },
        email: { type: String },
        subscribe: { type: Boolean },
        subscriptionExpiry: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
