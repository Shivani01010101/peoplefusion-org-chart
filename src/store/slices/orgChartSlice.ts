import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { orgChartService } from "../../services/orgChart.service";

/**
 * Tree node structure from API response
 */
export interface TreeNode {
  employee_id?: number;
  id?: number;
  target: string; // Employee name
  pic?: string; // Profile picture URL
  direct_reports?: number;
  indirect_reports?: number;
  relationship_id?: string;
  effective_start_date?: string;
  effective_end_date?: string;
  children?: TreeNode[];
  [key: string]: any;
}

/**
 * API Response structure
 */
export interface OrgChartApiResponse {
  status: string;
  tree: TreeNode;
}

/**
 * Transformed employee data for UI
 */
export interface EmployeeData {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  position?: string;
  department?: string;
  location?: string;
  fte?: string;
  email?: string;
  phone?: string;
  directReports?: number;
  indirectReports?: number;
  relationshipId?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  children?: EmployeeData[];
  [key: string]: any;
}

/**
 * Available chart view types
 */
export type ChartViewType = "People" | "Position" | "Organization" | "Others";

/**
 * Position node structure for Position view
 */
export interface PositionData {
  id: string; // Position ID (e.g., "CEO", "Manager")
  name: string; // Position title (e.g., "Sales Manager")
  position: string; // Position title (same as name)
  department?: string; // Department/Team (e.g., "Direct Sales")
  location?: string; // Location (e.g., "Madrid")
  employeeName?: string; // Primary employee name in this position (e.g., "Laura Castillo")
  fte?: string; // FTE information (e.g., "1 / 1 FTE")
  employees: EmployeeData[]; // People in this position
  children?: PositionData[]; // Sub-positions
  directReports?: number;
  indirectReports?: number;
  containsCount?: number; // Number of direct reports (for "Contains X" button)
}

/**
 * Organization node structure for Organization view
 */
export interface OrganizationData {
  id: string; // Department/Unit ID
  name: string; // Department/Unit name
  department?: string;
  employees: EmployeeData[]; // People in this department
  children?: OrganizationData[]; // Sub-departments
  directReports?: number;
  indirectReports?: number;
}

/**
 * Org Chart State
 */
interface OrgChartState {
  // API states
  loading: boolean;
  success: boolean;
  error: string | null;

  // Data
  orgChartData: OrgChartApiResponse | null;
  treeData: TreeNode | null;

  // UI states
  activeTab: ChartViewType;
  selectedEmployee: EmployeeData | null;
  sidebarEmployee: EmployeeData | null;
  isSidebarOpen: boolean;

  // Search
  searchQuery: string;
  searchResults: EmployeeData[];
  highlightedEmployeeId: number | null;
}

const initialState: OrgChartState = {
  loading: false,
  success: false,
  error: null,
  orgChartData: null,
  treeData: null,
  activeTab: "People",
  selectedEmployee: null,
  sidebarEmployee: null,
  isSidebarOpen: false,
  searchQuery: "",
  searchResults: [],
  highlightedEmployeeId: null,
};

/**
 * Transform tree node to employee data
 */
function transformTreeNodeToEmployee(node: TreeNode): EmployeeData {
  const nameParts = node.target?.trim().split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    id: node.employee_id || node.id || 0,
    name: node.target || "",
    firstName,
    lastName,
    profilePic: node.pic,
    directReports: node.direct_reports,
    indirectReports: node.indirect_reports,
    relationshipId: node.relationship_id,
    effectiveStartDate: node.effective_start_date,
    effectiveEndDate: node.effective_end_date,
    children: node.children?.map(transformTreeNodeToEmployee),
  };
}

/**
 * Flatten tree structure for search
 */
function flattenTree(
  node: TreeNode,
  result: EmployeeData[] = []
): EmployeeData[] {
  const employee = transformTreeNodeToEmployee(node);
  result.push(employee);

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      flattenTree(child, result);
    });
  }

  return result;
}

/**
 * Transform tree to Position view structure
 * Groups employees by their position/title
 */
