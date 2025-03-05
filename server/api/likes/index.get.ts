import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);
    console.log("Session:", session); 
    
    if (!session) {
        sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401 }));
        return;
    }
    
    const prisma = usePrisma();
    const userId = session.user.userId;

    if (!userId) {
        return createError({ statusCode: 400, message: "Invalid user id" });
    }


    const likes = await prisma.like.findMany({
        where: { userId },
    });

    if (!likes) {
        return createError({ statusCode: 404, message: "Check not found" });
    }

    return likes;
})