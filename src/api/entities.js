const STORAGE_PREFIX = "resonifi";
const isBrowser =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const memoryStore = isBrowser
  ? null
  : (globalThis.__RESONIFI_MEMORY_STORE__ =
      globalThis.__RESONIFI_MEMORY_STORE__ || new Map());

const storage = {
  get(key) {
    if (isBrowser) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return memoryStore.get(key) ?? null;
  },
  set(key, value) {
    if (isBrowser) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* ignore quota errors */
      }
      return;
    }
    memoryStore.set(key, value);
  },
  delete(key) {
    if (isBrowser) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      return;
    }
    memoryStore.delete(key);
  }
};

const makeKey = (suffix) => `${STORAGE_PREFIX}:${suffix}`;

const clone = (value) => {
  if (value == null) return value;
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const read = (key, fallback) => {
  const raw = storage.get(key);
  if (!raw) return clone(fallback);
  try {
    return JSON.parse(raw);
  } catch {
    return clone(fallback);
  }
};

const write = (key, value) => {
  storage.set(key, JSON.stringify(value));
};

const generateId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const toComparable = (value) => {
  if (value == null) return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string") {
    const numeric = Date.parse(value);
    if (!Number.isNaN(numeric)) return numeric;
    return value.toLowerCase();
  }
  return value;
};

const compare = (a, b) => {
  const va = toComparable(a);
  const vb = toComparable(b);

  if (va == null && vb == null) return 0;
  if (va == null) return -1;
  if (vb == null) return 1;

  if (typeof va === "number" && typeof vb === "number") return va - vb;
  if (typeof va === "string" && typeof vb === "string") return va.localeCompare(vb);
  if (va > vb) return 1;
  if (va < vb) return -1;
  return 0;
};

const matchesQuery = (record, query = {}) =>
  Object.entries(query).every(([key, expected]) => {
    if (expected === undefined) return true;
    const actual = record[key];

    if (expected != null && typeof expected === "object" && !Array.isArray(expected)) {
      return Object.entries(expected).every(([op, value]) => {
        if (op === "$gte") return compare(actual, value) >= 0;
        if (op === "$gt") return compare(actual, value) > 0;
        if (op === "$lte") return compare(actual, value) <= 0;
        if (op === "$lt") return compare(actual, value) < 0;
        if (op === "$in" && Array.isArray(value)) {
          return value.some((candidate) => compare(actual, candidate) === 0);
        }
        return compare(actual, expected) === 0;
      });
    }

    if (Array.isArray(expected)) {
      return expected.some((candidate) => compare(actual, candidate) === 0);
    }

    return compare(actual, expected) === 0;
  });

const sortRecords = (records, order) => {
  const directives = Array.isArray(order)
    ? order
    : typeof order === "string" && order.length
    ? [order]
    : [];

  if (!directives.length) return [...records];

  return [...records].sort((a, b) => {
    for (const directive of directives) {
      const desc = directive.startsWith("-");
      const key = directive.replace(/^[-+]/, "");
      const result = compare(a[key], b[key]);
      if (result !== 0) {
        return desc ? -result : result;
      }
    }
    return 0;
  });
};

class EntityStore {
  constructor(key, { defaults } = {}) {
    this.key = key;
    this.defaultFactory =
      typeof defaults === "function"
        ? defaults
        : () => (defaults ? clone(defaults) : {});
  }

  _readAll() {
    return read(this.key, []) ?? [];
  }

  _writeAll(data) {
    write(this.key, data);
  }

  async list(order, limit) {
    const sorted = sortRecords(this._readAll(), order);
    const sliced =
      typeof limit === "number" ? sorted.slice(0, Math.max(limit, 0)) : sorted;
    return clone(sliced);
  }

  async filter(query = {}, order, limit) {
    const filtered = this._readAll().filter((record) =>
      matchesQuery(record, query)
    );
    const sorted = sortRecords(filtered, order);
    const sliced =
      typeof limit === "number" ? sorted.slice(0, Math.max(limit, 0)) : sorted;
    return clone(sliced);
  }

  async create(payload = {}) {
    const base = this.defaultFactory(payload);
    const now = new Date().toISOString();
    const record = {
      id: payload.id ?? generateId(this.key),
      created_date: payload.created_date ?? now,
      updated_date: payload.updated_date ?? now,
      ...base,
      ...payload
    };

    const data = this._readAll();
    data.push(record);
    this._writeAll(data);
    return clone(record);
  }

  async bulkCreate(records = []) {
    const results = [];
    for (const entry of records) {
      results.push(await this.create(entry));
    }
    return results;
  }

