import User from "../models/User.js";

export async function getUserById(userId) {
  return User.findByPk(userId, {
    attributes: ["id", "name", "email", "mobile", "age", "role"]
  });
}

export async function updateUserProfile(userId, data) {
  const user = await User.findByPk(userId);

  if (!user) return null;

  const { name, mobile, age } = data;

  user.name = name;
  user.mobile = mobile;
  user.age = age;

  await user.save();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    age: user.age,
    role: user.role
  };
}
