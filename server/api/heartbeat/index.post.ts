import { getServerSession } from "#auth";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);

    if(!session) {
        sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401}));
        return;
    }

    const userId = session?.user.userId;

    const prisma = usePrisma();

    return await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            lastSeen: new Date()
        },
    });
});