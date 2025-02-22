import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);

    if(!session) {
        sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401}));
        return;
    }

    const userId = session?.user.userId;
    const checkId = event.context.params?.id;

    const prisma = usePrisma();
    const body = await readBody(event);

    return await prisma.marker.update({
        where: {
            id: checkId
        },
        data: {
            brand: body.brand,
            model: body.model,
            images: body.images,
            description: body.description,
            latitude: body.latitude,
            longitude: body.longitude,
            date: body.date,
        },
    });
});