export function transformToPositionView(node: TreeNode): PositionData | null {
  const employee = transformTreeNodeToEmployee(node);
  // Extract position from relationship_id or use a default
  const position =
    node.relationship_id || employee.position || "Unknown Position";

  // Extract additional position details
  const department = employee.department || node.department;
  const location = node.location || employee.location;
  const fte = node.fte || employee.fte || "1 / 1 FTE";

  // Group children by position
  const positionMap = new Map<string, EmployeeData[]>();
  const positionChildren: PositionData[] = [];

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      const childEmployee = transformTreeNodeToEmployee(child);
      const childPosition =
        childEmployee.position ||
        childEmployee.relationshipId ||
        "Unknown Position";

      if (!positionMap.has(childPosition)) {
        positionMap.set(childPosition, []);
      }
      positionMap.get(childPosition)!.push(childEmployee);
    });

    // Create position nodes
    positionMap.forEach((employees, posName) => {
      // Get primary employee for position details
      const primaryEmp = employees[0];
      const posNode: PositionData = {
        id: `pos-${posName}`,
        name: posName,
        position: posName,
        department: primaryEmp?.department,
        location: primaryEmp?.location,
        employeeName: primaryEmp?.name,
        fte: primaryEmp?.fte || "1 / 1 FTE",
        employees: employees,
        directReports: employees.reduce(
          (sum, emp) => sum + (emp.directReports || 0),
          0
        ),
        indirectReports: employees.reduce(
          (sum, emp) => sum + (emp.indirectReports || 0),
          0
        ),
        containsCount: employees.reduce(
          (sum, emp) => sum + (emp.directReports || 0),
          0
        ),
      };

      // Recursively process children positions
      const childPositions: PositionData[] = [];
      employees.forEach((emp) => {
        const originalNode = findNodeInTree(node, emp.id);
        if (originalNode && originalNode.children) {
          originalNode.children.forEach((child) => {
            const childPos = transformToPositionView(child);
            if (childPos) {
              childPositions.push(childPos);
            }
          });
        }
      });

      // Merge child positions if they have the same position name
      const mergedPositions = new Map<string, PositionData>();
      childPositions.forEach((pos) => {
        if (mergedPositions.has(pos.position)) {
          const existing = mergedPositions.get(pos.position)!;
          existing.employees.push(...pos.employees);
        } else {
          mergedPositions.set(pos.position, pos);
        }
      });

      posNode.children = Array.from(mergedPositions.values());
      positionChildren.push(posNode);
    });
  }

  return {
    id: `pos-${position}`,
    name: position,
    position: position,
    department: department,
    location: location,
    employeeName: employee.name,
    fte: fte,
    employees: [employee],
    children: positionChildren.length > 0 ? positionChildren : undefined,
    directReports: employee.directReports,
    indirectReports: employee.indirectReports,
    containsCount: employee.directReports || 0,
  };
}

/**
 * Transform tree to Organization view structure
 * Groups employees by department/organizational unit
 */
export function transformToOrganizationView(
  node: TreeNode
): OrganizationData | null {
  const employee = transformTreeNodeToEmployee(node);
  // Extract department from node or use a default
  const department = node.department || employee.department || "General";

  // Group children by department
  const deptMap = new Map<string, EmployeeData[]>();
  const deptChildren: OrganizationData[] = [];

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      const childEmployee = transformTreeNodeToEmployee(child);
      const childDept = childEmployee.department || "General";

      if (!deptMap.has(childDept)) {
        deptMap.set(childDept, []);
      }
      deptMap.get(childDept)!.push(childEmployee);
    });

    // Create department nodes
    deptMap.forEach((employees, deptName) => {
      const deptNode: OrganizationData = {
        id: `dept-${deptName}`,
        name: deptName,
        department: deptName,
        employees: employees,
        directReports: employees.reduce(
          (sum, emp) => sum + (emp.directReports || 0),
          0
        ),
        indirectReports: employees.reduce(
          (sum, emp) => sum + (emp.indirectReports || 0),
          0
        ),
      };

      // Recursively process children departments
      const childDepts: OrganizationData[] = [];
      employees.forEach((emp) => {
        const originalNode = findNodeInTree(node, emp.id);
        if (originalNode && originalNode.children) {
          originalNode.children.forEach((child) => {
            const childDept = transformToOrganizationView(child);
            if (childDept) {
              childDepts.push(childDept);
            }
          });
        }
      });

      // Merge child departments if they have the same department name
      const mergedDepts = new Map<string, OrganizationData>();
      childDepts.forEach((dept) => {
        if (mergedDepts.has(dept.department || "General")) {
          const existing = mergedDepts.get(dept.department || "General")!;
          existing.employees.push(...dept.employees);
        } else {
          mergedDepts.set(dept.department || "General", dept);
        }
      });

      deptNode.children = Array.from(mergedDepts.values());
      deptChildren.push(deptNode);
    });
  }

  return {
    id: `dept-${department}`,
    name: department,
    department: department,
    employees: [employee],
    children: deptChildren.length > 0 ? deptChildren : undefined,
    directReports: employee.directReports,
    indirectReports: employee.indirectReports,
  };
}

