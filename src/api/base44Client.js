import {
  Badge,
  CommunityMessage,
  CycleLog,
  DailyCheckin,
  JournalEntry,
  PositiveEntry,
  User,
  UserBadge
} from "./entities.js";

export const base44 = {
  auth: {
    async me() {
      return User.me();
    },
    async updateMe(patch) {
      return User.update(patch);
    }
  },
  entities: {
    Badge,
    CommunityMessage,
    CycleLog,
    DailyCheckin,
    JournalEntry,
    PositiveEntry,
    UserBadge,
    User
  }
};

export default base44;

