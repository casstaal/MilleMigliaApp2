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
    const postId = body.postId;

    return await prisma.post.update({
        where: {
            id: postId
        },
        data: {
            title: body.title,
            link: body.link,
            description: body.description
        },
    });
});