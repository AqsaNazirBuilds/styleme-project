-- CreateTable
CREATE TABLE "StylePreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "favoriteStyles" TEXT[],
    "preferredColors" TEXT[],
    "favoriteCategories" TEXT[],
    "preferredOccasions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StylePreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StylePreference_userId_key" ON "StylePreference"("userId");

-- AddForeignKey
ALTER TABLE "StylePreference" ADD CONSTRAINT "StylePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
