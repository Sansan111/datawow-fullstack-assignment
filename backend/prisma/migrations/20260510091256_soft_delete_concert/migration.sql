-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_concertId_fkey";

-- AlterTable
ALTER TABLE "Concert" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_concertId_fkey" FOREIGN KEY ("concertId") REFERENCES "Concert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
