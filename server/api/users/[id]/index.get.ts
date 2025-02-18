import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    // const session = await getServerSession(event);
    // if(!session) {
    //     sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401 }));
    //     return;
    // }

    const prisma = usePrisma();
    const userId = event.context.params?.id;

    if (!userId) {
        return createError({ statusCode: 400, message: "Invalid user id" });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        }
    });

    if (!user) {
        return createError({ statusCode: 404, message: "User not found" });
    }

    return user;
})