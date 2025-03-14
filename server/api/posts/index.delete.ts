import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);
    if(!session) {
        sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401 }));
        return;
    }

    const prisma = usePrisma();
    const body = await readBody(event);
    const postId = body.postId;

    if (!postId) {
        return createError({ statusCode: 400, message: "Invalid post id" });
    }

    return await prisma.post.delete({
        where: {
            id: postId
        }
    });
});