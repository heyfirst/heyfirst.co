-- CreateTable
CREATE TABLE "BlogPageViews" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL,

    CONSTRAINT "BlogPageViews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPageViews_slug_key" ON "BlogPageViews"("slug");
