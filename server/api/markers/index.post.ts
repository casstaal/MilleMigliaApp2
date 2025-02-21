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
            imgUrl: body.imgUrl,
            imgUrl2: body.imgUrl2,
            imgUrl3: body.imgUrl3,
            imgUrl4: body.imgUrl4,
            imgUrl5: body.imgUrl5,
            latitude: body.latitude,
            longitude: body.longitude,
            date: body.date,
            userId: userId,
        },
    });
});