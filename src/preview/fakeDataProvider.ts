import type {
  CreateParams,
  DataProvider,
  DeleteManyParams,
  DeleteParams,
  GetListParams,
  GetManyParams,
  GetOneParams,
  RaRecord,
  UpdateManyParams,
  UpdateParams,
} from "react-admin";

/**
 * In-memory data provider for the theme preview.
 *
 * The preview exists to judge how the app looks, so it must not need a
 * backend, a session or a database. Records are generated once per resource
 * and mutated in memory; nothing is persisted and nothing is fetched.
 */

const NAMES = [
  "Quantum Chemistry",
  "Lattice Gauge Theory",
  "Portfolio Optimisation",
  "Error Mitigation",
  "Variational Solvers",
  "Pulse Calibration",
  "Benchmarking Suite",
  "Materials Screening",
];
const ORGS = [
  "LINKS Foundation",
  "Politecnico di Torino",
  "INRiM",
  "CINECA",
];
const STATUSES = ["completed", "ready", "failed", "submitted"];
/** A plausible controlled vocabulary, so the tag screens have something to show. */
const TAGS = [
  "chemistry",
  "materials",
  "optimisation",
  "benchmarking",
  "error-mitigation",
  "industry",
].map((name, i) => ({ id: i + 1, name }));

const rows = (resource: string): RaRecord[] => {
  if (resource === "tags") return TAGS;

  const n = 24;
  return Array.from({ length: n }, (_, i) => {
    const id = i + 1;
    const base = { id };
    switch (resource) {
      case "jobs":
        return {
          ...base,
          jobid: `job-${1000 + id}`,
          status: STATUSES[i % STATUSES.length],
          project_name: NAMES[i % NAMES.length],
          organization_name: ORGS[i % ORGS.length],
          duration: Number((Math.random() * 900).toFixed(3)),
          submitted_datetime: new Date(Date.now() - i * 36e5).toISOString(),
        };
      case "organizations":
        return {
          ...base,
          name: ORGS[i % ORGS.length],
          initial_budget: 1000 * (i + 1),
          remaining_budget: 640 * (i + 1),
        };
      case "users":
        return {
          ...base,
          email: `user${id}@example.org`,
          organization_name: ORGS[i % ORGS.length],
          pulla_user: i % 3 === 0,
        };
      case "notifications":
        return {
          ...base,
          title: i % 2 ? "login" : "reservation confirmed",
          description: `Notification ${id}`,
          read: i % 4 !== 0,
        };
      default:
        return {
          ...base,
          name: NAMES[i % NAMES.length],
          organization_name: ORGS[i % ORGS.length],
          free_queue: i % 2 === 0,
          remaining_budget: 3_600_000 - i * 12_345,
          description: "Preview record — not real data.",
          // Projects carry their tags in the read payload, so the fake has to
          // as well or the chips would look like they need a request.
          tags: TAGS.slice(i % 3, (i % 3) + (i % 4)),
        };
    }
  });
};

const store = new Map<string, RaRecord[]>();
const get = (resource: string) => {
  if (!store.has(resource)) store.set(resource, rows(resource));
  return store.get(resource)!;
};

/**
 * `DataProvider`'s methods are generic in the record type; a fake that serves a
 * fixed shape per resource cannot satisfy that per-call generic. One cast at
 * the boundary is honest about it — the alternative is `any` on every method.
 */
const provider = {
  getList: async (resource: string, params: GetListParams) => {
    const data = get(resource);
    const { page = 1, perPage = 10 } = params.pagination ?? {};
    return {
      data: data.slice((page - 1) * perPage, page * perPage),
      total: data.length,
    };
  },
  getOne: async (resource: string, params: GetOneParams) => ({
    data: get(resource).find((r) => String(r.id) === String(params.id))!,
  }),
  getMany: async (resource: string, params: GetManyParams) => ({
    data: get(resource).filter((r) =>
      params.ids.map(String).includes(String(r.id)),
    ),
  }),
  getManyReference: async (resource: string) => ({
    data: get(resource).slice(0, 5),
    total: 5,
  }),
  create: async (resource: string, params: CreateParams) => {
    const data = get(resource);
    const record = { ...params.data, id: data.length + 1 } as RaRecord;
    data.push(record);
    return { data: record };
  },
  update: async (resource: string, params: UpdateParams) => {
    const data = get(resource);
    const i = data.findIndex((r) => String(r.id) === String(params.id));
    if (i >= 0) data[i] = { ...data[i], ...params.data };
    return { data: data[i] };
  },
  updateMany: async (_resource: string, params: UpdateManyParams) => ({
    data: params.ids,
  }),
  delete: async (resource: string, params: DeleteParams) => {
    const data = get(resource);
    const i = data.findIndex((r) => String(r.id) === String(params.id));
    const [removed] = data.splice(i, 1);
    return { data: removed };
  },
  deleteMany: async (resource: string, params: DeleteManyParams) => {
    store.set(
      resource,
      get(resource).filter(
        (r) => !params.ids.map(String).includes(String(r.id)),
      ),
    );
    return { data: params.ids };
  },
};

export const fakeDataProvider = provider as unknown as DataProvider;
