import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Can't use top level await, but we only need to warm up from side-effect here
prisma.$connect();

export default prisma;
