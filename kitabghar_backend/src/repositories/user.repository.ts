import User, { IUser } from "../models/user.model";

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email });
}

export async function createUser(name: string, email: string, hashedPassword: string): Promise<IUser> {
  const user = new User({ name, email, password: hashedPassword });
  return user.save();
}

export async function findUserById(id: string): Promise<IUser | null> {
  return User.findById(id).select("-password");
}

export async function createUserAdmin(data:{
  name: string;
  email: string;
  password: string;
  role?: string;
}): Promise<IUser> {
  const user = new User (data);
  return user.save();
}

export async function updateUserById(
  id: string,
  data: Partial<IUser>
): Promise<IUser | null> {
  return User.findByIdAndUpdate(id,data, {
    new: true,
    runValidators: true,
  }).select("-password");
}

export async function deleteUserById(id: string): Promise<IUser | null>{
  return User.findByIdAndDelete(id);
}

export async function getAllUsersPaginated(
  page: number,
  limit: number,
  search?: string
): Promise<{data: IUser[]; total: number}> {
  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      {name: {$regex: search, $options: "i"} },
      {email: {$regex: search, $options: "i"} },
    ];
  }
  const total = await User.countDocuments(query);
  const data = await User.find(query)
  .select("-password")
  .skip((page - 1) * limit)
  .limit(limit)
  .sort({createAt: -1 });

  return {data, total};
}