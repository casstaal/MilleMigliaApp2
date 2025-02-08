import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
//   const session = await getServerSession(event);
//   if (!session) {
//     sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401 }));
//     return;
//   }

  const prisma = usePrisma();

  return await prisma.check.findMany();
});