/**
 * Helper function to find a node in the tree by employee ID
 */
function findNodeInTree(node: TreeNode, targetId: number): TreeNode | null {
  if ((node.employee_id || node.id) === targetId) {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeInTree(child, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Async thunk to fetch org chart data
 *
 * Fetches organizational chart data for a specific employee from the API.
 * The API returns data in the format: { status: "OK", tree: TreeNode }
 *
 * @param employeeId - The unique identifier of the employee
 * @returns Promise resolving to OrgChartApiResponse or rejecting with error message
 */
export const fetchOrgChart = createAsyncThunk(
  "orgChart/fetchOrgChart",
  async (employeeId: number, { rejectWithValue }) => {
    try {
      // Service returns properly typed OrgChartApiResponse
      const response = await orgChartService.getPeopleChart(employeeId);
      return response;
    } catch (error: unknown) {
      // Type-safe error handling
      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return rejectWithValue(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Failed to fetch organizational chart"
      );
    }
  }
);

/**
 * Org Chart Slice
 */
const orgChartSlice = createSlice({
  name: "orgChart",
  initialState,
  reducers: {
    // Set selected employee (for highlighting in chart)
    setSelectedEmployee: (
      state,
      action: PayloadAction<EmployeeData | null>
    ) => {
      state.selectedEmployee = action.payload;
    },

    // Set sidebar employee (for displaying details)
    setSidebarEmployee: (state, action: PayloadAction<EmployeeData | null>) => {
      state.sidebarEmployee = action.payload;
      state.isSidebarOpen = action.payload !== null;
    },

    // Toggle sidebar
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
      if (!state.isSidebarOpen) {
        state.sidebarEmployee = null;
      }
    },

    // Close sidebar
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
      state.sidebarEmployee = null;
    },

    // Set search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;

      // Perform search if we have tree data
      if (state.treeData && action.payload.trim()) {
        const allEmployees = flattenTree(state.treeData);
        const query = action.payload.toLowerCase().trim();
        state.searchResults = allEmployees.filter(
          (emp) =>
            emp.name.toLowerCase().includes(query) ||
            emp.firstName?.toLowerCase().includes(query) ||
            emp.lastName?.toLowerCase().includes(query) ||
            emp.position?.toLowerCase().includes(query)
        );
      } else {
        state.searchResults = [];
        state.highlightedEmployeeId = null;
      }
    },

    // Set highlighted employee (for search results)
    setHighlightedEmployee: (state, action: PayloadAction<number | null>) => {
      state.highlightedEmployeeId = action.payload;
    },

    // Clear search
    clearSearch: (state) => {
      state.searchQuery = "";
      state.searchResults = [];
      state.highlightedEmployeeId = null;
    },

    // Set active tab/view type
    setActiveTab: (state, action: PayloadAction<ChartViewType>) => {
      state.activeTab = action.payload;
      // Clear search when switching tabs
      state.searchQuery = "";
      state.searchResults = [];
      state.highlightedEmployeeId = null;
    },

    // Reset state
    resetOrgChart: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.orgChartData = null;
      state.treeData = null;
      state.activeTab = "People";
      state.selectedEmployee = null;
      state.sidebarEmployee = null;
      state.isSidebarOpen = false;
      state.searchQuery = "";
      state.searchResults = [];
      state.highlightedEmployeeId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch org chart - pending
      .addCase(fetchOrgChart.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      // Fetch org chart - fulfilled
      .addCase(
        fetchOrgChart.fulfilled,
        (state, action: PayloadAction<OrgChartApiResponse>) => {
          state.loading = false;
          state.success = true;
          state.error = null;
          state.orgChartData = action.payload;
          state.treeData = action.payload.tree;

          // Transform root employee and set as selected by default
          if (action.payload.tree) {
            state.selectedEmployee = transformTreeNodeToEmployee(
              action.payload.tree
            );
          }
        }
      )
      // Fetch org chart - rejected
      .addCase(fetchOrgChart.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error =
          (action.payload as string) || "Failed to fetch organizational chart";
        state.orgChartData = null;
        state.treeData = null;
      });
  },
});

export const {
  setSelectedEmployee,
  setSidebarEmployee,
  toggleSidebar,
  closeSidebar,
  setSearchQuery,
  setHighlightedEmployee,
  clearSearch,
  setActiveTab,
  resetOrgChart,
} = orgChartSlice.actions;

export default orgChartSlice.reducer;
