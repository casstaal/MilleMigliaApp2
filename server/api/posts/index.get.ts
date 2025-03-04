import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  console.log("Session in /api/posts:", session); // Debug log

  
  if (!session) {
    sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401 }));
    return;
  }

  const prisma = usePrisma();

  return await prisma.post.findMany();
});