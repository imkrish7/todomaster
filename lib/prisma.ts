import { PrismaClient } from "@prisma/client";

const prismaSinglton = () => {
    return new PrismaClient();
}

type prismaSinglton = ReturnType<typeof prismaSinglton>

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

const prisma = globalForPrisma.prisma ?? prismaSinglton();

if (process.env.NODE_ENV === 'development') globalForPrisma.prisma = prisma; 

export default prisma;




