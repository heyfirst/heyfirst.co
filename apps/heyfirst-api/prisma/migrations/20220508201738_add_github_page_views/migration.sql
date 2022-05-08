-- CreateTable
CREATE TABLE "GitHubPageViews" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,

    CONSTRAINT "GitHubPageViews_pkey" PRIMARY KEY ("id")
);
