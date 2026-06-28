ALTER TABLE "User" ADD COLUMN "ageConfirmedAt" TIMESTAMP(3);

ALTER TABLE "DrinkLog" ADD COLUMN "drinkPhotoUrl" TEXT;
ALTER TABLE "DrinkLog" ADD COLUMN "placePhotoUrl" TEXT;
