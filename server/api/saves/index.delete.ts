import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);
    if(!session) {
        sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401 }));
        return;
    }

    const prisma = usePrisma();
    const body = await readBody(event);
    const saveId = body.saveId

    if (!body || !body.saveId) {
        sendError(event, createError({ statusMessage: "Invalid request", statusCode: 400 }));
        return;
    }

    return await prisma.saved.delete({
        where: {
            id: saveId
        }
    });
});