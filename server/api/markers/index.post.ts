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

    return await prisma.marker.create({
        data: {
            brand: body.brand,
            model: body.model,
            description: body.description,
            images: body.images,
            latitude: body.latitude,
            longitude: body.longitude,
            date: body.date,
            userId: userId,
        },
    });
});