  async update(id, patch = {}) {
    const data = this._readAll();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Entity "${this.key}" record "${id}" not found`);
    }
    const now = new Date().toISOString();
    const updated = {
      ...data[index],
      ...patch,
      id: data[index].id,
      updated_date: patch.updated_date ?? now
    };
    data[index] = updated;
    this._writeAll(data);
    return clone(updated);
  }

  async delete(id) {
    const data = this._readAll();
    const next = data.filter((item) => item.id !== id);
    this._writeAll(next);
  }
}

const dailyCheckinStore = new EntityStore(makeKey("daily-checkins"), {
  defaults: () => ({ date: new Date().toISOString().split("T")[0] })
});
const journalEntryStore = new EntityStore(makeKey("journal-entries"), {
  defaults: () => ({ date: new Date().toISOString().split("T")[0] })
});
const badgeStore = new EntityStore(makeKey("badges"));
const userBadgeStore = new EntityStore(makeKey("user-badges"));
const positiveEntryStore = new EntityStore(makeKey("positive-entries"));
const communityMessageStore = new EntityStore(makeKey("community-messages"), {
  defaults: () => ({ type: "text" })
});
const cycleLogStore = new EntityStore(makeKey("cycle-logs"), {
  defaults: () => ({ date: new Date().toISOString().split("T")[0] })
});

const userKey = makeKey("user-profile");

const ensureUser = () => {
  const existing = read(userKey, null);
  if (existing) return existing;

  const now = new Date().toISOString();
  const fallback = {
    id: "demo-user",
    email: "friend@resonifi.app",
    full_name: "Resonifi Friend",
    role: "member",
    show_spiritual_resonance: true,
    enableCycleResonance: true,
    optedIn: true,
    gender_identity: "female",
    life_stage_preferences: ["menstrual_cycle"],
    created_at: now,
    updated_at: now
  };
  write(userKey, fallback);
  return fallback;
};

export const User = {
  async me() {
    return clone(ensureUser());
  },
  async update(patch = {}) {
    const current = ensureUser();
    const next = {
      ...current,
      ...patch,
      updated_at: new Date().toISOString()
    };
    write(userKey, next);
    return clone(next);
  }
};

export const DailyCheckin = {
  list: (...args) => dailyCheckinStore.list(...args),
  filter: (...args) => dailyCheckinStore.filter(...args),
  async create(payload = {}) {
    const user = await User.me();
    const normalized = payload.created_by
      ? payload
      : { ...payload, created_by: user.email };
    return dailyCheckinStore.create(normalized);
  },
  async bulkCreate(entries = []) {
    const user = await User.me();
    const normalized = entries.map((entry) =>
      entry.created_by ? entry : { ...entry, created_by: user.email }
    );
    return dailyCheckinStore.bulkCreate(normalized);
  },
  update: (id, patch) => dailyCheckinStore.update(id, patch),
  delete: (id) => dailyCheckinStore.delete(id)
};

export const JournalEntry = {
  list: (...args) => journalEntryStore.list(...args),
  filter: (...args) => journalEntryStore.filter(...args),
  async create(payload = {}) {
    const user = await User.me();
    const normalized = payload.created_by
      ? payload
      : { ...payload, created_by: user.email };
    return journalEntryStore.create(normalized);
  },
  update: (id, patch) => journalEntryStore.update(id, patch),
  delete: (id) => journalEntryStore.delete(id)
};

export const Badge = {
  list: (...args) => badgeStore.list(...args),
  filter: (...args) => badgeStore.filter(...args),
  create: (payload) => badgeStore.create(payload),
  bulkCreate: (records) => badgeStore.bulkCreate(records),
  update: (id, patch) => badgeStore.update(id, patch),
  delete: (id) => badgeStore.delete(id)
};

export const UserBadge = {
  list: (...args) => userBadgeStore.list(...args),
  filter: (...args) => userBadgeStore.filter(...args),
  async create(payload = {}) {
    const user = await User.me();
    const normalized = payload.created_by
      ? payload
      : { ...payload, created_by: user.email };
    return userBadgeStore.create(normalized);
  },
  update: (id, patch) => userBadgeStore.update(id, patch),
  delete: (id) => userBadgeStore.delete(id)
};

export const PositiveEntry = {
  list: (...args) => positiveEntryStore.list(...args),
  filter: (...args) => positiveEntryStore.filter(...args),
  async create(payload = {}) {
    const user = await User.me();
    const normalized = payload.created_by
      ? payload
      : { ...payload, created_by: user.email };
    return positiveEntryStore.create(normalized);
  },
  update: (id, patch) => positiveEntryStore.update(id, patch),
  delete: (id) => positiveEntryStore.delete(id)
};

export const CommunityMessage = {
  list: (...args) => communityMessageStore.list(...args),
  filter: (...args) => communityMessageStore.filter(...args),
  async create(payload = {}) {
    const user = await User.me();
    const normalized = {
      displayName:
        payload.displayName ?? user.full_name ?? user.email.split("@")[0] ?? "Guest",
      created_by: payload.created_by ?? user.email,
      ...payload
    };
    return communityMessageStore.create(normalized);
  },
  update: (id, patch) => communityMessageStore.update(id, patch),
  delete: (id) => communityMessageStore.delete(id)
};

export const CycleLog = {
  list: (...args) => cycleLogStore.list(...args),
  filter: (...args) => cycleLogStore.filter(...args),
  async create(payload = {}) {
    const user = await User.me();
    const normalized = payload.created_by
      ? payload
      : { ...payload, created_by: user.email };
    return cycleLogStore.create(normalized);
  },
  update: (id, patch) => cycleLogStore.update(id, patch),
  delete: (id) => cycleLogStore.delete(id)
};

