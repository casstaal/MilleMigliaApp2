import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);

    if(!session) {
        sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401}));
        return;
    }

    const userId = session?.user.userId;

    const prisma = usePrisma();
    const body = await readBody(event);

    if (!body || !body.postId) {
        sendError(event, createError({ statusMessage: "Invalid request", statusCode: 400 }));
        return;
    }

    return await prisma.like.create({
        data: {
            postId: body.postId,
            userId: userId,
        },
    });
});