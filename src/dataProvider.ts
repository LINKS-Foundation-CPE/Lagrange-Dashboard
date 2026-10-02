import simpleRestProvider from "ra-data-simple-rest";
import {
  CreateParams,
  fetchUtils,
  HttpError,
  GetListParams,
  GetManyParams,
  GetManyReferenceParams,
  Identifier,
  QueryFunctionContext,
  UpdateParams,
} from "react-admin";
import { tokenService } from "./services/tokenService";
import { Tag } from "./services/tags";

// http client used to pass authentication token to backend
const httpClient = (url: string, options: any = {}) => {
  const token = tokenService.getToken(); //localStorage.getItem("backendToken");
  options.headers = new Headers(options.headers || {});
  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  } else {
    console.warn("No authentication token!");
  }
  return fetchUtils.fetchJson(url, options);
};

// TODO switch from Content-Range header to X-Total-Count
// https://github.com/marmelab/react-admin/tree/master/packages/ra-data-simple-rest#replacing-content-range-with-another-header
const baseDataProvider = simpleRestProvider(
  import.meta.env.VITE_API_URL,
  httpClient,
);

const dataProvider = {
  ...baseDataProvider,

  getManyReference: (
    resource: string,
    params: GetManyReferenceParams & QueryFunctionContext,
  ) => {
    if (resource === "projects_users") {
      const { id, ...restFilter } = params.filter || {};

      // map virtual resource to real api
      const realResource = `projects/${id}/users`;

      // map params for getList
      const newParams = {
        filter: restFilter,
        pagination: params.pagination,
        sort: params.sort,
      };

      return baseDataProvider.getList(realResource, newParams);
    }

    if (resource === "user_projects") {
      const { id, ...restFilter } = params.filter || {};

      // map virtual resource to real api
      const realResource = `users/${id}/projects`;

      // map params for getList
      const newParams = {
        filter: restFilter,
        pagination: params.pagination,
        sort: params.sort,
      };

      return baseDataProvider.getList(realResource, newParams);
    }

    if (resource === "user_jobs") {
      const { id, ...restFilter } = params.filter || {};

      // map virtual resource to real api
      const realResource = `users/${id}/jobs`;

      // map params for getList
      const newParams = {
        filter: restFilter,
        pagination: params.pagination,
        sort: params.sort,
      };

      return baseDataProvider.getList(realResource, newParams);
    }

    if (resource === "project_transactions") {
      const { id, ...restFilter } = params.filter || {};

      // map virtual resource to real api
      const realResource = `projects/${id}/transactions`;

      // map params for getList
      const newParams = {
        filter: restFilter,
        pagination: params.pagination,
        sort: params.sort,
      };

      return baseDataProvider.getList(realResource, newParams);
    }

    if (resource === "project_jobs") {
      const { id, ...restFilter } = params.filter || {};

      // map virtual resource to real api
      const realResource = `projects/${id}/jobs`;

      // map params for getList
      const newParams = {
        filter: restFilter,
        pagination: params.pagination,
        sort: params.sort,
      };

      return baseDataProvider.getList(realResource, newParams);
    }

    if (resource === "organization_jobs") {
      const { id, ...restFilter } = params.filter || {};

      // map virtual resource to real api
      const realResource = `organizations/${id}/jobs`;

      // map params for getList
      const newParams = {
        filter: restFilter,
        pagination: params.pagination,
        sort: params.sort,
      };

      return baseDataProvider.getList(realResource, newParams);
    }

    // if (resource === "organization_roles") {
    //   const { id } = params.filter;
    //   const url = `${import.meta.env.VITE_API_URL}/organizations/${id}/roles`;

    //   return httpClient(url).then(({ json }) => {
    //     console.log("Data: ", json);
    //     const results = json.map((el) => {
    //       return {
    //         id: el.user_id,
    //         user_id: el.user_id,
    //         role_id: el.role_id,
    //       };
    //     });
    //     return {
    //       data: results,
    //       total: json.length,
    //     };
    //   });
    // }
    return baseDataProvider.getManyReference(resource, params);
  },

  create: (resource: string, params: CreateParams<any>) => {
    console.log("dataProvider Create");
    console.log("Resource: ", resource);
    console.log("Params: ", params);
    if (resource === "organization_roles") {
      const id = params.data.organization_id;
      const url = `${import.meta.env.VITE_API_URL}/organizations/${id}/roles`;

      return httpClient(url, {
        method: "POST",
        body: JSON.stringify(params.data),
      }).then(({ json }) => ({
        data: json,
      }));
    }

    if (resource === "projects_users") {
      const id = params.data.project_id;
      const url = `${import.meta.env.VITE_API_URL}/projects/${id}/users`;

      return httpClient(url, {
        method: "POST",
        body: JSON.stringify(params.data),
      }).then(({ json }) => ({
        data: json,
      }));
    }
    // if (resource === "organization_roles") {
    //   //const formData = createPostFormData(params);
    //   return fetchUtils
    //     .fetchJson(`${endpoint}/${resource}`, {
    //       method: "POST",
    //       body: formData,
    //     })
    //     .then(({ json }) => ({ data: json }));
    // }
    return baseDataProvider.create(resource, params);
  },
  update: (resource: string, params: UpdateParams<any>) => {
    console.log("dataProvider update");
    // if (resource === "posts") {
    //   const formData = createPostFormData(params);
    //   formData.append("id", params.id);
    //   return fetchUtils
    //     .fetchJson(`${endpoint}/${resource}`, {
    //       method: "PUT",
    //       body: formData,
    //     })
    //     .then(({ json }) => ({ data: json }));
    // }
    return baseDataProvider.update(resource, params);
  },
  // getOne:     (resource, params) => {

  // }
  budgetTransaction: async (data) => {
    const { organizationId, sourceProjectId, destinationProjectId, amount } =
      data;
    const url = `${import.meta.env.VITE_API_URL}/organizations/${organizationId}/budgetTransfer`;

    console.log(data);

    return httpClient(url, {
      method: "POST",
      body: JSON.stringify({ sourceProjectId, destinationProjectId, amount }),
    }).then(({ json }) => ({
      data: json,
    }));

    // if (!response.ok) {
    //   const error = await response.text();
    //   throw new Error(error || 'Request failed');
    // }

    // const json = await response.json().catch(() => ({})); // handle empty body
    // return { data: json };
  },
  /**
   * Replaces the set of tags a project carries.
   *
   * Its own call, and not a field on `update("projects", ...)`, because the
   * backend splits the two on purpose: `PUT /projects/:id` is admin and
   * organization-manager only, while `PUT /projects/:id/tags` is also open to
   * the project's own admins. A PI can therefore tag a project whose other
   * fields they may not touch — and nothing the project form submits can carry
   * `tags` into a request that would be refused for them.
   *
   * The body is ids, never names: an id outside the vocabulary is a 400 rather
   * than a new tag, which is what an admin-defined vocabulary is for. The set
   * is replaced wholesale, so an empty array clears the project's tags.
   */
  setProjectTags: (projectId: Identifier, tagIds: number[]) => {
    const url = `${import.meta.env.VITE_API_URL}/projects/${projectId}/tags`;
    return httpClient(url, {
      method: "PUT",
      body: JSON.stringify({ tag_ids: tagIds }),
    }).then(({ json }) => ({ data: json as Tag[] }));
  },

  // Recurring series. A refused series (409) is an answer, not a failure: its
  // body is the same per-occurrence report a preview returns, and the form
  // shows it, so it is returned rather than thrown.
  createSeries: async (resource: "slots" | "reservations", body: object) => {
    const url = `${import.meta.env.VITE_API_URL}/${resource}/series`;
    try {
      const { json } = await httpClient(url, {
        method: "POST",
        body: JSON.stringify(body),
      });
      return { data: json };
    } catch (error) {
      if (error instanceof HttpError && error.status === 409) {
        return { data: error.body };
      }
      throw error;
    }
  },

  deleteSeries: async (resource: "slots" | "reservations", seriesId: string) => {
    const url = `${import.meta.env.VITE_API_URL}/${resource}/series/${seriesId}`;
    return httpClient(url, { method: "DELETE" }).then(({ json }) => ({
      data: json,
    }));
  },

  markNotificationAsRead: async (id: string) => {
    const url = `${import.meta.env.VITE_API_URL}/notifications/${id}/read`;
    return httpClient(url, {
      method: "PATCH",
      //body: JSON.stringify({ sourceProjectId, destinationProjectId, amount }),
    }).then(({ json }) => ({
      data: json,
    }));
  },

  /**
   * Every billing report for one period, in a single call.
   *
   * `/reports/summary` exists so the sections of a report cannot end up on
   * different periods; the backend does the aggregation, and role scoping is
   * applied there too.
   */
  getBillingReports: async (from: string, to: string) => {
    const query = new URLSearchParams({ from, to }).toString();
    const url = `${import.meta.env.VITE_API_URL}/reports/summary?${query}`;
    return httpClient(url, { method: "GET" }).then(({ json }) => ({
      data: json,
    }));
  },

  // USER own stuff
  getOwnProjects: async () => {
    const url = `${import.meta.env.VITE_API_URL}/own/projects`;
    return httpClient(url, {
      method: "GET",
      //body: JSON.stringify({ sourceProjectId, destinationProjectId, amount }),
    }).then(({ json }) => ({
      data: json,
    }));
  },

  getDefaultProject: () => {
    const url = `${import.meta.env.VITE_API_URL}/own/default_project`;
    return httpClient(url, {
      method: "GET",
      //body: JSON.stringify({ sourceProjectId, destinationProjectId, amount }),
    }).then(({ json }) => ({
      data: json,
    }));
  },

  setDefaultProject: (projectId: string) => {
    const url = `${import.meta.env.VITE_API_URL}/own/default_project`;
    return httpClient(url, {
      method: "PUT",
      body: JSON.stringify({ default_project_id: projectId }),
    }).then(({ json }) => ({
      data: json,
    }));
  },
};

console.log(dataProvider);

export default dataProvider;
