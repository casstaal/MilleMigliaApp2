import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);

    if(!session) {
        sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401}));
        return;
    }

    const prisma = usePrisma();
    const body = await readBody(event);

    return await prisma.check.create({
        data: {
            title: body.title,
            imgUrl: body.imgUrl,
            location: body.location,
            date: body.date
        },
    });
});