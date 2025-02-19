import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    // const session = await getServerSession(event);
    // if(!session) {
    //     sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401 }));
    //     return;
    // }

    const prisma = usePrisma();
    const checkId = event.context.params?.id;

    // if (!checkId) {
    //     return createError({ statusCode: 400, message: "Invalid check id" });
    // }

    return await prisma.marker.delete({
        where: {
            id: checkId
        }
    });
});