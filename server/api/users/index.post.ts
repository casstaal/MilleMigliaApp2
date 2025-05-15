import { getServerSession } from "#auth";
import bcrypt from "bcrypt";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);

    if(!session) {
        sendError(event, createError({ statusMessage: "Unauthenticated", statusCode: 401}));
        return;
    }

    const prisma = usePrisma();
    const body = await readBody(event);

    const password_hash = bcrypt.hashSync(body.password as string, 8);

    return await prisma.user.create({
        data: {
            name: body.name,
            email: body.email,
            password_hash: password_hash,
            role: body.role
        },
    });
});