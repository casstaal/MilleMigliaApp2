import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);
    if(!session) {
        sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401 }));
        return;
    }

    const prisma = usePrisma();
    const body = await readBody(event);
    const likeId = body.likeId

    if (!body || !body.likeId) {
        sendError(event, createError({ statusMessage: "Invalid request", statusCode: 400 }));
        return;
    }

    return await prisma.like.delete({
        where: {
            id: likeId
        }
    });
});