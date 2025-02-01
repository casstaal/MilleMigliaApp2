import bcrypt from "bcrypt";
export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return bcrypt.hashSync(query.password as string, 8);
});
