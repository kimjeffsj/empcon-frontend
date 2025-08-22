import { 
  CreateEmployeeRequest, 
  UpdateEmployeeRequest, 
  EmployeeListRequest,
  EmployeeResponse,
  EmployeeListResponse,
  ApiResponse 
} from "@empcon/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002/api";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error", 0, error);
  }
}

export const employeeApi = {
  // Get all employees with filtering and pagination
  async getEmployees(params?: Partial<EmployeeListRequest>): Promise<EmployeeListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.departmentId) searchParams.append("departmentId", params.departmentId);
    if (params?.positionId) searchParams.append("positionId", params.positionId);
    if (params?.managerId) searchParams.append("managerId", params.managerId);
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const queryString = searchParams.toString();
    const endpoint = `/employees${queryString ? `?${queryString}` : ""}`;
    
    return makeRequest<EmployeeListResponse>(endpoint);
  },

  // Get employee by ID
  async getEmployeeById(id: string): Promise<ApiResponse<EmployeeResponse>> {
    return makeRequest<ApiResponse<EmployeeResponse>>(`/employees/${id}`);
  },

  // Create new employee
  async createEmployee(data: CreateEmployeeRequest): Promise<ApiResponse<EmployeeResponse>> {
    return makeRequest<ApiResponse<EmployeeResponse>>("/employees", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update existing employee
  async updateEmployee(id: string, data: UpdateEmployeeRequest): Promise<ApiResponse<EmployeeResponse>> {
    return makeRequest<ApiResponse<EmployeeResponse>>(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete employee (soft delete)
  async deleteEmployee(id: string): Promise<ApiResponse> {
    return makeRequest<ApiResponse>(`/employees/${id}`, {
      method: "DELETE",
    });
  },
};

export const departmentApi = {
  // Get all departments
  async getDepartments(): Promise<ApiResponse<Array<{ id: string; name: string; description?: string }>>> {
    return makeRequest<ApiResponse<Array<{ id: string; name: string; description?: string }>>>("/departments");
  },

  // Create new department
  async createDepartment(data: { name: string; description?: string; managerId?: string }): Promise<ApiResponse> {
    return makeRequest<ApiResponse>("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update department
  async updateDepartment(id: string, data: { name?: string; description?: string; managerId?: string }): Promise<ApiResponse> {
    return makeRequest<ApiResponse>(`/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete department
  async deleteDepartment(id: string): Promise<ApiResponse> {
    return makeRequest<ApiResponse>(`/departments/${id}`, {
      method: "DELETE",
    });
  },
};

export const positionApi = {
  // Get all positions
  async getPositions(): Promise<ApiResponse<Array<{ id: string; title: string; departmentId: string; description?: string }>>> {
    return makeRequest<ApiResponse<Array<{ id: string; title: string; departmentId: string; description?: string }>>>("/positions");
  },

  // Create new position
  async createPosition(data: { title: string; departmentId: string; description?: string }): Promise<ApiResponse> {
    return makeRequest<ApiResponse>("/positions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update position
  async updatePosition(id: string, data: { title?: string; departmentId?: string; description?: string }): Promise<ApiResponse> {
    return makeRequest<ApiResponse>(`/positions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete position
  async deletePosition(id: string): Promise<ApiResponse> {
    return makeRequest<ApiResponse>(`/positions/${id}`, {
      method: "DELETE",
    });
  },
};

export { ApiError };