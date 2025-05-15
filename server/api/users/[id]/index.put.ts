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
    const body = await readBody(event);

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        return createError({ statusCode: 404, message: "User not found" });
    }

    const isValidPassword  = await bcrypt.compare(body.currentPassword, user.password_hash);
    if (!isValidPassword ) {
        createError({ statusCode: 400, statusMessage: "Password is invalid" });
        return null;
    }

    const password_hash = bcrypt.hashSync(body.newPassword as string, 8);

    return await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            password_hash: password_hash
        },
    });
});