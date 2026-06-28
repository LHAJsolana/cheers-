import { ActivityType, type DrinkLog, type Session, type User } from "@prisma/client";

export function drinkActivityRecords({
  user,
  drinkLog,
  session,
  message,
  isFirstSessionDrink,
  checkIn,
}: {
  user: Pick<User, "id" | "name">;
  drinkLog: Pick<DrinkLog, "id" | "location">;
  session: Pick<Session, "id" | "title">;
  message: string;
  isFirstSessionDrink: boolean;
  checkIn: boolean;
}) {
  return [
    {
      userId: user.id,
      drinkLogId: drinkLog.id,
      sessionId: session.id,
      type: ActivityType.DRINK_LOGGED,
      message,
    },
    ...(isFirstSessionDrink
      ? [
          {
            userId: user.id,
            drinkLogId: drinkLog.id,
            sessionId: session.id,
            type: ActivityType.SESSION_STARTED,
            message: `${user.name} started ${session.title}.`,
          },
        ]
      : []),
    ...(checkIn && drinkLog.location
      ? [
          {
            userId: user.id,
            drinkLogId: drinkLog.id,
            sessionId: session.id,
            type: ActivityType.CHECK_IN,
            message: `${user.name} checked in at ${drinkLog.location}.`,
          },
        ]
      : []),
  ];
}
